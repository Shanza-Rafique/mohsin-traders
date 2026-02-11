const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const Database = require('@replit/database');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname, '..')));
app.use(express.static(__dirname));

// Initialize Replit Database (PERSISTENT STORAGE!)
const db = new Database();

// ============================================
// ✅ DATABASE API ENDPOINTS - ALL DATA PERSISTS FOREVER!
// ============================================

// SAVE ALL DATA (call this after any change)
app.post('/api/save-all', async (req, res) => {
  try {
    const { inventory, customers, transactions, history } = req.body;
    
    if (inventory !== undefined) await db.set('inventory', inventory);
    if (customers !== undefined) await db.set('customers', customers);
    if (transactions !== undefined) await db.set('transactions', transactions);
    if (history !== undefined) await db.set('history', history);
    
    res.json({ success: true, message: 'All data saved to database' });
  } catch (error) {
    console.error('Save error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// LOAD ALL DATA (call this when user logs in)
app.get('/api/load-all', async (req, res) => {
  try {
    const [inventory, customers, transactions, history] = await Promise.all([
      db.get('inventory'),
      db.get('customers'),
      db.get('transactions'),
      db.get('history')
    ]);
    
    res.json({
      inventory: inventory || [],
      customers: customers || [],
      transactions: transactions || [],
      history: history || []
    });
  } catch (error) {
    console.error('Load error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// SAVE INDIVIDUAL SECTIONS (optional)
app.post('/api/save-inventory', async (req, res) => {
  await db.set('inventory', req.body);
  res.json({ success: true });
});

app.post('/api/save-customers', async (req, res) => {
  await db.set('customers', req.body);
  res.json({ success: true });
});

app.post('/api/save-history', async (req, res) => {
  await db.set('history', req.body);
  res.json({ success: true });
});

// ============================================
// 📁 INVOICE STORAGE (Local + Object Storage optional)
// ============================================

// Create Invoices folder if it doesn't exist
const INVOICES_DIR = path.join(__dirname, 'Invoices');
if (!fs.existsSync(INVOICES_DIR)) {
    fs.mkdirSync(INVOICES_DIR, { recursive: true });
}

// Save PDF invoice (local storage for now)
app.post('/save-pdf', (req, res) => {
    try {
        const { pdfData, fileName } = req.body;
        const pdfBuffer = Buffer.from(pdfData, 'base64');
        const fullPath = path.join(INVOICES_DIR, fileName);
        
        fs.writeFileSync(fullPath, pdfBuffer);
        console.log(`✅ PDF saved: ${fileName}`);
        
        res.json({ 
            success: true, 
            message: 'PDF saved successfully',
            url: `/Invoices/${fileName}`
        });
    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// Download invoice
app.get('/download-invoice/:fileName', (req, res) => {
    const fileName = req.params.fileName;
    const filePath = path.join(INVOICES_DIR, fileName);
    
    if (fs.existsSync(filePath)) {
        res.download(filePath);
    } else {
        res.status(404).json({ success: false, message: 'File not found' });
    }
});

// List invoices
app.get('/invoices-list', (req, res) => {
    if (!fs.existsSync(INVOICES_DIR)) {
        return res.json({ success: true, invoices: [] });
    }
    
    const files = fs.readdirSync(INVOICES_DIR);
    const invoices = files
        .filter(file => file.endsWith('.pdf'))
        .map(file => ({
            name: file,
            path: `/Invoices/${file}`,
            size: fs.statSync(path.join(INVOICES_DIR, file)).size,
            created: fs.statSync(path.join(INVOICES_DIR, file)).birthtime
        }))
        .sort((a, b) => b.created - a.created);
    
    res.json({ success: true, invoices });
});

// Serve invoices folder
app.use('/Invoices', express.static(INVOICES_DIR));

// ============================================
// 🏠 MAIN PAGES
// ============================================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.get('/dashboard.html', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Server running with Replit Database',
        time: new Date().toISOString()
    });
});

// ============================================
// 🚀 START SERVER
// ============================================

app.listen(PORT, () => {
    console.log('=========================================');
    console.log('✅ Mohsin Traders Backend Started!');
    console.log(`🌐 URL: https://mohsin-traders--shanzarafique.replit.app`);
    console.log(`💾 DATABASE: Replit Database (PERMANENT!)`);
    console.log(`📁 Invoices: ${INVOICES_DIR}`);
    console.log('=========================================');
});