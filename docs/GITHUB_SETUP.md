# GitHub Setup & Project Transfer — RAHE KABA Tours & Travels

> GitHub connection, project transfer, and workspace management
> **Last Updated:** March 26, 2026

---

## Current GitHub Configuration

| Field | Value |
|-------|-------|
| **Repository** | https://github.com/digiwebdex/rahe-kaba-journeys-44e58262 |
| **Branch** | `main` |
| **Owner** | digiwebdex |
| **Sync** | Bidirectional (Lovable ↔ GitHub) |
| **VPS Deploy** | Manual pull from same repo |

---

## How GitHub Sync Works

### Lovable → GitHub
1. Every change made in Lovable editor auto-commits to GitHub
2. Code changes push to the `main` branch immediately
3. No manual action required

### GitHub → Lovable
1. Push changes to the `main` branch on GitHub
2. Changes automatically sync to Lovable within seconds
3. Preview updates automatically

### VPS Deployment
1. Run `git pull origin main` on VPS
2. Changes pulled from the same GitHub repository
3. Build and restart: `npm run build && pm2 restart rahekaba-api`

---

## Project Transfer Between Workspaces

### What Happens on Transfer

| Aspect | Effect |
|--------|--------|
| **GitHub Connection** | ✅ Stays connected — same repo URL |
| **Repository URL** | ✅ Does NOT change |
| **Code** | ✅ Fully preserved |
| **VPS Deployment** | ✅ Continues working (pulls from same repo) |
| **server/.env on VPS** | ✅ Unaffected (not in git) |
| **Lovable Cloud (if used)** | ✅ Transfers with project |
| **Edge Functions** | ✅ Transfer with project |
| **Custom Domain** | ✅ Transfers with project |
| **Published URL** | ✅ Same URL |

### How to Transfer

1. **In Lovable:** Right-click on project card → "Transfer to workspace"
   - Or: Project Settings → Transfer workspace
2. **Select** the target workspace
3. **Confirm** the transfer
4. **Done** — GitHub link remains connected, no reconnection needed

### After Transfer

- The new workspace owner has full access
- All collaborators from the old workspace lose access (unless re-invited)
- GitHub repository ownership does NOT change
- VPS deployment continues to work with same `git pull` command
- No code changes or configuration needed

---

## Multiple Environment Setup

### Development (Lovable)
- Auto-builds on every change
- Preview at: `https://id-preview--018dbdbc-7a6f-4e33-9b50-1dab207818d7.lovable.app`
- Published at: `https://rahe-kaba-journeys.lovable.app`

### Production (VPS)
- Manual deploy via `git pull`
- Live at: `https://rahekabatravels.com`
- API at: `https://rahekabatravels.com/api`

### Code Flow

```
Lovable Editor → GitHub (auto-push)
                    ↓
              VPS (manual pull)
                    ↓
              npm run build
                    ↓
              Production live
```

---

## GitHub Repository Management

### Protect Sensitive Files

```bash
# Protect .env from git operations
git update-index --skip-worktree .env

# Verify protection
git ls-files -v .env
# 'S' prefix = protected
```

### .gitignore (Relevant Entries)

```
node_modules/
dist/
server/.env
server/uploads/
server/backups/
*.log
```

### Branch Strategy

- `main` — Production branch (auto-deploys)
- Feature branches — Optional for development

---

## Collaborator Access

### Invite to Project Only
- Share button → Enter email → Choose role
- They see only this project, not other workspace projects

### Invite to Workspace
- Settings → People → Add member
- They see all workspace projects

### Roles

| Role | View | Edit | Deploy | Settings |
|------|------|------|--------|----------|
| Viewer | ✅ | ❌ | ❌ | ❌ |
| Editor | ✅ | ✅ | ❌ | ❌ |
| Admin | ✅ | ✅ | ✅ | ✅ |
| Owner | ✅ | ✅ | ✅ | ✅ |

---

## Important Notes

1. **GitHub connection survives workspace transfer** — This is a key feature. The repository link does NOT break.
2. **Only one GitHub account** can be connected to a Lovable account at a time.
3. **VPS is independent** — VPS deployment is completely separate from Lovable. It just pulls from the same GitHub repo.
4. **server/.env is never in Git** — VPS environment variables are managed independently on the server.
5. **Lovable Cloud backend** — If using Lovable Cloud (Supabase), it transfers with the project automatically.
