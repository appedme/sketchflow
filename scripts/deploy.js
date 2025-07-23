#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Set higher memory limit
process.env.NODE_OPTIONS = '--max-old-space-size=8192';

console.log('🚀 Starting deployment with increased memory allocation...');
console.log(`Memory allocated: ${process.env.NODE_OPTIONS}`);

try {
    // Clean build directories
    console.log('\n🧹 Cleaning build directories...');
    try {
        if (fs.existsSync('./.next')) {
            fs.rmSync('./.next', { recursive: true, force: true });
            console.log('  ✓ Cleaned .next directory');
        }

        if (fs.existsSync('./.open-next')) {
            fs.rmSync('./.open-next', { recursive: true, force: true });
            console.log('  ✓ Cleaned .open-next directory');
        }
    } catch (cleanError) {
        console.warn('  ⚠️ Warning: Could not clean directories:', cleanError.message);
    }

    // Build the Next.js app with OpenNext
    console.log('\n📦 Building Next.js app with OpenNext...');
    execSync('npx @opennextjs/cloudflare build', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    // Deploy to Cloudflare
    console.log('\n🚀 Deploying to Cloudflare...');
    execSync('npx @opennextjs/cloudflare deploy', {
        stdio: 'inherit',
        env: { ...process.env }
    });

    console.log('\n✅ Deployment completed successfully!');
} catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    process.exit(1);
}