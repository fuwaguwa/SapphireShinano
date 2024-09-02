import "./lib/Setup";

import { LogLevel, SapphireClient } from "@sapphire/framework";
import { Options, Partials } from "discord.js";
import { config } from "dotenv";
import { connectToDatabase, startCatchers } from "./lib/Utils";
config();

const client = new SapphireClient({
	logger: {
		level: LogLevel.Debug,
	},
	shards: "auto",
	intents: 513,
	partials: [Partials.Channel],
	loadMessageCommandListeners: true,
	sweepers: {
		...Options.DefaultSweeperSettings,
		messages: {
			interval: 1200,
			lifetime: 1800,
		},
		users: {
			interval: 3600,
			filter: () => user => user.bot && user.id !== client.user.id,
		},
	},
});

const main = async () =>
{
	try
	{
		client.logger.info("Starting error catchers");
		startCatchers(client);

		connectToDatabase();

		client.logger.info("Logging in");
		await client.login(process.env.botToken);
	}
	catch (error)
	{
		client.logger.fatal(error);
		await client.destroy();
		process.exit(1);
	}
};

void main();