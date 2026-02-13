# 🚀 Deploying Mohsin Traders to Replit

This guide will help you deploy the Mohsin Traders Invoice System to your Replit account.

## Prerequisites
- A Replit account (free or paid)
- Git installed on your computer (optional)

---

## Method 1: Deploy via GitHub (Recommended)

### Step 1: Push to GitHub
If you haven't already pushed this code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Prepare for Replit deployment"

# Add your GitHub repository
git remote add origin https://github.com/Shanza-Rafique/mohsin-traders.git

# Push to GitHub
git push -u origin main
```

### Step 2: Import to Replit
1. Go to [Replit](https://replit.com)
2. Click **"+ Create Repl"**
3. Select **"Import from GitHub"**
4. Enter your repository URL: `https://github.com/Shanza-Rafique/mohsin-traders`
5. Click **"Import from GitHub"**
6. Replit will automatically detect it's a Node.js project

### Step 3: Run on Replit
1. Once imported, click the **"Run"** button
2. Replit will automatically:
   - Install dependencies from `backend/package.json`
   - Start the server using `cd backend && node server.js`
3. Your app will be live at: `https://mohsin-traders--[your-username].replit.app`

---

## Method 2: Upload Directly to Replit

### Step 1: Create New Repl
1. Go to [Replit](https://replit.com)
2. Click **"+ Create Repl"**
3. Select **"Node.js"** as the template
4. Name it: `mohsin-traders`
5. Click **"Create Repl"**

### Step 2: Upload Files
1. In the Replit file explorer, delete the default files
2. Click the **"Upload file"** or **"Upload folder"** button
3. Upload all files and folders from your local project:
   - `index.html`
   - `dashboard.html`
   - `backend/` folder (with all its contents)
   - `.replit` file

### Step 3: Configure & Run
1. Replit should auto-detect the `.replit` configuration
2. Click the **"Run"** button
3. The server will start automatically

---

## Configuration Details

### Files Needed for Replit
- ✅ `.replit` - Already configured (tells Replit how to run the project)
- ✅ `backend/package.json` - Dependencies configuration
- ✅ `backend/server.js` - Backend server (uses Replit Database)

### Environment Variables (Optional)
Replit automatically provides:
- `REPLIT_DB_URL` - Database connection (automatic)
- `PORT` - Server port (defaults to 3000)

### Database
The project uses **Replit Database** which is:
- Automatically provisioned
- Persistent storage
- No additional setup needed
- Free tier: 50 MB storage

---

## After Deployment

### Access Your App
Your app will be available at:
```
https://mohsin-traders--[your-username].replit.app
```

### Login Credentials
```
Username: Mohsin
Password: mohsin@123
```

### Test the App
1. Open the URL in your browser
2. Log in with the credentials above
3. Test adding inventory items
4. Create a test invoice
5. Check that data persists after refreshing

---

## Troubleshooting

### Server Not Starting
1. Check the Console tab in Replit for errors
2. Ensure all dependencies are installed:
   ```bash
   cd backend && npm install
   ```

### Database Connection Issues
1. Replit Database is automatic - no configuration needed
2. If you see database errors, try:
   - Click **"Stop"** then **"Run"** again
   - Check the Secrets tab (🔒) - REPLIT_DB_URL should be auto-set

### Port Issues
1. Replit automatically handles ports
2. The app listens on port 3000 internally
3. Replit maps it to port 80 externally

### Missing Dependencies
If you see module errors:
```bash
cd backend
npm install express cors @replit/database
```

---

## Updating Your Deployment

### From GitHub
1. Push changes to GitHub:
   ```bash
   git add .
   git commit -m "Update"
   git push
   ```
2. In Replit, go to Version Control tab
3. Click **"Pull"** to get latest changes
4. Click **"Run"** to restart

### Direct Upload
1. Upload modified files in Replit
2. Click **"Stop"** then **"Run"**

---

## Features Available on Replit

✅ **Persistent Database** - Data saved to Replit Database
✅ **Invoice Storage** - PDFs saved to `backend/Invoices/`
✅ **Always Online** - (with paid Replit plan)
✅ **HTTPS** - Automatic SSL certificate
✅ **Custom Domain** - (with paid Replit plan)

---

## Support

If you encounter issues:
1. Check the Console tab in Replit for errors
2. Review the [Replit Docs](https://docs.replit.com)
3. Check server logs in the Console

---

## Security Note

**Before deploying to production:**
1. Change the default login credentials in the code
2. Add proper authentication
3. Consider using environment variables for sensitive data

---

Happy Deploying! 🚀
