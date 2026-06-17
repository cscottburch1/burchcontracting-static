# SFTP Deployment Guide for dev.burchcontracting.com

## Step 1: Configure SFTP Credentials

1. Open `.vscode/sftp.json` in your project
2. Get your Hostinger FTP credentials:
   - Log into Hostinger hPanel
   - Go to **Files** → **FTP Accounts**
   - Create or use existing FTP account
3. Update these fields in `sftp.json`:
   - `host`: Your FTP server (e.g., `ftp.burchcontracting.com` or IP address)
   - `username`: Your FTP username
   - `password`: Your FTP password
   - `remotePath`: Path on server (usually `/public_html` or `/domains/dev.burchcontracting.com/public_html`)

## Step 2: Build Your Project

Before deploying, build the production version:

```bash
npm run build
```

This creates optimized files in the `dist/` folder.

## Step 3: Deploy Using SFTP Extension

### Option A: Upload Entire dist Folder
1. Right-click the `dist` folder in VS Code explorer
2. Select **Upload Folder**
3. Wait for files to transfer

### Option B: Upload Individual Files
1. Right-click any file in `dist/`
2. Select **Upload**

### Option C: Use Command Palette
1. Press `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
2. Type "SFTP"
3. Choose:
   - `SFTP: Upload Folder` - Upload specific folder
   - `SFTP: Upload Project` - Upload entire project
   - `SFTP: Download Folder` - Download from server
   - `SFTP: Sync Local -> Remote` - Sync changes
   - `SFTP: Sync Remote -> Local` - Pull changes
   - `SFTP: List Active` - View connections

## Quick Deploy Command

I've added a deploy script to `package.json`. After building, use:

```bash
npm run deploy
```

This will:
1. Build the project
2. Prompt you to upload the dist folder

## SFTP Configuration Options

In `.vscode/sftp.json`:

- **uploadOnSave**: Set to `true` to auto-upload on every file save (not recommended for build projects)
- **ignore**: Files/folders to exclude from upload
- **protocol**: `ftp` or `sftp` (use `sftp` if available for better security)
- **port**: 21 for FTP, 22 for SFTP

## Security Note

⚠️ **Important**: The `.vscode/sftp.json` file contains your FTP password. This file is ignored by git (in `.gitignore`), but:
- Never commit this file to a public repository
- Consider using SFTP (port 22) instead of FTP for encryption
- Or use environment variables (see Advanced Setup below)

## Troubleshooting

### Connection Fails
- Verify FTP credentials in Hostinger
- Check if your IP needs to be whitelisted
- Try switching between `ftp` and `sftp` protocols
- Check port (21 for FTP, 22 for SFTP)

### Wrong Directory
- Verify `remotePath` in `sftp.json`
- Use FTP client (FileZilla) to confirm correct path
- Common paths:
  - `/public_html/` (main domain root)
  - `/domains/dev.burchcontracting.com/public_html/` (subdomain)

### Files Not Updating
- Clear browser cache
- Check if files were uploaded to correct directory
- Verify build ran successfully before upload

## Advanced: Environment Variables (Optional)

For better security, you can use environment variables:

1. Create `.env` file (already in .gitignore):
```env
FTP_HOST=ftp.burchcontracting.com
FTP_USER=your_username
FTP_PASS=your_password
```

2. Then reference in sftp.json using `$ENV_VARIABLE_NAME` syntax (if extension supports it)

## Alternative: GitHub Actions Auto-Deploy

For automatic deployment on git push, see [DEPLOYMENT.md](DEPLOYMENT.md) for GitHub Actions setup.
