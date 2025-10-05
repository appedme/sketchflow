# Safe Database Migration Script

This temporary API endpoint safely adds organization and team tables to your Turso database **WITHOUT deleting any existing data**.

## Safety Features ✅

- ✅ Uses `CREATE TABLE IF NOT EXISTS` - won't fail if tables already exist
- ✅ Checks if columns exist before adding them
- ✅ Only adds new structures, never removes anything
- ✅ All operations wrapped in try-catch blocks
- ✅ Returns detailed status of each operation
- ✅ Can be run multiple times safely (idempotent)

## How to Use

### Option 1: Using cURL (Recommended)

1. **Start your development server:**
   ```bash
   npm run dev
   ```

2. **Check current migration status (optional):**
   ```bash
   curl http://localhost:3000/api/migrate
   ```

3. **Run the migration:**
   ```bash
   curl -X POST http://localhost:3000/api/migrate \
     -H "x-migration-secret: dev-only-secret"
   ```

   For production (if needed):
   ```bash
   curl -X POST https://your-domain.com/api/migrate \
     -H "x-migration-secret: your-secret-here"
   ```

### Option 2: Using Browser

1. Start your dev server: `npm run dev`
2. Open your browser and go to: `http://localhost:3000/api/migrate`
3. This will show you the current status
4. To run the migration, you'll need to use a tool like Postman or cURL

### Option 3: Using Node Script

Create a file `scripts/run-migration.js`:

```javascript
const https = require('https');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/migrate',
  method: 'POST',
  headers: {
    'x-migration-secret': 'dev-only-secret'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error(error);
});

req.end();
```

Then run: `node scripts/run-migration.js`

## What Gets Added

### New Tables:
1. **organizations** - Organization/workspace entities
2. **organization_members** - Users in organizations with roles
3. **teams** - Teams within organizations
4. **team_members** - Users in teams
5. **organization_invitations** - Pending invitations

### Modified Tables:
- **projects** table gets two new columns:
  - `organization_id` (references organizations)
  - `team_id` (references teams)

### Indexes:
9 performance indexes are created for foreign keys

## Response Format

```json
{
  "success": true,
  "summary": {
    "total": 16,
    "success": 16,
    "errors": 0,
    "skipped": 0
  },
  "results": [
    {
      "step": "organizations_table",
      "status": "success",
      "message": "Organizations table created or already exists"
    },
    // ... more results
  ],
  "message": "✅ Migration completed successfully! All tables and columns added safely.",
  "warning": "🗑️ REMEMBER TO DELETE /src/app/api/migrate/route.ts AFTER MIGRATION!"
}
```

## After Migration

1. **Verify the migration worked:**
   ```bash
   curl http://localhost:3000/api/migrate
   ```
   
   Should show all tables exist.

2. **DELETE the migration endpoint:**
   ```bash
   rm src/app/api/migrate/route.ts
   rm MIGRATION_README.md
   ```

3. **Test the organization features:**
   - Go to `/organizations` to create an organization
   - Test member invitations
   - Test team creation

## Troubleshooting

### Error: "Cannot find name 'db'"
- Make sure your development server is running with proper environment variables

### Error: "Unauthorized"
- In production, make sure to set the correct `x-migration-secret` header

### Error: Table already exists
- This is fine! The migration is idempotent and will skip existing tables

### Column already exists error
- The script checks for column existence first, but if you get this error, it's safe - the column already exists

## Security Notes

- In development, any request can run the migration
- In production, requires `x-migration-secret` header matching `MIGRATION_SECRET` environment variable
- Set `MIGRATION_SECRET` in your production environment before deploying

## Environment Variables (for Production)

Add to your `.env.local` or production environment:

```bash
MIGRATION_SECRET=your-super-secret-key-here
```

---

**⚠️ IMPORTANT: Delete this API endpoint and README after migration is complete!**
