import { createDb } from './index';
import { templates } from './schema';
import { nanoid } from 'nanoid';

// Default system templates based on our frontend
const systemTemplates = [
  {
    id: 'blank',
    name: 'Blank Canvas',
    description: 'Start with a completely blank canvas',
    category: 'General',
    icon: 'FileText',
    isPopular: true,
    isSystem: true,
    templateData: {
      type: 'blank',
      defaultElements: [],
      defaultDocuments: []
    }
  },
  {
    id: 'flowchart',
    name: 'Flowchart',
    description: 'Create process flows and decision trees',
    category: 'Process',
    icon: 'GitBranch',
    isPopular: true,
    isSystem: true,
    templateData: {
      type: 'flowchart',
      defaultElements: [],
      defaultDocuments: [
        {
          title: 'Process Documentation',
          content: [
            {
              type: 'h1',
              children: [{ text: 'Process Flow Documentation' }]
            },
            {
              type: 'p',
              children: [{ text: 'Document your process flow here...' }]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'database-schema',
    name: 'Database Schema',
    description: 'Design database structures and relationships',
    category: 'Technical',
    icon: 'Database',
    isPopular: false,
    isSystem: true,
    templateData: {
      type: 'database',
      defaultElements: [],
      defaultDocuments: [
        {
          title: 'Schema Documentation',
          content: [
            {
              type: 'h1',
              children: [{ text: 'Database Schema' }]
            },
            {
              type: 'p',
              children: [{ text: 'Document your database structure here...' }]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'org-chart',
    name: 'Organization Chart',
    description: 'Visualize team structures and hierarchies',
    category: 'Business',
    icon: 'Users',
    isPopular: false,
    isSystem: true,
    templateData: {
      type: 'org-chart',
      defaultElements: [],
      defaultDocuments: []
    }
  },
  {
    id: 'mind-map',
    name: 'Mind Map',
    description: 'Brainstorm ideas and concepts visually',
    category: 'Creative',
    icon: 'Brain',
    isPopular: true,
    isSystem: true,
    templateData: {
      type: 'mind-map',
      defaultElements: [],
      defaultDocuments: []
    }
  },
  {
    id: 'wireframe',
    name: 'Wireframe',
    description: 'Design user interfaces and layouts',
    category: 'Design',
    icon: 'BarChart3',
    isPopular: false,
    isSystem: true,
    templateData: {
      type: 'wireframe',
      defaultElements: [],
      defaultDocuments: []
    }
  },
  {
    id: 'workflow',
    name: 'Workflow Diagram',
    description: 'Map out business processes and workflows',
    category: 'Process',
    icon: 'Workflow',
    isPopular: false,
    isSystem: true,
    templateData: {
      type: 'workflow',
      defaultElements: [],
      defaultDocuments: []
    }
  },
  {
    id: 'system-architecture',
    name: 'System Architecture',
    description: 'Design technical system architectures',
    category: 'Technical',
    icon: 'Zap',
    isPopular: true,
    isSystem: true,
    templateData: {
      type: 'architecture',
      defaultElements: [],
      defaultDocuments: [
        {
          title: 'Architecture Overview',
          content: [
            {
              type: 'h1',
              children: [{ text: 'System Architecture' }]
            },
            {
              type: 'p',
              children: [{ text: 'Document your system architecture here...' }]
            }
          ]
        }
      ]
    }
  },
  {
    id: 'timeline',
    name: 'Timeline',
    description: 'Create project timelines and schedules',
    category: 'Planning',
    icon: 'Calendar',
    isPopular: false,
    isSystem: true,
    templateData: {
      type: 'timeline',
      defaultElements: [],
      defaultDocuments: []
    }
  }
];

export async function seedDatabase(d1Database: D1Database) {
  const db = createDb(d1Database);
  
  try {
    console.log('Seeding database with system templates...');
    
    // Insert system templates
    for (const template of systemTemplates) {
      await db.insert(templates).values({
        ...template,
        createdAt: new Date().toISOString(),
      }).onConflictDoNothing();
    }
    
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Seeding failed:', error);
    throw error;
  }
}