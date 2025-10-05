-- Migration: Add Organizations and Teams tables
-- Created: 2025-10-05

-- Create Organizations table
CREATE TABLE IF NOT EXISTS `organizations` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL UNIQUE,
	`description` text,
	`avatar_url` text,
	`plan` text DEFAULT 'free' NOT NULL,
	`max_members` integer DEFAULT 5,
	`max_projects` integer DEFAULT 10,
	`settings` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create Organization Members table
CREATE TABLE IF NOT EXISTS `organization_members` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`title` text,
	`invited_by` text,
	`invited_at` text DEFAULT CURRENT_TIMESTAMP,
	`joined_at` text,
	`last_active_at` text,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create Teams table
CREATE TABLE IF NOT EXISTS `teams` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`avatar_url` text,
	`is_default` integer DEFAULT false,
	`settings` text,
	`created_by` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create Team Members table
CREATE TABLE IF NOT EXISTS `team_members` (
	`id` text PRIMARY KEY NOT NULL,
	`team_id` text NOT NULL,
	`user_id` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`added_by` text NOT NULL,
	`added_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`team_id`) REFERENCES `teams`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`added_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Create Organization Invitations table
CREATE TABLE IF NOT EXISTS `organization_invitations` (
	`id` text PRIMARY KEY NOT NULL,
	`organization_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'member' NOT NULL,
	`token` text NOT NULL UNIQUE,
	`invited_by` text NOT NULL,
	`expires_at` text NOT NULL,
	`accepted_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`organization_id`) REFERENCES `organizations`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`invited_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

-- Add organization and team columns to projects table
ALTER TABLE `projects` ADD COLUMN `organization_id` text REFERENCES `organizations`(`id`) ON DELETE cascade;
ALTER TABLE `projects` ADD COLUMN `team_id` text REFERENCES `teams`(`id`);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS `idx_org_members_org_id` ON `organization_members`(`organization_id`);
CREATE INDEX IF NOT EXISTS `idx_org_members_user_id` ON `organization_members`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_teams_org_id` ON `teams`(`organization_id`);
CREATE INDEX IF NOT EXISTS `idx_team_members_team_id` ON `team_members`(`team_id`);
CREATE INDEX IF NOT EXISTS `idx_team_members_user_id` ON `team_members`(`user_id`);
CREATE INDEX IF NOT EXISTS `idx_projects_org_id` ON `projects`(`organization_id`);
CREATE INDEX IF NOT EXISTS `idx_projects_team_id` ON `projects`(`team_id`);
CREATE INDEX IF NOT EXISTS `idx_org_invitations_token` ON `organization_invitations`(`token`);
CREATE INDEX IF NOT EXISTS `idx_org_invitations_email` ON `organization_invitations`(`email`);
