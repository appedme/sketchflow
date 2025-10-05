#!/usr/bin/env node

/**
 * Simple script to run the database migration
 * Run with: node scripts/migrate-db.js
 */

async function runMigration() {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  const SECRET = process.env.MIGRATION_SECRET || 'dev-only-secret';

  console.log('🚀 Starting database migration...\n');

  try {
    // Step 1: Check current status
    console.log('📊 Checking current migration status...');
    const statusResponse = await fetch(`${BASE_URL}/api/migrate`);
    const statusData = await statusResponse.json();
    
    console.log('Current Status:', JSON.stringify(statusData, null, 2));
    console.log('\n');

    // Step 2: Run migration
    console.log('⚡ Running migration...');
    const migrateResponse = await fetch(`${BASE_URL}/api/migrate`, {
      method: 'POST',
      headers: {
        'x-migration-secret': SECRET,
      },
    });

    const migrateData = await migrateResponse.json();

    // Display results
    console.log('\n📋 Migration Results:');
    console.log('='.repeat(80));
    console.log(`Status: ${migrateData.success ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`Total Steps: ${migrateData.summary?.total || 0}`);
    console.log(`Successful: ${migrateData.summary?.success || 0}`);
    console.log(`Errors: ${migrateData.summary?.errors || 0}`);
    console.log(`Skipped: ${migrateData.summary?.skipped || 0}`);
    console.log('='.repeat(80));

    if (migrateData.results) {
      console.log('\n📝 Detailed Results:');
      migrateData.results.forEach((result) => {
        const icon = result.status === 'success' ? '✅' : result.status === 'error' ? '❌' : '⏭️';
        console.log(`${icon} ${result.step}: ${result.message}`);
      });
    }

    console.log('\n' + migrateData.message);
    if (migrateData.warning) {
      console.log('\n⚠️  ' + migrateData.warning);
    }

    // Step 3: Verify
    console.log('\n🔍 Verifying migration...');
    const verifyResponse = await fetch(`${BASE_URL}/api/migrate`);
    const verifyData = await verifyResponse.json();

    console.log('\nVerification:');
    if (verifyData.checks) {
      verifyData.checks.forEach((check) => {
        if (check.table && check.exists !== undefined) {
          console.log(`  ${check.exists ? '✅' : '❌'} Table: ${check.table}`);
        } else if (check.table === 'projects') {
          console.log(`  ${check.hasOrgColumn ? '✅' : '❌'} projects.organization_id column`);
          console.log(`  ${check.hasTeamColumn ? '✅' : '❌'} projects.team_id column`);
        }
      });
    }

    console.log(`\n${verifyData.allTablesExist ? '✅' : '❌'} All tables exist: ${verifyData.allTablesExist}`);

    if (migrateData.success && verifyData.allTablesExist) {
      console.log('\n🎉 Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('  1. Delete the migration files:');
      console.log('     rm src/app/api/migrate/route.ts');
      console.log('     rm scripts/migrate-db.js');
      console.log('     rm MIGRATION_README.md');
      console.log('  2. Test the organization features at /organizations');
      console.log('  3. Update API routes to use real authentication');
    }

    process.exit(migrateData.success ? 0 : 1);
  } catch (error) {
    console.error('\n❌ Migration failed with error:');
    console.error(error);
    process.exit(1);
  }
}

// Run the migration
runMigration();
