-- Migration: Add new fields to documents table
-- Date: 2025-01-15

-- Add new columns to documents table
ALTER TABLE `documents` ADD COLUMN `word_count` integer DEFAULT 0;
ALTER TABLE `documents` ADD COLUMN `reading_time` integer DEFAULT 0;
ALTER TABLE `documents` ADD COLUMN `is_favorite` integer DEFAULT 0;
ALTER TABLE `documents` ADD COLUMN `tags` text;
ALTER TABLE `documents` ADD COLUMN `status` text DEFAULT 'draft';
ALTER TABLE `documents` ADD COLUMN `last_edited_by` text REFERENCES users(id);

-- Update existing documents with default values
UPDATE `documents` SET 
  `word_count` = 0,
  `reading_time` = 0,
  `is_favorite` = 0,
  `tags` = '[]',
  `status` = 'draft',
  `last_edited_by` = `created_by`
WHERE `word_count` IS NULL;