import {
	AttachmentBuilder,
	ButtonInteraction,
	ChatInputCommandInteraction,
	EmbedBuilder,
	Guild,
	Interaction,
	TextChannel,
	User,
	VoiceChannel
} from "discord.js";
import { cyan } from "colorette";
import {
	ChatInputCommandSuccessPayload,
	Command,
	container,
	ContextMenuCommandSuccessPayload,
	MessageCommandSuccessPayload,
	SapphireClient
} from "@sapphire/framework";
import {
	ChatInputCommandSubcommandMappingMethod,
	ChatInputSubcommandSuccessPayload
} from "@sapphire/plugin-subcommands";
import pm2 from "pm2";
import mongoose from "mongoose";
import { buttonCooldown, collectors, ownerId, pageCollectors } from "./Constants";
import T2C from "table2canvas";
import { TableOptions } from "../typings/Utils";
import { Canvas } from "canvas";
import RssParser from "rss-parser";

const parser = new RssParser();

function getGuildInfo(guild: Guild | null): string
{
	return guild == null ? "| Direct Message" : `${guild.name} - ${cyan(guild.id)} `;
}

function getAuthorInfo(author: User): string
{
	return `${author.username} - ${cyan(author.id)}`;
}

function getCommandInfo(command: Command): string
{
	return cyan(command.name);
}

function getShardInfo(shardId: number)
{
	return `${cyan(shardId.toString())}`;
}

export function getSuccessfulLoggerData(guild: Guild | null, user: User, command: Command)
{
	const shard = getShardInfo(guild?.shardId ?? 0);
	const commandName = getCommandInfo(command);
	const author = getAuthorInfo(user);
	const originGuild = getGuildInfo(guild);

	return { shard, commandName, author, originGuild, };
}

export function logSuccessfulCommand(payload: ContextMenuCommandSuccessPayload | ChatInputCommandSuccessPayload | MessageCommandSuccessPayload | ChatInputSubcommandSuccessPayload, subcommand?: ChatInputCommandSubcommandMappingMethod): void
{
	let successData: ReturnType<typeof getSuccessfulLoggerData>;

	if ("interaction" in payload)
	{
		successData = getSuccessfulLoggerData(payload.interaction.guild, payload.interaction.user, payload.command);
	}
	else
	{
		successData = getSuccessfulLoggerData(payload.message.guild, payload.message.author, payload.command);
	}

	let subcommandName = "";
	if (subcommand) subcommandName = ` ${subcommand.name}`;

	container.logger.debug(`[${successData.shard}]: ${successData.commandName}${subcommandName} | ${successData.author} | ${successData.originGuild}`);
}

/**
 * Update server count on bot listings
 */
export async function updateServerCount()
{
	if (container.client.user.id === "1002189046619045908") return "Not Main Bot";
	// On Discord Services
	await fetch("https://api.discordservices.net/bot/1002193298229829682/stats", {
		method: "POST",
		headers: {
			Authorization: process.env.discordServicesApiKey,
		},
		body: JSON.stringify({
			servers: this.cclient.guilds.cache.size,
		}),
	});

	// On Top.gg
	await fetch("https://top.gg/api/bots/1002193298229829682/stats", {
		method: "POST",
		headers: {
			"content-type": "application/json",
			Authorization: process.env.topggApiKey,
		},
		body: JSON.stringify({
			server_count: container.client.guilds.cache.size,
		}),
	});

	// On Logging Server
	const guild: Guild = await container.client.guilds.fetch("1002188088942022807");
	const channel = (await guild.channels.fetch(
		"1017460364658610306"
	)) as VoiceChannel;

	await channel.setName(`Server Count: ${container.client.guilds.cache.size}`);
}

/**
 * Restart process with pm2
 */
export function restartBot()
{
	pm2.connect((err) =>
	{
		if (err) return console.error(err);

		pm2.restart("SapphireShinano", (err, apps) =>
		{
			if (err)
			{
				console.error(err);
				return pm2.disconnect();
			}
			return pm2.disconnect();
		});
	});
}

export function connectToDatabase()
{
	mongoose.connect(process.env.mongoDB).catch((err) =>
	{
		console.log(err);
	});
}

/**
 * Starts error catching
 */
export function startCatchers(client: SapphireClient)
{
	let connectingAttempt: number = 0;
	let connectedToDatabase: boolean = false;
	process.on("unhandledRejection", async (err: any) =>
	{
		/**
		 * Unknown interaction and unknown message error
		 * Usually caused by connection error in the VPS, haven't found any perma fix yet :(
		 */
		// if (
		// 	["DiscordAPIError[10062]", "DiscordAPIError[10008]"].includes(err.name)
		// )
		// {
		// 	console.error(err);
		// 	return restartBot();
		// }

		console.error("Unhandled Promise Rejection:\n" + err);
	});

	process.on("uncaughtException", async (err) =>
	{
		console.error	("Uncaught Promise Exception:\n" + err);
	});

	process.on("uncaughtExceptionMonitor", async (err) =>
	{
		console.error("Uncaught Promise Exception (Monitor):\n" + err);
	});

	mongoose.connection.on("connecting", () =>
	{
		client.logger.info("Connecting to the database...");
	});

	mongoose.connection.on("connecting", () =>
	{
		connectingAttempt++;
		client.logger.info(`Connecting Attempt #${connectingAttempt}`);
	});

	mongoose.connection.on("connected", () =>
	{
		connectedToDatabase = true;
		client.logger.info("Connected to the database!");
	});

	mongoose.connection.on("disconnected", () =>
	{
		client.logger.error("Lost database connection...");

		if (connectedToDatabase)
		{
			restartBot();
		}
		else
		{
			client.logger.info("Attempting to reconnect to the database...");
			connectToDatabase();
		}
	});

	mongoose.connection.on("reconnected", () =>
	{
		this.logger.info("Reconnected to the database!");
	});

	mongoose.connection.on("error", (err) =>
	{
		this.logger.error(err);
	});
}

