CREATE TABLE `documents` (
	`path` text PRIMARY KEY NOT NULL,
	`url` text,
	`checksum` text,
	`frontmatter` text NOT NULL,
	`ast` text,
	`markdown` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `links` (
	`path` text NOT NULL,
	`to` text,
	`ast` text
);
