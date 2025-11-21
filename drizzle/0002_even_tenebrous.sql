CREATE TABLE `conversations` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`avatarId` varchar(64) NOT NULL,
	`title` varchar(255),
	`avatarPersonality` text,
	`lastMessageAt` timestamp DEFAULT (now()),
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `conversations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`role` enum('user','assistant') NOT NULL,
	`content` text NOT NULL,
	`imageUrl` text,
	`audioUrl` text,
	`metadata` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`tier` enum('free','standard','premium') NOT NULL DEFAULT 'free',
	`status` enum('active','canceled','expired') NOT NULL DEFAULT 'active',
	`stripeCustomerId` varchar(255),
	`stripeSubscriptionId` varchar(255),
	`currentPeriodStart` timestamp,
	`currentPeriodEnd` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `voiceCalls` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`conversationId` varchar(64) NOT NULL,
	`twilioCallSid` varchar(255),
	`status` enum('initiated','ringing','in-progress','completed','failed') NOT NULL DEFAULT 'initiated',
	`duration` int,
	`recordingUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	`endedAt` timestamp,
	CONSTRAINT `voiceCalls_id` PRIMARY KEY(`id`)
);
