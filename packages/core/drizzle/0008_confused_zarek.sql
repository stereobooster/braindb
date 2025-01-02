ALTER TABLE `documents` RENAME TO `files`;--> statement-breakpoint
ALTER TABLE `files` RENAME COLUMN `frontmatter` TO `data`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `from` TO `source`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `to` TO `target`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `to_slug` TO `target_slug`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `to_url` TO `target_url`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `to_path` TO `target_path`;--> statement-breakpoint
ALTER TABLE `links` RENAME COLUMN `to_anchor` TO `target_anchor`;--> statement-breakpoint
ALTER TABLE `tasks` RENAME COLUMN `from` TO `source`;--> statement-breakpoint
DROP INDEX IF EXISTS `documents_slug`;--> statement-breakpoint
DROP INDEX IF EXISTS `documents_url`;--> statement-breakpoint
DROP INDEX IF EXISTS `documents_path`;--> statement-breakpoint
DROP INDEX IF EXISTS `links_to_slug`;--> statement-breakpoint
DROP INDEX IF EXISTS `links_to_url`;--> statement-breakpoint
DROP INDEX IF EXISTS `links_to_path`;--> statement-breakpoint
DROP INDEX IF EXISTS `links_from_start`;--> statement-breakpoint
DROP INDEX IF EXISTS `tasks_from_start`;--> statement-breakpoint
ALTER TABLE `files` DROP COLUMN `checksum`;--> statement-breakpoint
ALTER TABLE `files` ADD `checksum` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `files` ADD `type` text;--> statement-breakpoint
CREATE INDEX `files_slug` ON `files` (`slug`);--> statement-breakpoint
CREATE INDEX `files_url` ON `files` (`url`);--> statement-breakpoint
CREATE INDEX `files_type` ON `files` (`type`);--> statement-breakpoint
CREATE UNIQUE INDEX `files_path` ON `files` (`path`);--> statement-breakpoint
CREATE INDEX `links_target_slug` ON `links` (`target_slug`);--> statement-breakpoint
CREATE INDEX `links_target_url` ON `links` (`target_url`);--> statement-breakpoint
CREATE INDEX `links_target_path` ON `links` (`target_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `links_source_start` ON `links` (`source`,`start`);--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_from_start` ON `tasks` (`source`,`start`);--> statement-breakpoint
ALTER TABLE `links` DROP COLUMN `label`;