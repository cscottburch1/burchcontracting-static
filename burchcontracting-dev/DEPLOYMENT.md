# Auto-Deploy Setup Guide for Hostinger

This guide explains how to configure automatic deployment from GitHub to your Hostinger subdomain at dev.burchcontracting.com.

## Overview

The GitHub Actions workflow has been configured to:
- Trigger automatically when code is pushed to the `main` branch
- Build the Vite project
- Deploy the built files to Hostinger via FTP

## Required GitHub Secrets

You need to add the following secrets to your GitHub repository. The workflow accepts either the `FTP_*` names below or equivalent `DEPLOY_*` names (`DEPLOY_HOST`, `DEPLOY_USERNAME`, `DEPLOY_PASSWORD`).

1. Go to your repository: https://github.com/cscottburch1/burchcontracting-static
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** for each of the following:

### FTP_SERVER
- **Value**: Your Hostinger FTP server address
- **Example**: `ftp.yourdomain.com`, `192.168.x.x`, or `ftp://ftp.yourdomain.com`
- **Where to find**: Hostinger control panel → FTP Accounts → Server address

### FTP_USERNAME
- **Value**: Your FTP username for the subdomain
- **Example**: `u123456789.dev` or `dev@burchcontracting.com`
- **Where to find**: Hostinger control panel → FTP Accounts

### FTP_PASSWORD
- **Value**: Your FTP password
- **Where to find**: Set when creating the FTP account in Hostinger

## Getting Hostinger FTP Credentials

1. Log in to your Hostinger control panel (hPanel)
2. Navigate to **Files** → **FTP Accounts**
3. Either use an existing FTP account or create a new one:
   - Click **Create FTP Account**
   - Username: Choose a username (e.g., `dev`)
   - Password: Create a strong password
   - Directory: Set to `/public_html` or the specific directory for dev.burchcontracting.com
   - Click **Create**
4. Note down:
   - FTP Server (hostname)
   - FTP Username
   - FTP Password
   - Port (usually 21)

## Important Configuration Notes

### Server Directory Path
The workflow is currently set to deploy to `./public_html/`. You may need to adjust this based on your Hostinger setup:

- If dev.burchcontracting.com has its own directory: Update `server-dir` in `.github/workflows/deploy.yml`
- Common paths:
  - `./public_html/` (main domain)
  - `./public_html/dev/` (subdomain in subfolder)
  - `./domains/dev.burchcontracting.com/public_html/` (separate subdomain)

To find the correct path:
1. Connect via FTP client (FileZilla, WinSCP, etc.)
2. Navigate to where dev.burchcontracting.com files should be
3. Update the `server-dir` value in the workflow file

### Branch Configuration
The workflow triggers on pushes to the `main` branch. If your default branch is named differently (e.g., `master`), update line 5 in `.github/workflows/deploy.yml`.

## Testing the Deployment

### Initial Setup
1. Add all secrets to GitHub (as described above)
2. Commit and push the `.github/workflows/deploy.yml` file:
   ```bash
   git add .github/
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main
   ```

### Monitor Deployment
1. Go to your GitHub repository
2. Click the **Actions** tab
3. You should see the "Deploy to Hostinger" workflow running
4. Click on the workflow run to see detailed logs

### Manual Deployment
You can also trigger deployment manually:
1. Go to **Actions** tab
2. Click **Deploy to Hostinger** workflow
3. Click **Run workflow** button
4. Select branch and click **Run workflow**

## Troubleshooting

### Build Fails
- Check that all dependencies are listed in `package.json`
- Verify the build command works locally: `npm run build`

### FTP Connection Fails
- Verify FTP credentials are correct
- Check if Hostinger requires SFTP instead of FTP
- Ensure FTP access is enabled in Hostinger control panel
- Check firewall settings (GitHub Actions IPs should be allowed)

### Files Not Appearing on Website
- Verify the `server-dir` path is correct
- Check file permissions on Hostinger
- Ensure the subdomain is pointed to the correct directory

### Using SFTP Instead
If Hostinger requires SFTP (more secure), update the workflow to use a different action:
```yaml
- name: Deploy to Hostinger via SFTP
  uses: wlixcc/SFTP-Deploy-Action@v1.2.4
  with:
    server: ${{ secrets.FTP_SERVER }}
    username: ${{ secrets.FTP_USERNAME }}
    password: ${{ secrets.FTP_PASSWORD }}
    local_path: './dist/*'
    remote_path: '/public_html/'
```

## Next Steps

1. ✅ GitHub Actions workflow created
2. ⏳ Add FTP secrets to GitHub repository
3. ⏳ Verify server directory path
4. ⏳ Push changes to trigger first deployment
5. ⏳ Test the site at https://dev.burchcontracting.com

## Security Best Practices

- Never commit FTP credentials directly to the repository
- Use strong passwords for FTP accounts
- Consider restricting FTP access to specific IP addresses in Hostinger
- Regularly rotate FTP passwords
- Enable two-factor authentication on your Hostinger account

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Hostinger FTP Guide](https://support.hostinger.com/en/articles/1583368-how-to-upload-files-via-ftp)
- [FTP-Deploy-Action Documentation](https://github.com/SamKirkland/FTP-Deploy-Action)
