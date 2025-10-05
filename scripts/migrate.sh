#!/bin/bash

# Database Migration Runner Script
# Usage: ./scripts/migrate.sh

set -e

echo "🔧 Database Migration Script"
echo "============================"
echo ""

# Check if dev server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo "⚠️  Dev server is not running!"
    echo "Please start it first with: npm run dev"
    echo ""
    read -p "Do you want to start the dev server now? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Starting dev server..."
        npm run dev &
        DEV_SERVER_PID=$!
        echo "Waiting for server to start..."
        sleep 5
    else
        exit 1
    fi
fi

echo "✅ Dev server is running"
echo ""

# Check current status
echo "📊 Checking current migration status..."
curl -s http://localhost:3000/api/migrate | json_pp || curl -s http://localhost:3000/api/migrate
echo ""
echo ""

# Ask for confirmation
read -p "Do you want to run the migration? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Migration cancelled"
    exit 0
fi

echo ""
echo "⚡ Running migration..."
echo ""

# Run migration
RESPONSE=$(curl -s -X POST http://localhost:3000/api/migrate \
  -H "x-migration-secret: dev-only-secret")

echo "$RESPONSE" | json_pp || echo "$RESPONSE"

# Check if successful
if echo "$RESPONSE" | grep -q '"success":true' || echo "$RESPONSE" | grep -q '"success": true'; then
    echo ""
    echo "✅ Migration completed successfully!"
    echo ""
    echo "📝 Next steps:"
    echo "  1. Test at: http://localhost:3000/organizations"
    echo "  2. Delete migration files when done:"
    echo "     rm src/app/api/migrate/route.ts"
    echo "     rm scripts/migrate-db.js"
    echo "     rm scripts/migrate.sh"
    echo "     rm MIGRATION_README.md"
else
    echo ""
    echo "❌ Migration failed. Check the output above for details."
    exit 1
fi

# Kill dev server if we started it
if [ ! -z "$DEV_SERVER_PID" ]; then
    echo ""
    read -p "Stop the dev server? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        kill $DEV_SERVER_PID
        echo "Dev server stopped"
    fi
fi
