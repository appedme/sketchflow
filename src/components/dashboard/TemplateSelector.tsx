"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  category: string;
  popular: boolean;
}

interface TemplateSelectorProps {
  templates: Template[];
  categories: string[];
  onTemplateSelect: (templateId: string) => void;
}

export function TemplateSelector({ templates, categories, onTemplateSelect }: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] = useState("blank");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const handleTemplateClick = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect(templateId);
  };

  const filteredTemplates = selectedCategory === "All"
    ? templates
    : templates.filter(template => template.category === selectedCategory);

  const popularTemplates = templates.filter(template => template.popular);

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-lg font-medium text-gray-900 mb-2">Choose a Template</h2>
        <p className="text-gray-600 mb-4">Select a template to get started quickly</p>

        {/* Category Filter */}
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              className={selectedCategory === category
                ? ""
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Templates */}
      {selectedCategory === "All" && (
        <div className="mb-8">
          <h3 className="text-md font-medium text-gray-900 mb-4">Popular Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {popularTemplates.map((template) => (
              <Card
                key={template.id}
                className={`cursor-pointer hover:shadow-sm transition-shadow border-gray-200 ${selectedTemplate === template.id ? 'ring-2 ring-gray-900' : ''
                  }`}
                onClick={() => handleTemplateClick(template.id)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <template.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-gray-900">{template.name}</h3>
                        <Badge variant="secondary" className="text-xs">
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-500">{template.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* All Templates */}
      <div>
        <h3 className="text-md font-medium text-gray-900 mb-4">
          {selectedCategory === "All" ? "All Templates" : `${selectedCategory} Templates`}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer hover:shadow-sm transition-shadow border-gray-200 ${selectedTemplate === template.id ? 'ring-2 ring-gray-900' : ''
                }`}
              onClick={() => handleTemplateClick(template.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <template.icon className="w-5 h-5 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{template.name}</h3>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500">{template.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}