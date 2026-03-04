CREATE TABLE `deliveries` (
	`id` int AUTO_INCREMENT NOT NULL,
	`trackingNumber` varchar(50) NOT NULL,
	`clientName` varchar(150) NOT NULL,
	`originCity` varchar(100) NOT NULL,
	`destinationCity` varchar(100) NOT NULL,
	`region` varchar(100) NOT NULL,
	`weight` int NOT NULL,
	`value` decimal(10,2) NOT NULL,
	`status` enum('pending','collected','in_transit','delivered','delayed','cancelled') NOT NULL DEFAULT 'pending',
	`vehicleId` int,
	`scheduledDeliveryDate` timestamp NOT NULL,
	`actualDeliveryDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `deliveries_id` PRIMARY KEY(`id`),
	CONSTRAINT `deliveries_trackingNumber_unique` UNIQUE(`trackingNumber`)
);
--> statement-breakpoint
CREATE TABLE `operationalCosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`vehicleId` int NOT NULL,
	`costType` enum('fuel','maintenance','toll','insurance','salary') NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`description` text,
	`date` timestamp NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `operationalCosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `routes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`routeCode` varchar(50) NOT NULL,
	`vehicleId` int NOT NULL,
	`region` varchar(100) NOT NULL,
	`totalDistance` int NOT NULL,
	`totalDeliveries` int NOT NULL DEFAULT 0,
	`completedDeliveries` int NOT NULL DEFAULT 0,
	`status` enum('planned','in_progress','completed','cancelled') NOT NULL DEFAULT 'planned',
	`startDate` timestamp NOT NULL,
	`endDate` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `routes_id` PRIMARY KEY(`id`),
	CONSTRAINT `routes_routeCode_unique` UNIQUE(`routeCode`)
);
--> statement-breakpoint
CREATE TABLE `vehicles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`plate` varchar(20) NOT NULL,
	`model` varchar(100) NOT NULL,
	`capacity` int NOT NULL,
	`fuelConsumption` float NOT NULL,
	`status` enum('available','in_transit','maintenance') NOT NULL DEFAULT 'available',
	`currentLatitude` decimal(10,8),
	`currentLongitude` decimal(11,8),
	`currentRegion` varchar(100),
	`totalKmRun` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `vehicles_id` PRIMARY KEY(`id`),
	CONSTRAINT `vehicles_plate_unique` UNIQUE(`plate`)
);
