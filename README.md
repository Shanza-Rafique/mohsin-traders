# 📦 Mohsin Traders - Invoice Management System

A complete inventory and invoice management system with persistent storage.

## 🚀 Quick Start on Replit

### Option 1: Import from GitHub
1. Go to [Replit](https://replit.com)
2. Click **"+ Create Repl"** → **"Import from GitHub"**
3. Enter: `https://github.com/Shanza-Rafique/mohsin-traders`
4. Click **"Import"** → **"Run"**

### Option 2: Upload Files
1. Create a new Node.js Repl on [Replit](https://replit.com)
2. Upload all project files
3. Click **"Run"**

That's it! Your app will be live at: `https://mohsin-traders--[username].replit.app`

📖 **Detailed deployment guide:** See [REPLIT_DEPLOYMENT.md](REPLIT_DEPLOYMENT.md)

---

## 🎯 Features

✅ **Inventory Management** - Add, edit, delete products
✅ **Customer Management** - Maintain customer records
✅ **Invoice Generation** - Create professional PDF invoices
✅ **Transaction History** - Track all sales
✅ **Persistent Database** - Data saved automatically (Replit DB)
✅ **Invoice Storage** - PDFs stored permanently

---

## 🔐 Default Login

```
Username: Mohsin
Password: mohsin@123
```

⚠️ **Change these credentials before production use!**

---

## 📁 Project Structure

```
mohsin-traders/
├── index.html              # Login page
├── dashboard.html          # Main dashboard
├── backend/
│   ├── server.js          # Express server
│   ├── package.json       # Dependencies
│   └── Invoices/          # PDF storage
├── .replit                # Replit configuration
└── replit.nix            # Nix environment
```

---

## 🛠️ Technology Stack

- **Frontend:** HTML, CSS, JavaScript
- **Backend:** Node.js, Express
- **Database:** Replit Database (key-value store)
- **PDF Generation:** jsPDF
- **Storage:** File system (Invoices)

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ installed

### Setup
```bash
# Install dependencies
cd backend
npm install

# Start server
npm start
```

Access at: `http://localhost:3000`

**Note:** Local development uses file-based storage instead of Replit DB.

---

## 🌐 API Endpoints

### Data Management
- `POST /api/save-all` - Save all data
- `GET /api/load-all` - Load all data

### Invoice Management
- `POST /save-pdf` - Save PDF invoice
- `GET /invoices-list` - List all invoices
- `GET /download-invoice/:fileName` - Download invoice
- `DELETE /delete-invoice/:fileName` - Delete invoice

### Health Check
- `GET /health` - Server status

---

## 📝 Usage

1. **Login:** Use default credentials
2. **Add Inventory:** Add products with prices
3. **Add Customers:** Maintain customer database
4. **Create Invoice:** 
   - Select customer
   - Add items
   - Generate PDF
5. **View History:** Track all transactions

---

## 🔄 Updates

### Push to GitHub & Replit
```bash
git add .
git commit -m "Your changes"
git push
```

In Replit: Version Control → Pull

---

## 📞 Support

For deployment issues, see [REPLIT_DEPLOYMENT.md](REPLIT_DEPLOYMENT.md)

---

## 📄 License

Private project for Mohsin Traders

---

Made with ❤️ for Mohsin Traders
