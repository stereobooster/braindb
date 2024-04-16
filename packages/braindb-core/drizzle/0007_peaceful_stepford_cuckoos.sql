CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from` text NOT NULL,
	`start` integer NOT NULL,
	`ast` text NOT NULL,
	`checked` integer NOT NULL,
	`line` integer NOT NULL,
	`column` integer NOT NULL
);
--> statement-breakpoint
DROP INDEX IF EXISTS `slug`;--> statement-breakpoint
DROP INDEX IF EXISTS `url`;--> statement-breakpoint
DROP INDEX IF EXISTS `path`;--> statement-breakpoint
DROP INDEX IF EXISTS `to_slug`;--> statement-breakpoint
DROP INDEX IF EXISTS `to_url`;--> statement-breakpoint
DROP INDEX IF EXISTS `to_path`;--> statement-breakpoint
DROP INDEX IF EXISTS `from_start`;--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_from_start` ON `tasks` (`from`,`start`);--> statement-breakpoint
CREATE INDEX `documents_slug` ON `documents` (`slug`);--> statement-breakpoint
CREATE INDEX `documents_url` ON `documents` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `documents_path` ON `documents` (`path`);--> statement-breakpoint
CREATE INDEX `links_to_slug` ON `links` (`to_slug`);--> statement-breakpoint
CREATE INDEX `links_to_url` ON `links` (`to_url`);--> statement-breakpoint
CREATE INDEX `links_to_path` ON `links` (`to_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `links_from_start` ON `links` (`from`,`start`);