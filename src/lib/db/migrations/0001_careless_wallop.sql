ALTER TABLE `canvases` ADD `element_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `canvases` ADD `is_favorite` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `canvases` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `canvases` ADD `status` text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `canvases` ADD `last_edited_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `documents` ADD `word_count` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `documents` ADD `reading_time` integer DEFAULT 0;--> statement-breakpoint
ALTER TABLE `documents` ADD `is_favorite` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `documents` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `documents` ADD `status` text DEFAULT 'draft';--> statement-breakpoint
ALTER TABLE `documents` ADD `last_edited_by` text REFERENCES users(id);