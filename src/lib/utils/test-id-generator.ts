// Test file to demonstrate unique ID generation
// This file can be removed after testing

import {
    generateUniqueProjectId,
    generateUniqueDocumentId,
    generateUniqueCanvasId,
    generateSimpleId,
    generateUniqueIds
} from './id-generator';

export async function testIdGeneration() {
    console.log('🎯 Testing Unique ID Generation');

    // Test simple ID generation (no database check)
    console.log('\n📝 Simple IDs (no DB check):');
    console.log('Project:', generateSimpleId('project'));
    console.log('Document:', generateSimpleId('document'));
    console.log('Canvas:', generateSimpleId('canvas'));

    // Test unique ID generation with database checks
    console.log('\n🔍 Unique IDs (with DB uniqueness check):');
    try {
        const projectId = await generateUniqueProjectId();
        console.log('Project:', projectId);

        const documentId = await generateUniqueDocumentId();
        console.log('Document:', documentId);

        const canvasId = await generateUniqueCanvasId();
        console.log('Canvas:', canvasId);
    } catch (error) {
        console.error('Error generating unique IDs:', error);
    }

    // Test batch generation
    console.log('\n📦 Batch ID Generation:');
    try {
        const projectIds = await generateUniqueIds('project', 3);
        console.log('Projects:', projectIds);

        const documentIds = await generateUniqueIds('document', 3);
        console.log('Documents:', documentIds);

        const canvasIds = await generateUniqueIds('canvas', 3);
        console.log('Canvases:', canvasIds);
    } catch (error) {
        console.error('Error generating batch IDs:', error);
    }
}

// Example IDs that might be generated:
// Projects: "brave-blue-tiger", "happy-red-elephant", "clever-green-fox"
// Documents: "gentle-alice", "bright-bob", "swift-charlie"
// Canvases: "purple-yoda", "orange-vader", "cyan-luke"