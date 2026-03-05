CREATE TABLE `chat_history` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`role` varchar(10) NOT NULL,
	`content` text NOT NULL,
	`sentiment` varchar(20),
	`sentimentScore` int,
	`sources` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_history_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `doctor_mappings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`symptom` varchar(255) NOT NULL,
	`specialty` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `doctor_mappings_id` PRIMARY KEY(`id`),
	CONSTRAINT `doctor_mappings_symptom_unique` UNIQUE(`symptom`)
);
--> statement-breakpoint
CREATE TABLE `emotion_logs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`dominantEmotion` varchar(20) NOT NULL,
	`emotionProbs` text NOT NULL,
	`negativeEmotionScore` int,
	`imageUrl` varchar(512),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `emotion_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `symptom_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`symptom` varchar(255) NOT NULL,
	`possibleConditions` text NOT NULL,
	`severityScore` int,
	`riskClassification` varchar(20),
	`pubmedSources` text NOT NULL,
	`recommendedNextSteps` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `symptom_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `chat_history` ADD CONSTRAINT `chat_history_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `emotion_logs` ADD CONSTRAINT `emotion_logs_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `symptom_records` ADD CONSTRAINT `symptom_records_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;