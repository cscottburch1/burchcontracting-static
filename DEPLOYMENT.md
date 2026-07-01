# Auto deploy to nicheprohub.com

This repository deploys to `nicheprohub.com` with GitHub Actions using:

- Workflow: `.github/workflows/deploy-nicheprohub.yml`
- Trigger: push to `main`
- Optional manual run: `workflow_dispatch` with `dry_run=true`

## Required repository secrets

Set these in **GitHub → Settings → Secrets and variables → Actions**:

- `DEPLOY_HOST` (example: `nicheprohub.com` or your hosting FTP/SFTP host)
- `DEPLOY_USERNAME`
- `DEPLOY_PASSWORD`
- `DEPLOY_REMOTE_DIR` (example: `public_html/`)
- `DEPLOY_PROTOCOL` (optional, defaults to `sftp`; use `ftp` if needed)
- `DEPLOY_PORT` (optional, defaults to `22`)

## Notes

- `api/config.local.php` is excluded from deployment and should remain server-only.
- The workflow runs `node scripts/generate-services.mjs` before upload.
- Deployment upload does **not** run delete/sync removal, so hosting-managed files are preserved.
- Start with a manual `dry_run=true` execution to verify connection and target path before relying on push deploys.
