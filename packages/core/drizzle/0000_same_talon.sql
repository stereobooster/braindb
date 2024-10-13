CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`path` text NOT NULL,
	`frontmatter` text NOT NULL,
	`ast` text NOT NULL,
	`markdown` text NOT NULL,
	`mtime` real NOT NULL,
	`checksum` text NOT NULL,
	`slug` text NOT NULL,
	`url` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from` text NOT NULL,
	`to` text,
	`start` integer NOT NULL,
	`to_slug` text,
	`to_url` text,
	`to_path` text,
	`to_anchor` text,
	`label` text,
	`line` integer NOT NULL,
	`column` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `slug` ON `documents` (`slug`);--> statement-breakpoint
CREATE INDEX `url` ON `documents` (`url`);--> statement-breakpoint
CREATE UNIQUE INDEX `path` ON `documents` (`path`);--> statement-breakpoint
CREATE INDEX `to_slug` ON `links` (`to_slug`);--> statement-breakpoint
CREATE INDEX `to_url` ON `links` (`to_url`);--> statement-breakpoint
CREATE INDEX `to_path` ON `links` (`to_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `from_start` ON `links` (`from`,`start`);