import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { envParseArray } from "@skyra/env-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<SubcommandOptions>({
	description: "Utilities commands",
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "ping",
			chatInputRun: "subcommandPing",
		},
		{
			name: "info",
			chatInputRun: "subcommandInfo",
		},
		{
			name: "pat",
			chatInputRun: "subcommandPat",
		},
		{
			name: "stats",
			chatInputRun: "subcommandStats",
		},
		{
			name: "support",
			chatInputRun: "subcommandSupport",
		},
		{
			name: "vote",
			chatInputRun: "subcommandVote",
		}
	],
})
export class ShinanoCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName("shinano")
				.setDescription("Shinano Utilities Commands")
				.addSubcommand(command =>
					command
						.setName("ping")
						.setDescription("Pong!")
				)
				.addSubcommand(command =>
					command
						.setName("info")
						.setDescription("Information about Shinano.")
				)
				.addSubcommand(command =>
					command
						.setName("pat")
						.setDescription("Headpats for the floof.")
				)
				.addSubcommand(command =>
					command
						.setName("stats")
						.setDescription("Display Shinano's stats")
				)
				.addSubcommand(command =>
					command
						.setName("support")
						.setDescription("Got a problem? Run this command!")
				)
				.addSubcommand(command =>
					command
						.setName("vote")
						.setDescription("Vote for Shinano, or check your vote status.")
				)
		);
	}

	/**
	 * /shinano ping
	 * @param interaction interaction
	 */
	public async subcommandPing(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const pingEmbed = new EmbedBuilder()
			.setTitle("Pong 🏓")
			.setDescription(
				`Latency: ${
					Date.now() - interaction.createdTimestamp
				}ms\nAPI Latency: ${Math.round(this.container.client.ws.ping)}ms`
			)
			.setColor("#2b2d31");

		await interaction.reply({ embeds: [pingEmbed], });

	}

	/**
	 * /shinano info
	 * @param interaction interaction
	 */
	public async subcommandInfo(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const APIs = [
			"[AzurAPI](https://github.com/AzurAPI/azurapi-js)",
			"[RapidAPI](https://rapidapi.com/)",
			"[SauceNAO](https://saucenao.com/)",
			"[Some Random API](https://some-random-api.ml/)",
			"[waifu.pics](https://waifu.pics)",
			"[nekos.fun](https://nekos.fun)",
			"[nekos.life](https://nekos.life)",
			"[nekos.best](https://nekos.best)",
			"[nekobot](https://nekobot.xyz/api)",
			"[jikan.moe](https://jikan.moe)",
			"[genshin-db](https://github.com/theBowja/genshin-db)"
		];

		const shinanoEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle("Shinano")
			.setDescription(
				"The Multi-Purpose Azur Lane/Genshin Bot!\n\n" +
				"Developer: [**Fuwafuwa**](https://github.com/fuwaguwa)\n" +
				"Art by [**SG**](https://www.pixiv.net/en/users/34452206) and [**Nagi Ria**](https://twitter.com/nagi_lria)\n" +
				"Special Thanks: [**LaziestBoy**](https://github.com/kaisei-kto)\n\n" +
				`**APIs**: ${APIs.join(", ")}\n\n` +
				"Liking the bot so far? Please **vote** and leave Shinano a **rating** on **top.gg**!"
			);

		const mainButtons: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().setComponents(
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ name: "👋", })
			    .setLabel("Invite Shinano!")
			    .setURL(
			      "https://discord.com/api/oauth2/authorize?client_id=1002193298229829682&permissions=137439332480&scope=bot%20applications.commands"
			    ),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ name: "⚙️", })
			    .setLabel("Support Server")
			    .setURL("https://discord.gg/NFkMxFeEWr"),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ id: "1065583023086641203", })
			    .setLabel("Contribute")
			    .setURL("https://github.com/fuwaguwa/Shinano")
			);
		const linkButtons: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().setComponents(
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ id: "1002849574517477447", })
			    .setLabel("top.gg")
			    .setURL("https://top.gg/bot/1002193298229829682"),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ name: "🤖", })
			    .setLabel("discordbotlist.com")
			    .setURL("https://discord.ly/shinano"),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setEmoji({ name: "🔨", })
			    .setLabel("discordservices.net")
			    .setURL("https://discordservices.net/bot/1002193298229829682")
			);

		await interaction.reply({
			embeds: [shinanoEmbed],
			components: [mainButtons, linkButtons],
		});
	}

	/**
	 * /shinano pat
	 * @param interaction interaction
	 */
	public async subcommandPat(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const headpatEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(
				[
					"\"Aah... My ears are sensitive...\"",
					"\"Alas... This one's ears are sensitive...\""
				][Math.floor(Math.random() * 2)]
			)
			.setImage(
				"https://cdn.discordapp.com/attachments/1002189321631187026/1034474955116662844/shinano_azur_lane_drawn_by_nagi_ria__3c37724853c358bebf5bc5668e0d4314_1.gif"
			);
		await interaction.reply({ embeds: [headpatEmbed], });
	}

	/**
	 * /shinano stats
	 * @param interaction interaction
	 */
	public async subcommandStats(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		/**
		 * Top.gg Stats
		 */
		const response = await fetch("https://top.gg/api/bots/1002193298229829682", {
			method: "GET",
			headers: {
				Authorization: process.env.topggApiKey,
			},
		});
		const topggStats = await response.json();

		/**
		 * Uptime
		 */
		let totalSeconds = this.container.client.uptime / 1000;
		totalSeconds %= 86400;

		let hours = Math.floor(totalSeconds / 3600);
		totalSeconds %= 3600;

		let minutes = Math.floor(totalSeconds / 60);
		let seconds = Math.floor(totalSeconds % 60);

		/**
		 * Output
		 */
		// Outputting Data
		const performanceEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle("Shinano's Stats")
			.addFields(
				{
					name: "Uptime:",
					value: `${hours} hours, ${minutes} minutes, ${seconds} seconds`,
				},
				{
					name: "Bot Stats:",
					value:
							`Total Guilds: **${this.container.client.guilds.cache.size}**\n` +
							`Current Votes: **${topggStats.monthlyPoints}**\n` +
							`Total Votes: **${topggStats.points}**\n`,
				}
			);
		await interaction.editReply({ embeds: [performanceEmbed	], });
	}

	/**
	 * /shinano support
	 * @param interaction interaction
	 */
	public async subcommandSupport(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const supportEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(
				"If you encounter any issues pertaining to my services, kindly reach out to my creator through the support server provided below..."
			);

		const supportButton: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setLabel("Support Server")
			    .setEmoji({ name: "⚙️", })
			    .setURL("https://discord.gg/NFkMxFeEWr")
			);

		await interaction.reply({
			embeds: [supportEmbed],
			components: [supportButton],
		});
	}

	/**
	 * /shinano vote
	 * @param interaction
	 */
	public async subcommandVote(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const voteEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(
				"You may cast your vote for me down below. I express my gratitude for your unwavering support!\n"
			);

		const links1: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setLabel("Vote on top.gg")
			    .setEmoji({ id: "1002849574517477447", })
			    .setURL("https://top.gg/bot/1002193298229829682/vote"),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Secondary)
			    .setLabel("Check top.gg Vote")
			    .setEmoji({ name: "🔍", })
			    .setCustomId("VOTE-CHECK")
			);
		const links2: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setLabel("Vote on discordbotlist.com")
			    .setURL("https://discordbotlist.com/bots/shinano/upvote")
			    .setEmoji({ name: "🤖", }),
			  new ButtonBuilder()
			    .setStyle(ButtonStyle.Link)
			    .setLabel("Vote on discordservices.net")
			    .setURL("https://discordservices.net/bot/1002193298229829682")
			    .setEmoji({ name: "🔨", })
			);

		await interaction.editReply({
			embeds: [voteEmbed],
			components: [links1, links2],
		});
	}
}