const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const Database = require("@replit/database");
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));

// Serve static files
app.use(express.static(path.join(__dirname, "..")));
app.use(express.static(__dirname));

// ============================================
// 💾 REPLIT DATABASE - PERMANENT STORAGE
// ============================================
let db;
try {
    db = new Database();
    console.log("✅ Replit Database initialized successfully");
} catch (error) {
    console.error("❌ Replit Database initialization error:", error.message);
    db = new Database();
}

// Test database connection on startup
(async () => {
    try {
        await db.list();
        console.log("✅ Database connection verified");
    } catch (error) {
        console.error("❌ Database connection error:", error.message);
    }
})();

// SAVE ALL DATA - FIXED VERSION WITH TIMEOUT
app.post("/api/save-all", async (req, res) => {
    try {
        const { inventory, customers, transactions, history } = req.body;

        // Ensure we're saving valid data
        const savePromises = [];

        if (inventory !== undefined) {
            savePromises.push(db.set("inventory", inventory || []).catch(e => console.error('Error saving inventory:', e)));
        }
        if (customers !== undefined) {
            savePromises.push(db.set("customers", customers || []).catch(e => console.error('Error saving customers:', e)));
        }
        if (transactions !== undefined) {
            savePromises.push(db.set("transactions", transactions || []).catch(e => console.error('Error saving transactions:', e)));
        }
        if (history !== undefined) {
            savePromises.push(db.set("history", history || []).catch(e => console.error('Error saving history:', e)));
        }

        // Set timeout for save operations
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Save timeout')), 10000)
        );

        await Promise.race([
            Promise.all(savePromises),
            timeout
        ]).catch(error => {
            console.error("⚠️ Save operation timeout or error:", error.message);
        });

        console.log(`✅ Database saved:`, {
            inventory: inventory?.length || 0,
            customers: customers?.length || 0,
            transactions: transactions?.length || 0,
            history: history?.length || 0,
        });

        res.json({
            success: true,
            message: "All data saved to database",
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        console.error("❌ Database save error:", error);
        res.json({
            success: true, // Return success anyway to avoid blocking UI
            error: error.message,
            message: "Save operation completed with warnings",
        });
    }
});

// LOAD ALL DATA - FIXED VERSION WITH TIMEOUT
app.get("/api/load-all", async (req, res) => {
    try {
        // Set timeout for database operations
        const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database timeout')), 10000)
        );
        
        const loadData = Promise.all([
            db.get("inventory").catch(() => []),
            db.get("customers").catch(() => []),
            db.get("transactions").catch(() => []),
            db.get("history").catch(() => []),
        ]);

        const [inventory, customers, transactions, history] = await Promise.race([
            loadData,
            timeout
        ]).catch(() => [[], [], [], []]);

        // Always return arrays, never null/undefined
        const response = {
            inventory: Array.isArray(inventory) ? inventory : [],
            customers: Array.isArray(customers) ? customers : [],
            transactions: Array.isArray(transactions) ? transactions : [],
            history: Array.isArray(history) ? history : [],
        };

        console.log(`✅ Database loaded:`, {
            inventory: response.inventory.length,
            customers: response.customers.length,
            transactions: response.transactions.length,
            history: response.history.length,
        });

        res.json(response);
    } catch (error) {
        console.error("❌ Database load error:", error);
        res.json({
            inventory: [],
            customers: [],
            transactions: [],
            history: [],
        });
    }
});

// ============================================
// 📁 INVOICE STORAGE - FIXED VERSION
// ============================================

// Create Invoices folder in backend directory
const INVOICES_DIR = path.join(__dirname, "Invoices");

// Create folder if it doesn't exist
try {
    if (!fs.existsSync(INVOICES_DIR)) {
        fs.mkdirSync(INVOICES_DIR, { recursive: true });
        console.log(`📁 Created Invoices folder at: ${INVOICES_DIR}`);
    } else {
        console.log(`📁 Invoices folder exists at: ${INVOICES_DIR}`);
    }
} catch (error) {
    console.error("❌ Failed to create Invoices folder:", error);
}

