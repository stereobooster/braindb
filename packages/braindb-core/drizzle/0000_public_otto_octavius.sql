CREATE TABLE `documents` (
	`path` text PRIMARY KEY NOT NULL,
	`frontmatter` text NOT NULL,
	`ast` text NOT NULL,
	`markdown` text NOT NULL,
	`checksum` text NOT NULL,
	`slug` text NOT NULL,
	`url` text NOT NULL,
	`properties` text NOT NULL,
	`mtime` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`from` text NOT NULL,
	`to` text,
	`start` integer NOT NULL,
	`properties` text NOT NULL,
	`from_id` text NOT NULL,
	`to_id` text,
	`to_slug` text,
	`to_url` text,
	`to_path` text,
	`to_anchor` text,
	`label` text
);
--> statement-breakpoint
CREATE INDEX `slug` ON `documents` (`slug`);--> statement-breakpoint
CREATE INDEX `url` ON `documents` (`url`);--> statement-breakpoint
CREATE INDEX `to_slug` ON `links` (`to_slug`);--> statement-breakpoint
CREATE INDEX `to_url` ON `links` (`to_url`);--> statement-breakpoint
CREATE INDEX `to_path` ON `links` (`to_path`);--> statement-breakpoint
CREATE UNIQUE INDEX `from_start` ON `links` (`from`,`start`);