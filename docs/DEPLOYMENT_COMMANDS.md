# Deployment Commands — Manasik Travel Hub

> All working deployment and server management commands
> **Last Updated:** March 26, 2026

---

## ⚡ Standard Deployment (Most Common)

```bash
cd /var/www/rahe-kaba-journeys-72ccca69 && git pull origin main && npm run build && pm2 restart rahekaba-api
```

After deploy, do a **hard refresh** in browser: `Ctrl + Shift + R`

---

## 📦 Full Deployment (With New Packages)

```bash
cd /var/www/rahe-kaba-journeys-72ccca69 && git pull origin main && npm install && npm run build && pm2 restart rahekaba-api
```

---

## Step-by-Step Deployment

### 1. Pull Latest Code

```bash
cd /var/www/rahe-kaba-journeys-72ccca69
git pull origin main
```

### 2. Install Dependencies (if new packages added)

```bash
npm install
```

### 3. Build Frontend

```bash
npm run build
```

### 4. Restart API Server

```bash
pm2 restart rahekaba-api
```

---

## PM2 Commands

```bash
# Check all process status
pm2 status

# Restart rahekaba API
pm2 restart rahekaba-api

# Stop API
pm2 stop rahekaba-api

# Start API
pm2 start rahekaba-api

# View live logs
pm2 logs rahekaba-api

# View last 100 lines of logs
pm2 logs rahekaba-api --lines 100

# View last 50 error lines
pm2 logs rahekaba-api --err --lines 50

# Monitor (real-time CPU/memory)
pm2 monit

# Save PM2 process list (persist across reboots)
pm2 save

# Setup auto-start on reboot
pm2 startup

# Flush all logs
pm2 flush rahekaba-api
```

---

## Database Commands

### Connection

```bash
# Connect to PostgreSQL (Docker, port 5433)
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1
```

### Schema & Data

```bash
# Run schema from file
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -f /var/www/rahe-kaba-journeys-72ccca69/server/schema.sql

# Insert CMS section data
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "
INSERT INTO site_content (section_key, content)
SELECT key, '{}'::jsonb
FROM unnest(ARRAY['hero','navbar','services','about','packages','testimonials','facilities','gallery','guideline','video_guide','contact','whatsapp','footer']) AS key
WHERE NOT EXISTS (SELECT 1 FROM site_content WHERE section_key = key);
"

# Check site_content records
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "SELECT section_key, updated_at FROM site_content ORDER BY section_key;"
```

### Backup & Restore

```bash
# Backup database
pg_dump -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 > /var/www/rahe-kaba-journeys-72ccca69/server/backups/backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 < /path/to/backup.sql

# Check database size
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "SELECT pg_size_pretty(pg_database_size('rahekaba'));"

# List all tables
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "\dt"

# Count rows in key tables
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "
SELECT 'bookings' as table_name, count(*) FROM bookings
UNION ALL SELECT 'payments', count(*) FROM payments
UNION ALL SELECT 'profiles', count(*) FROM profiles
UNION ALL SELECT 'packages', count(*) FROM packages
UNION ALL SELECT 'moallems', count(*) FROM moallems
UNION ALL SELECT 'supplier_agents', count(*) FROM supplier_agents;
"
```

---

## Nginx Commands

```bash
# Test config before reload
nginx -t

# Reload config (graceful)
systemctl reload nginx

# Restart nginx
systemctl restart nginx

# View error logs
tail -f /var/log/nginx/error.log

# View access logs
tail -f /var/log/nginx/access.log

# View rahekaba-specific logs (if configured)
tail -f /var/log/nginx/rahekaba-error.log
```

---

## Git Commands (Safe)

```bash
# Pull latest
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -10

# View specific file changes
git diff HEAD~1 -- src/App.tsx

# Protect .env from being overwritten
git update-index --skip-worktree .env

# Check if .env is protected
git ls-files -v .env
# Shows 'S' prefix if skip-worktree is set
```

> ⚠️ **NEVER run** `git reset --hard` without first backing up `server/.env` and `.env`

---

## Environment File Management

```bash
# Check if server/.env exists
cat server/.env

# Edit server/.env
nano server/.env

# Check frontend .env
cat .env
```

### Required `server/.env` Variables

```env
DATABASE_URL=postgresql://digiwebdex:PASSWORD@127.0.0.1:5433/rahekaba
JWT_SECRET=your-jwt-secret-here
JWT_REFRESH_SECRET=your-refresh-secret-here
JWT_EXPIRES_IN=1h
JWT_REFRESH_EXPIRES_IN=7d
PORT=3001
FRONTEND_URL=https://rahekabatravels.com
UPLOAD_DIR=./uploads
BULKSMSBD_API_KEY=your_api_key
BULKSMSBD_SENDER_ID=your_sender_id
RESEND_API_KEY=your_resend_key
NOTIFICATION_FROM_EMAIL=noreply@rahekabatravels.com
```

---

## SSL/Certificate Management

```bash
# Renew Let's Encrypt certificate
certbot renew

# Force renewal
certbot renew --force-renewal

# Check certificate status
certbot certificates

# Test SSL
openssl s_client -connect rahekabatravels.com:443 -servername rahekabatravels.com
```

---

## Full Server Restart (After VPS Reboot)

```bash
# 1. Start Docker (for PostgreSQL)
systemctl start docker

# 2. Start PostgreSQL container
docker start rahe-kaba-postgres  # or whatever the container name is

# 3. Start Nginx
systemctl start nginx

# 4. Resurrect PM2 processes
pm2 resurrect

# 5. Verify
pm2 status
curl -s http://localhost:3001/api/packages | head -c 100
```

---

## Docker Commands (PostgreSQL)

```bash
# List running containers
docker ps

# Start PostgreSQL container
docker start <container-name>

# Stop PostgreSQL container
docker stop <container-name>

# View container logs
docker logs <container-name> --tail 50

# Execute psql inside container
docker exec -it <container-name> psql -U digiwebdex -d rahekaba
```

---

## Health Checks

```bash
# Check API is responding
curl -s http://localhost:3001/api/packages | head -c 200

# Check PM2 process
pm2 show rahekaba-api

# Check disk space
df -h

# Check memory
free -h

# Check project size
du -sh /var/www/rahe-kaba-journeys-72ccca69/

# Check node_modules size
du -sh /var/www/rahe-kaba-journeys-72ccca69/node_modules/

# Check dist size
du -sh /var/www/rahe-kaba-journeys-72ccca69/dist/

# Check uploads size
du -sh /var/www/rahe-kaba-journeys-72ccca69/server/uploads/
```

---

## Troubleshooting Quick Commands

### API not responding

```bash
pm2 logs rahekaba-api --lines 50
pm2 restart rahekaba-api
```

### Build fails

```bash
cd /var/www/rahe-kaba-journeys-72ccca69
npm install
npm run build 2>&1 | tail -50
```

### Missing npm package (build error)

```bash
npm install <package-name>
npm run build
pm2 restart rahekaba-api
```

### Database connection error

```bash
# Check Docker container
docker ps | grep postgres

# Check if port 5433 is listening
netstat -tlnp | grep 5433

# Test connection
psql -U digiwebdex -d rahekaba -p 5433 -h 127.0.0.1 -c "SELECT 1;"
```

### Disk space issues

```bash
df -h
# Clean old logs
pm2 flush
# Clean old backups
ls -la server/backups/
```

### Memory issues

```bash
free -h
pm2 monit
# Check all Node processes
ps aux | grep node
```

### Port conflict

```bash
# Check what's using port 3001
lsof -i :3001
netstat -tlnp | grep 3001
```