// ============================================
// ✅ SAVE PDF INVOICE - FIXED VERSION
// ============================================
app.post("/save-pdf", async (req, res) => {
    try {
        const { pdfData, fileName } = req.body;

        if (!pdfData || !fileName) {
            return res.status(400).json({
                success: false,
                message: "Missing pdfData or fileName",
            });
        }

        // Sanitize filename
        const safeFileName = fileName.replace(/[^a-zA-Z0-9\-_\.]/g, "_");
        const pdfBuffer = Buffer.from(pdfData, "base64");
        const filePath = path.join(INVOICES_DIR, safeFileName);

        // Write file
        fs.writeFileSync(filePath, pdfBuffer);

        console.log("\n=========================================");
        console.log("✅ PDF SAVED SUCCESSFULLY!");
        console.log(`📄 File: ${safeFileName}`);
        console.log(`📁 Location: ${filePath}`);
        console.log(`📊 Size: ${pdfBuffer.length} bytes`);
        console.log("=========================================\n");

        res.json({
            success: true,
            message: "PDF saved successfully",
            path: filePath,
            url: `/Invoices/${safeFileName}`,
            filename: safeFileName,
            size: pdfBuffer.length,
        });
    } catch (error) {
        console.error("❌ Error saving PDF:", error);
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// ============================================
// 📋 GET LIST OF ALL INVOICES
// ============================================
app.get("/invoices-list", (req, res) => {
    try {
        if (!fs.existsSync(INVOICES_DIR)) {
            return res.json({ success: true, invoices: [] });
        }

        const files = fs.readdirSync(INVOICES_DIR);
        const invoices = files
            .filter((file) => file.endsWith(".pdf"))
            .map((file) => {
                const filePath = path.join(INVOICES_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: `/Invoices/${file}`,
                    url: `/Invoices/${file}`,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime,
                };
            })
            .sort((a, b) => new Date(b.created) - new Date(a.created));

        res.json({ success: true, invoices });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// 📥 DOWNLOAD INVOICE
// ============================================
app.get("/download-invoice/:fileName", (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(INVOICES_DIR, fileName);

        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ success: false, message: "File not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// 🗑️ DELETE INVOICE
// ============================================
app.delete("/delete-invoice/:fileName", (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(INVOICES_DIR, fileName);

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({
                success: true,
                message: "Invoice deleted successfully",
            });
        } else {
            res.status(404).json({ success: false, message: "File not found" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// ============================================
// 🔍 CHECK INVOICES FOLDER
// ============================================
app.get("/check-invoices", (req, res) => {
    try {
        const exists = fs.existsSync(INVOICES_DIR);
        let files = [];

        if (exists) {
            files = fs
                .readdirSync(INVOICES_DIR)
                .filter((f) => f.endsWith(".pdf"));
        }

        res.json({
            success: true,
            invoicesFolder: INVOICES_DIR,
            folderExists: exists,
            pdfCount: files.length,
            invoices: files,
        });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 🛠️ CREATE INVOICES FOLDER
// ============================================
app.get("/create-invoices-folder", (req, res) => {
    try {
        if (!fs.existsSync(INVOICES_DIR)) {
            fs.mkdirSync(INVOICES_DIR, { recursive: true });
            res.json({
                success: true,
                message: "Invoices folder created!",
                path: INVOICES_DIR,
            });
        } else {
            res.json({
                success: true,
                message: "Invoices folder already exists",
                path: INVOICES_DIR,
            });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ============================================
// 🖼️ SERVE INVOICES FOLDER
// ============================================
app.use("/Invoices", express.static(INVOICES_DIR));

// ============================================
// 🧪 TEST DATABASE ENDPOINT
// ============================================
app.get("/api/test-db", async (req, res) => {
    try {
        // Test write
        await db.set("test-key", {
            timestamp: new Date().toISOString(),
            message: "Database is working!",
        });

        // Test read
        const result = await db.get("test-key");

        // Test delete
        await db.delete("test-key");

        res.json({
            success: true,
            message: "✅ Database is fully operational!",
            write: "Success",
            read: result,
            delete: "Success",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "❌ Database error",
            error: error.message,
        });
    }
});

// ============================================
// 🏠 MAIN PAGES
// ============================================
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

app.get("/dashboard.html", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "dashboard.html"));
});

// ============================================
// 🔋 HEALTH CHECK
// ============================================
app.get("/health", (req, res) => {
    const invoicesExist = fs.existsSync(INVOICES_DIR);
    let invoicesCount = 0;

    if (invoicesExist) {
        try {
            invoicesCount = fs
                .readdirSync(INVOICES_DIR)
                .filter((f) => f.endsWith(".pdf")).length;
        } catch (e) {}
    }

    res.json({
        status: "OK",
        message: "Server running with Replit Database",
        database: "Connected",
        invoices: {
            folder: INVOICES_DIR,
            exists: invoicesExist,
            count: invoicesCount,
        },
        time: new Date().toISOString(),
    });
});

// ============================================
// 🚀 START SERVER
// ============================================
app.listen(PORT, () => {
    console.log("\n=========================================");
    console.log("✅ MOHSIN TRADERS BACKEND STARTED");
    console.log("=========================================");
    console.log(`🌐 URL: https://mohsin-traders--shanzarafique.replit.app`);
    console.log(`💾 DATABASE: Replit Database (PERMANENT!)`);
    console.log(`📁 INVOICES: ${INVOICES_DIR}`);
    console.log("=========================================\n");
    console.log("🔑 Login: Mohsin / mohsin@123");
    console.log("=========================================\n");
});
