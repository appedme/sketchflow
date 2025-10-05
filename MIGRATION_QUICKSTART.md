# Safe Database Migration - Quick Start

## ✅ What Was Created

1. **API Endpoint**: `/src/app/api/migrate/route.ts`
   - POST: Runs the migration
   - GET: Checks migration status
   - Safe: Won't delete any data, uses IF NOT EXISTS checks

2. **Migration Scripts**:
   - `scripts/migrate-db.js` - Node.js script
   - `scripts/migrate.sh` - Bash script (easiest)

3. **Documentation**: `MIGRATION_README.md` - Full documentation

## 🚀 How to Run (Choose One Method)

### Method 1: Using Bash Script (Easiest) ⭐

```bash
npm run dev
# In another terminal:
./scripts/migrate.sh
```

### Method 2: Using Node Script

```bash
npm run dev
# In another terminal:
node scripts/migrate-db.js
```

### Method 3: Using cURL

```bash
npm run dev
# In another terminal:
curl -X POST http://localhost:3000/api/migrate \
  -H "x-migration-secret: dev-only-secret"
```

### Method 4: Browser (Status Check Only)

1. Start: `npm run dev`
2. Visit: http://localhost:3000/api/migrate
3. See current migration status

## 📊 What Gets Added

### 5 New Tables:
- ✅ `organizations` - Your workspaces
- ✅ `organization_members` - Who's in each org
- ✅ `teams` - Teams within orgs
- ✅ `team_members` - Who's in each team
- ✅ `organization_invitations` - Pending invites

### 2 New Columns in `projects`:
- ✅ `organization_id` - Links project to org
- ✅ `team_id` - Links project to team

### 9 Performance Indexes

## 🔒 Safety Features

- ✅ Uses `CREATE TABLE IF NOT EXISTS`
- ✅ Checks if columns exist before adding
- ✅ Never deletes or drops anything
- ✅ All operations in try-catch
- ✅ Can run multiple times safely
- ✅ Detailed status reporting

## ✅ After Migration Success

1. **Verify it worked:**
   ```bash
   curl http://localhost:3000/api/migrate
   ```

2. **Clean up migration files:**
   ```bash
   rm src/app/api/migrate/route.ts
   rm scripts/migrate-db.js
   rm scripts/migrate.sh
   rm MIGRATION_README.md
   rm MIGRATION_QUICKSTART.md
   ```

3. **Test the features:**
   - Visit http://localhost:3000/organizations
   - Create an organization
   - Invite members
   - Create teams

## 🐛 Troubleshooting

**Q: Migration fails with "Cannot connect to database"**
- Make sure `.env.local` has `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`
- Make sure dev server is running

**Q: "Table already exists" error**
- This is FINE! It means the table was already created
- The migration is safe to run multiple times

**Q: "Column already exists" error**
- This is FINE! The script checks before adding columns
- If you see this, the column is already there

**Q: How do I know if it worked?**
- Run: `curl http://localhost:3000/api/migrate`
- Should show `"allTablesExist": true`

## 📝 Next Steps After Migration

1. ✅ Add `OrganizationSwitcher` to your navigation
2. ✅ Update API routes to use real auth instead of `x-user-id` header
3. ✅ Set up email notifications for invitations
4. ✅ Test all organization features
5. ✅ Deploy to production

---

**Need help?** Check `MIGRATION_README.md` for full documentation.

**Ready to run?** Just do: `./scripts/migrate.sh`
