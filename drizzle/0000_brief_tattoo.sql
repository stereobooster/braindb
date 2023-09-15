CREATE TABLE `documents` (
	`id` text PRIMARY KEY NOT NULL,
	`path` text NOT NULL,
	`slug` text NOT NULL,
	`url` text NOT NULL,
	`checksum` text NOT NULL,
	`frontmatter` text NOT NULL,
	`ast` text NOT NULL,
	`markdown` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`from_id` text NOT NULL,
	`from` text NOT NULL,
	`start` integer NOT NULL,
	`to_id` text,
	`to` text,
	`ast` text NOT NULL,
	`label` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `path` ON `documents` (`path`);--> statement-breakpoint
CREATE UNIQUE INDEX `from_start` ON `links` (`from`,`start`);