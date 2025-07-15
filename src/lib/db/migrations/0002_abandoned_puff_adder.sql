ALTER TABLE `projects` ADD `is_favorite` integer DEFAULT false;--> statement-breakpoint
ALTER TABLE `projects` ADD `tags` text;--> statement-breakpoint
ALTER TABLE `projects` ADD `status` text DEFAULT 'active';--> statement-breakpoint
ALTER TABLE `projects` ADD `last_activity_at` text DEFAULT CURRENT_TIMESTAMP;