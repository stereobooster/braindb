DROP INDEX IF EXISTS `tasks_from_start`;--> statement-breakpoint
CREATE UNIQUE INDEX `tasks_source_start` ON `tasks` (`source`,`start`);