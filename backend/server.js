const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files from current directory and parent directory
app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, '..')));

// 📁 CREATE INVOICES FOLDER IN ROOT DIRECTORY (NOT IN BACKEND)
const INVOICES_DIR = path.join(__dirname, '..', 'Invoices');

// Create Invoices folder if it doesn't exist
if (!fs.existsSync(INVOICES_DIR)) {
    fs.mkdirSync(INVOICES_DIR, { recursive: true });
    console.log(`📁 Created Invoices folder at: ${INVOICES_DIR}`);
}

app.post('/save-pdf', (req, res) => {
    try {
        const { pdfData, fileName } = req.body;
        const pdfBuffer = Buffer.from(pdfData, 'base64');
        
        // ⭐⭐ SAVE TO ROOT/Invoices FOLDER ⭐⭐
        const fullPath = path.join(INVOICES_DIR, fileName);
        
        fs.writeFileSync(fullPath, pdfBuffer);
        console.log(`✅ PDF saved to: ${fullPath}`);
        console.log(`📄 File size: ${pdfBuffer.length} bytes`);
        
        res.json({ 
            success: true, 
            message: 'PDF saved successfully',
            path: fullPath,
            url: `/Invoices/${fileName}`
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error: ' + error.message 
        });
    }
});

// 📋 GET LIST OF ALL INVOICES
app.get('/invoices-list', (req, res) => {
    try {
        if (!fs.existsSync(INVOICES_DIR)) {
            return res.json({ success: true, invoices: [] });
        }
        
        const files = fs.readdirSync(INVOICES_DIR);
        const invoices = files
            .filter(file => file.endsWith('.pdf'))
            .map(file => {
                const filePath = path.join(INVOICES_DIR, file);
                const stats = fs.statSync(filePath);
                return {
                    name: file,
                    path: `/Invoices/${file}`,
                    size: stats.size,
                    created: stats.birthtime,
                    modified: stats.mtime
                };
            })
            .sort((a, b) => b.created - a.created);
        
        res.json({ success: true, invoices });
    } catch (error) {
        console.error('❌ Error listing invoices:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// 📥 DOWNLOAD INVOICE
app.get('/download-invoice/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(INVOICES_DIR, fileName);
        
        if (fs.existsSync(filePath)) {
            res.download(filePath);
        } else {
            res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🗑️ DELETE INVOICE
app.delete('/delete-invoice/:fileName', (req, res) => {
    try {
        const fileName = req.params.fileName;
        const filePath = path.join(INVOICES_DIR, fileName);
        
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            res.json({ success: true, message: 'Invoice deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'File not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// 🖼️ SERVE INVOICES FOLDER STATICALLY
app.use('/Invoices', express.static(INVOICES_DIR));

app.get('/health', (req, res) => {
    const invoicesExist = fs.existsSync(INVOICES_DIR);
    let invoicesCount = 0;
    
    if (invoicesExist) {
        try {
            invoicesCount = fs.readdirSync(INVOICES_DIR).filter(f => f.endsWith('.pdf')).length;
        } catch (e) {}
    }
    
    res.json({ 
        status: 'OK', 
        message: 'Server is running',
        environment: process.env.NODE_ENV || 'development',
        invoicesFolder: INVOICES_DIR,
        invoicesCount: invoicesCount,
        time: new Date().toISOString()
    });
});

// Test route to check server
app.get('/', (req, res) => {
    const invoicesExist = fs.existsSync(INVOICES_DIR);
    let invoicesList = [];
    
    if (invoicesExist) {
        try {
            invoicesList = fs.readdirSync(INVOICES_DIR).filter(f => f.endsWith('.pdf'));
        } catch (e) {}
    }
    
    res.send(`
        <html>
            <head>
                <title>Mohsin Traders Backend</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; text-align: center; background: #f5f5f5; }
                    .container { max-width: 900px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
                    h1 { color: #2c3e50; }
                    .success { color: #27ae60; font-weight: bold; }
                    .info { background: #e8f4fc; padding: 15px; border-radius: 5px; margin: 20px 0; }
                    .path { background: #f8f9fa; padding: 10px; border-radius: 5px; font-family: monospace; word-break: break-all; }
                    .invoices-list { text-align: left; margin-top: 20px; }
                    .invoice-item { padding: 8px; border-bottom: 1px solid #eee; }
                    .btn { display: inline-block; padding: 10px 20px; background: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 10px; }
                    .btn:hover { background: #2980b9; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>✅ Mohsin Traders Backend is Running!</h1>
                    <div class="info">
                        <p>Server is ready to save PDF invoices.</p>
                        <p><strong>📁 Invoices are now saved in ROOT folder:</strong></p>
                        <div class="path">${INVOICES_DIR}</div>
                    </div>
                    
                    <div style="margin: 30px 0;">
                        <a href="/dashboard.html" class="btn">🚀 Go to Dashboard</a>
                        <a href="/health" class="btn">🔍 Health Check</a>
                        <a href="/invoices-list" class="btn">📋 View All Invoices (API)</a>
                    </div>
                    
                    <div class="invoices-list">
                        <h3>📄 Recent Invoices (${invoicesList.length})</h3>
                        ${invoicesList.slice(0, 10).map(file => 
                            `<div class="invoice-item">
                                <a href="/Invoices/${file}" target="_blank">${file}</a>
                                <a href="/download-invoice/${file}" style="margin-left: 15px; color: #27ae60;">⬇️ Download</a>
                            </div>`
                        ).join('')}
                        ${invoicesList.length === 0 ? '<p style="color: #666;">No invoices yet. Generate one from the dashboard!</p>' : ''}
                    </div>
                    
                    <hr>
                    <h3>Quick Links:</h3>
                    <p>
                        <a href="index.html">🔐 Login Page</a> | 
                        <a href="dashboard.html">📊 Dashboard</a> | 
                        <a href="/Invoices/">📁 View Invoices Folder</a>
                    </p>
                </div>
            </body>
        </html>
    `);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log('=========================================');
    console.log('✅ Mohsin Traders Backend Started!');
    console.log(`🌐 Access at: http://localhost:${PORT}`);
    console.log(`📁 PDFs are now saved to: ${INVOICES_DIR}`);
    console.log('=========================================');
    console.log('\n🔑 Login Credentials:');
    console.log('   Username: Mohsin');
    console.log('   Password: mohsin@123');
    console.log('\n📋 Steps to use:');
    console.log('1. Go to: http://localhost:' + PORT);
    console.log('2. Click "dashboard.html" link');
    console.log('3. Login with credentials above');
    console.log('4. Generate invoices');
    console.log('5. PDFs will save in the root "Invoices" folder');
    console.log('=========================================');
});