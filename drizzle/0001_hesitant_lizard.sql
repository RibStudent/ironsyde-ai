CREATE TABLE `avatars` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`prompt` text NOT NULL,
	`negativePrompt` text,
	`imageUrl` text NOT NULL,
	`thumbnailUrl` text,
	`model` varchar(128) NOT NULL,
	`isNsfw` boolean NOT NULL DEFAULT true,
	`width` int DEFAULT 1024,
	`height` int DEFAULT 1024,
	`seed` int,
	`steps` int DEFAULT 30,
	`guidanceScale` int DEFAULT 7,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `avatars_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `generationHistory` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`avatarId` varchar(64),
	`prompt` text NOT NULL,
	`model` varchar(128) NOT NULL,
	`status` enum('pending','processing','completed','failed') NOT NULL DEFAULT 'pending',
	`errorMessage` text,
	`creditsUsed` int NOT NULL DEFAULT 1,
	`processingTime` int,
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `generationHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `credits` int DEFAULT 12000 NOT NULL;