/**
 * Check if a link is a direct image/GIF link
 * @param url image/GIF url
 * @returns boolean
 */
export function isImageAndGif(url: string)
{
	return url.match(/^http[^\?]*.(jpg|jpeg|png|gif)(\?(.*))?$/gim) != null;
}

/**
 * Check the cooldown of an user (on buttons)
 * @param id
 * @param interaction
 */
export async function buttonCooldownCheck(id: string, interaction: ButtonInteraction): Promise<boolean>
{
	if (buttonCooldown.has(`${id}${ownerId}`)) buttonCooldown.delete(`${id}${ownerId}`);

	if (buttonCooldown.has(`${id}${interaction.user.id}`))
	{
		const cms = buttonCooldown.get(`${id}${interaction.user.id}`);
		const onChillOut = new EmbedBuilder()
			.setTitle("You're on cooldown!")
			.setDescription(`You will be able to use the button again <t:${cms/1000}:R>`)
			.setColor("Red");
		await interaction.reply({ embeds: [onChillOut], ephemeral: true, });
		return true;
	}
	return false;
}

/**
 * Set the cooldown for buttons
 * @param id
 * @param interaction
 */
export function buttonCooldownSet(id: string, interaction: ButtonInteraction)
{
	buttonCooldown.set(`${id}${interaction.user.id}`, Date.now() + 5000);
	setTimeout(() =>
	{
		buttonCooldown.delete(`${id}${interaction.user.id}`);
	}, 5000);
}

/**
 * Refresh the user collectors collection
 * @param interaction
 */
export function collectorsRefresh(interaction: ChatInputCommandInteraction | Interaction)
{
	if (collectors.has(interaction.user.id))
	{
		const collector = collectors.get(interaction.user.id);
		if (!collector.ended) collector.stop();
		collectors.delete(interaction.user.id);
	}

	if (pageCollectors.has(interaction.user.id))
	{
		const pageCollector = pageCollectors.get(interaction.user.id);
		if (!pageCollector.ended) pageCollector.stop();
		pageCollectors.delete(interaction.user.id);
	}
}

/**
 * Title case a string
 * @param str string to turn into title case
 * @returns title cased str
 */
export function toTitleCase(str: string)
{
	return str
		.toLowerCase()
		.split(" ")
		.map((word) =>
		{
			return word.charAt(0).toUpperCase() + word.slice(1);
		})
		.join(" ");
}

export async function createTable({ columns, dataSrc, columnSize, firstColumnSize, }: TableOptions)
{
	// Structure
	const tableColumns: any[] = [];
	for (let i = 0; i < columns.length; i++)
	{
		let column = {
			title: columns[i],
			dataIndex: columns[i],
			textAlign: "center",
			textColor: "rgba(255, 255, 255, 1)",
			titleColor: "rgba(255, 255, 255, 1)",
			titleFontSize: "29px",
			textFontSize: "29px",
		};

		if (i == 1 && firstColumnSize)
		{
			column = Object.assign({ width: firstColumnSize, }, column);
		}
		else if (columnSize)
		{
			column = Object.assign({ width: columnSize, }, column);
		}

		tableColumns.push(column);
	}

	const table = new T2C({
		canvas: new Canvas(4, 4),
		columns: tableColumns,
		dataSource: dataSrc,
		bgColor: "#2b2d31",
	});

	// Uploading the image + returning the link
	const guild: Guild = await container.client.guilds.fetch("1002188088942022807");
	const channel = await guild.channels.fetch("1022191350835331203");

	const statsMessage = await (channel as TextChannel).send({
		files: [
			new AttachmentBuilder(table.canvas.toBuffer(), { name: "image.png", })
		],
	});
	return statsMessage.attachments.first().url;
}

let rssRetries: number = 0;
/**
 * Parse an RSS feed for a twitter user
 * @param user twitter username
 */
export async function getRSSFeed(user: string)
{
	try
	{
		const feed = await parser.parseURL(`https://twiiit.com/${user}/rss`);
		rssRetries = 0;
		return feed;
	}
	catch (error)
	{
		rssRetries++;
		if (rssRetries < 5)
		{
			return getRSSFeed(user);
		}
		else
		{
			rssRetries = 0;
			console.error(error);
		}
	}
}

/**
 * Removes HTML tags from a string
 * @param str string
 * @returns string
 */
export function formatString(str)
{
	str.toString();
	return str.replace(/(<([^>]+)>)/gi, "");
}