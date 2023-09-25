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
	`ast` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `from_start` ON `links` (`from`,`start`);