CREATE TABLE `onlyfansAccounts` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`username` varchar(255) NOT NULL,
	`encryptedPassword` text NOT NULL,
	`sessionCookies` json,
	`lastLoginAt` timestamp,
	`profileName` varchar(255),
	`profileImage` text,
	`subscriberCount` int DEFAULT 0,
	`autoResponseEnabled` boolean NOT NULL DEFAULT true,
	`autoContentDelivery` boolean NOT NULL DEFAULT false,
	`responseDelay` int DEFAULT 30,
	`isActive` boolean NOT NULL DEFAULT true,
	`lastSyncAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()),
	CONSTRAINT `onlyfansAccounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onlyfansAnalytics` (
	`id` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`date` timestamp NOT NULL,
	`messagesReceived` int DEFAULT 0,
	`messagesSent` int DEFAULT 0,
	`aiResponseRate` int DEFAULT 0,
	`avgResponseTime` int DEFAULT 0,
	`tipsReceived` int DEFAULT 0,
	`ppvSales` int DEFAULT 0,
	`totalRevenue` int DEFAULT 0,
	`newSubscribers` int DEFAULT 0,
	`activeConversations` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `onlyfansAnalytics_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onlyfansContentRequests` (
	`id` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`messageId` varchar(64),
	`subscriberId` varchar(255) NOT NULL,
	`subscriberUsername` varchar(255) NOT NULL,
	`requestType` varchar(64) NOT NULL,
	`requestDescription` text,
	`generatedAvatarId` varchar(64),
	`generatedContentUrl` text,
	`priceUsd` int,
	`isPaid` boolean NOT NULL DEFAULT false,
	`status` varchar(64) NOT NULL DEFAULT 'pending',
	`createdAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	CONSTRAINT `onlyfansContentRequests_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `onlyfansMessages` (
	`id` varchar(64) NOT NULL,
	`accountId` varchar(64) NOT NULL,
	`subscriberId` varchar(255) NOT NULL,
	`subscriberUsername` varchar(255) NOT NULL,
	`subscriberAvatar` text,
	`messageType` varchar(64) NOT NULL,
	`content` text,
	`mediaUrls` json,
	`isIncoming` boolean NOT NULL,
	`aiGenerated` boolean NOT NULL DEFAULT false,
	`aiModel` varchar(128),
	`responseTime` int,
	`isRead` boolean NOT NULL DEFAULT false,
	`needsManualReview` boolean NOT NULL DEFAULT false,
	`wasSent` boolean NOT NULL DEFAULT false,
	`onlyfansMessageId` varchar(255),
	`threadId` varchar(255),
	`createdAt` timestamp DEFAULT (now()),
	`sentAt` timestamp,
	CONSTRAINT `onlyfansMessages_id` PRIMARY KEY(`id`)
);
