"use server";

import { getDb } from '@/lib/db/connection';
import { templates, type NewTemplate } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getTemplates(category?: string, popularOnly?: boolean) {
  try {
    const db = getDb();
    
    let query = db.select().from(templates);
    
    const conditions = [];
    
    if (category && category !== 'All') {
      conditions.push(eq(templates.category, category));
    }
    
    if (popularOnly) {
      conditions.push(eq(templates.isPopular, true));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }
    
    const templateList = await query;
    return templateList;
  } catch (error) {
    console.error('Error fetching templates:', error);
    return [];
  }
}

export async function getTemplate(templateId: string) {
  try {
    const db = getDb();
    
    const template = await db
      .select()
      .from(templates)
      .where(eq(templates.id, templateId))
      .limit(1);
    
    return template[0] || null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export async function seedSystemTemplates() {
  try {
    const db = getDb();
    
    const systemTemplates: NewTemplate[] = [
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
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
        },
        createdAt: new Date().toISOString(),
      }
    ];

    // Insert templates with conflict handling
    for (const template of systemTemplates) {
      try {
        await db.insert(templates).values(template);
      } catch (error) {
        // Template might already exist, skip
        console.log(`Template ${template.id} already exists, skipping...`);
      }
    }

    console.log('System templates seeded successfully');
    return { success: true };
  } catch (error) {
    console.error('Error seeding system templates:', error);
    throw new Error('Failed to seed system templates');
  }
}