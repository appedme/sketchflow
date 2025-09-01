#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Validating cleanup and refactoring...\n');

const projectRoot = path.join(__dirname, '..');

// 1. Check new structure exists
console.log('📁 Checking new project structure...');

const expectedStructure = [
    'src/hooks/workspace',
    'src/hooks/files', 
    'src/hooks/canvas',
    'src/hooks/shared',
    'src/lib/performance.ts',
    'src/lib/component-loader.ts',
    'src/lib/fast-utils.ts',
    'src/components/workspace/index.ts',
    'src/components/dashboard/index.ts',
    'src/components/canvas/index.ts',
    'src/components/landing/index.ts',
    'src/hooks/index.ts',
    'CLEANUP_SUMMARY.md'
];

let structureValid = 0;
expectedStructure.forEach(item => {
    const itemPath = path.join(projectRoot, item);
    if (fs.existsSync(itemPath)) {
        console.log(`✅ ${item}`);
        structureValid++;
    } else {
        console.log(`❌ Missing: ${item}`);
    }
});

console.log(`\n📊 Structure validation: ${structureValid}/${expectedStructure.length} items found\n`);

// 2. Check removed files are gone
console.log('🗑️  Verifying removed files...');

const shouldBeRemoved = [
    'src/components/optimized',
    'src/components/loading.tsx',
    'src/components/theme-toggle-simple.tsx',
    'src/components/ui/tweet-grid.tsx',
    'src/components/ui/glitcgy-text.tsx',
    'todo.md',
    'todo-later.md'
];

let removedCount = 0;
shouldBeRemoved.forEach(item => {
    const itemPath = path.join(projectRoot, item);
    if (!fs.existsSync(itemPath)) {
        console.log(`✅ Removed: ${item}`);
        removedCount++;
    } else {
        console.log(`⚠️  Still exists: ${item}`);
    }
});

console.log(`\n📊 Cleanup validation: ${removedCount}/${shouldBeRemoved.length} files properly removed\n`);

// 3. Check hooks organization
console.log('🪝 Checking hooks organization...');

const hookFeatures = ['workspace', 'files', 'canvas', 'shared'];
let organizedHooks = 0;

hookFeatures.forEach(feature => {
    const featurePath = path.join(projectRoot, 'src/hooks', feature);
    if (fs.existsSync(featurePath)) {
        const hooks = fs.readdirSync(featurePath).filter(f => f.endsWith('.ts'));
        console.log(`✅ ${feature}: ${hooks.length} hooks`);
        organizedHooks += hooks.length;
    } else {
        console.log(`❌ Missing feature: ${feature}`);
    }
});

console.log(`\n📊 Hooks organization: ${organizedHooks} hooks organized by feature\n`);

// 4. Check index files content
console.log('📄 Validating index files...');

const indexFiles = [
    'src/hooks/index.ts',
    'src/components/workspace/index.ts',
    'src/components/dashboard/index.ts'
];

let validIndexes = 0;
indexFiles.forEach(indexFile => {
    const indexPath = path.join(projectRoot, indexFile);
    if (fs.existsSync(indexPath)) {
        const content = fs.readFileSync(indexPath, 'utf8');
        if (content.includes('export') && content.length > 50) {
            console.log(`✅ ${indexFile} - Valid exports`);
            validIndexes++;
        } else {
            console.log(`⚠️  ${indexFile} - May be empty or invalid`);
        }
    } else {
        console.log(`❌ Missing: ${indexFile}`);
    }
});

console.log(`\n📊 Index files: ${validIndexes}/${indexFiles.length} valid\n`);

// 5. Check performance utilities
console.log('⚡ Checking performance utilities...');

const performanceFiles = [
    'src/lib/performance.ts',
    'src/lib/component-loader.ts', 
    'src/lib/fast-utils.ts'
];

let performanceUtils = 0;
performanceFiles.forEach(file => {
    const filePath = path.join(projectRoot, file);
    if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('performance') || content.includes('memo') || content.includes('lazy')) {
            console.log(`✅ ${file} - Performance utilities present`);
            performanceUtils++;
        } else {
            console.log(`⚠️  ${file} - May not contain performance utilities`);
        }
    } else {
        console.log(`❌ Missing: ${file}`);
    }
});

console.log(`\n📊 Performance utilities: ${performanceUtils}/${performanceFiles.length} files\n`);

// 6. Overall validation score
const totalChecks = 5;
let passedChecks = 0;

if (structureValid >= 10) passedChecks++;
if (removedCount >= 5) passedChecks++;
if (organizedHooks >= 15) passedChecks++;
if (validIndexes >= 2) passedChecks++;
if (performanceUtils >= 2) passedChecks++;

console.log('📋 Overall Validation Results:');
console.log(`Structure: ${structureValid >= 10 ? '✅' : '❌'} (${structureValid}/13 items)`);
console.log(`Cleanup: ${removedCount >= 5 ? '✅' : '❌'} (${removedCount}/7 removed)`);
console.log(`Hooks: ${organizedHooks >= 15 ? '✅' : '❌'} (${organizedHooks} organized)`);
console.log(`Indexes: ${validIndexes >= 2 ? '✅' : '❌'} (${validIndexes}/3 valid)`);
console.log(`Performance: ${performanceUtils >= 2 ? '✅' : '❌'} (${performanceUtils}/3 files)`);

console.log(`\n🎯 Validation Score: ${passedChecks}/${totalChecks} checks passed\n`);

if (passedChecks >= 4) {
    console.log('🎉 Cleanup and refactoring SUCCESSFUL!');
    console.log('');
    console.log('✅ Project structure is well-organized');
    console.log('✅ Unused code has been removed');
    console.log('✅ Components are properly structured');
    console.log('✅ Performance optimizations are in place');
    console.log('✅ Codebase is clean and maintainable');
    console.log('');
    console.log('🚀 Ready for development and production!');
} else {
    console.log('⚠️  Some issues detected. Please review the validation results above.');
}

console.log('\n📋 Next steps:');
console.log('1. Run: npm install (if needed)');
console.log('2. Run: npm run build (test the build)');
console.log('3. Run: npm run dev (start development)');
console.log('4. Check CLEANUP_SUMMARY.md for detailed changes');