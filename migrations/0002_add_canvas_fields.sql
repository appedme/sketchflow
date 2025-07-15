-- Migration: Add new fields to canvases table
-- Date: 2025-01-15

-- Add new columns to canvases table
ALTER TABLE `canvases` ADD COLUMN `element_count` integer DEFAULT 0;
ALTER TABLE `canvases` ADD COLUMN `is_favorite` integer DEFAULT 0;
ALTER TABLE `canvases` ADD COLUMN `tags` text;
ALTER TABLE `canvases` ADD COLUMN `status` text DEFAULT 'draft';
ALTER TABLE `canvases` ADD COLUMN `last_edited_by` text REFERENCES users(id);

-- Update existing canvases with default values
UPDATE `canvases` SET 
  `element_count` = 0,
  `is_favorite` = 0,
  `tags` = '[]',
  `status` = 'draft',
  `last_edited_by` = `created_by`
WHERE `element_count` IS NULL;