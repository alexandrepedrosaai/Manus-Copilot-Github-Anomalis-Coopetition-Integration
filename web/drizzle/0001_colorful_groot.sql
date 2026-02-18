CREATE TABLE `anomalies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`externalId` varchar(64) NOT NULL,
	`type` enum('ledger_divergence','dao_vote_failure','commit_anomaly','node_desync','network_latency','data_corruption') NOT NULL,
	`description` text NOT NULL,
	`severity` enum('low','medium','high','critical') NOT NULL,
	`status` enum('detected','investigating','resolved','ignored') NOT NULL DEFAULT 'detected',
	`source` varchar(255) NOT NULL,
	`metadata` json,
	`detectedAt` timestamp NOT NULL,
	`resolvedAt` timestamp,
	`resolution` text,
	`blockchainTxHash` varchar(128),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `anomalies_id` PRIMARY KEY(`id`),
	CONSTRAINT `anomalies_externalId_unique` UNIQUE(`externalId`)
);
--> statement-breakpoint
CREATE TABLE `searchHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int,
	`query` text NOT NULL,
	`resultsCount` int DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `searchHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `searchHistory` ADD CONSTRAINT `searchHistory_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;