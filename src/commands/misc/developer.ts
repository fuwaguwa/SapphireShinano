import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import util from "util";
import { EmbedBuilder, codeBlock, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, TextChannel, MessageCreateOptions } from "discord.js";
import User from "../../schemas/User";
import { collectors } from "../../lib/Constants";
import News from "../../schemas/ALNews";

@ApplyOptions<SubcommandOptions>({
	description: "N/A",
	cooldownLimit: 1,
	cooldownDelay: 100000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	preconditions: ["OwnerOnly"],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{ name: "eval", chatInputRun: "subcommandEval", },
		{ name: "vote-check", chatInputRun: "subcommandVote", },
		{ name: "tweet", chatInputRun: "subcommandTweet", },
		{
			name: "blacklist",
			type: "group",
			entries: [
				{
					name: "add",
					chatInputRun: "subcommandBLAdd",
				},
				{
					name: "remove",
					chatInputRun: "subcommandBLRemove",
				},
				{
					name: "check",
					chatInputRun: "subcommandBLCheck",
				}
			],
		}
	],
})
export class DeveloperCommand extends Subcommand
{
	public override async registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("eval")
						.setDescription("N/A")
						.addStringOption(option =>
							option
								.setName("code")
								.setDescription("N/A")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("vote-check")
						.setDescription("Check an user's vote status")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to check vote of.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("tweet")
						.setDescription("N/A")
						.addStringOption(option =>
							option
								.setName("url")
								.setDescription("N/A")
								.setRequired(true)
						)
				)
				.addSubcommandGroup(command =>
					command
						.setName("blacklist")
						.setDescription("N/A")
						.addSubcommand(command =>
							command
								.setName("add")
								.setDescription("Add someone to the bot's blacklist.")
								.addUserOption(option =>
									option
										.setName("user")
										.setDescription("N/A")
										.setRequired(true)
								)
						)
						.addSubcommand(command =>
							command
								.setName("remove")
								.setDescription("Remove someone from the bot's blacklist.")
								.addUserOption(option =>
									option
										.setName("user")
										.setDescription("N/A")
										.setRequired(true)
								)
						)
						.addSubcommand(command =>
							command
								.setName("check")
								.setDescription("Check if an user is blacklisted or not.")
								.addUserOption(option =>
									option
										.setName("user")
										.setDescription("N/A")
										.setRequired(true)
								)
						)
				)
		);
	}

	/**
	 * /developer eval
	 * @param interaction
	 */
	public async subcommandEval(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const code: string = interaction.options.getString("code");

		let output: string = await new Promise((resolve, reject) => {resolve(eval(code));});
		if (typeof output !== "string") output = util.inspect(output, { depth: 0, });

		await interaction.editReply({
			content: codeBlock("js", output),
		});
	}

	/**
	 * /developer vote-check
	 * @param interaction
	 */
	public async subcommandVote(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const user = interaction.options.getUser("user");

		/**
		 * Database Info
		 */
		let voteTime: number | string;
		let voteStatus: boolean | string = true;

		const voteUser = await User.findOne({ userId: user.id, });

		if (voteUser.lastVoteTimestamp)
		{
			const currentTime = Math.floor(Date.now() / 1000);
			voteTime = voteUser.lastVoteTimestamp;

			if (currentTime - voteUser.lastVoteTimestamp >= 43200) voteStatus = false;
		}
		else
		{
			voteStatus = "N/A";
			voteTime = "N/A";
		}

		/**
		 * Top.gg Database
		 */
		let topggVoteStatus: boolean = false;

		const response = await fetch(
			`https://top.gg/api/bots/1002193298229829682/check?userId=${user.id}`,
			{
				method: "GET",
				headers: {
					Authorization: process.env.topggApiKey,
				},
			}
		);
		const topggResult = await response.json();
		if (topggResult.voted == 1) topggVoteStatus = true;

		const voteEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.addFields(
				{
					name: "Top.gg Database:",
					value: `Voted: ${topggVoteStatus}`,
				},
				{
					name: "Shinano Database:",
					value:
						`Voted: ${voteStatus}\n` +
						`Last Voted: ${
							typeof voteTime != "string"
								? `<t:${voteTime}:R> | <t:${voteTime}>`
								: "N/A"
						}`,
				}
			);
		const dbUpdate: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setLabel("Update user in database")
					.setEmoji({ name: "✅", })
					.setStyle(ButtonStyle.Success)
					.setCustomId("ADB")
					.setDisabled(false)
			);

		/**
		 * Collector
		 */
		const message = await interaction.editReply({
			embeds: [voteEmbed],
			components: [dbUpdate],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 60000,
		});

		collectors.set(interaction.user.id, collector);

		collector.on("collect", async (i) =>
		{
			if (i.user.id !== "836215956346634270")
			{
				return  i.reply({
					content: "This button is only for developers!",
					ephemeral: true,
				});
			}

			if (!voteUser)
			{
				await User.create({
					userId: user.id,
					commandsExecuted: 0,
					lastVoteTimestamp: Math.floor(Date.now() / 1000),
				});
			}
			else
			{
				await voteUser.updateOne({
					lastVoteTimestamp: Math.floor(Date.now() / 1000),
				});
			}

			const updatedEmbed: EmbedBuilder = new EmbedBuilder()
				.setColor("Green")
				.setDescription("✅ | Updated the database!");
			await i.reply({
				embeds: [updatedEmbed],
				ephemeral: true,
			});

			collector.stop();
		});

		collector.on("end", async (collected, reason) =>
		{
			dbUpdate.components[0].setDisabled(true);
			await interaction.editReply({ components: [dbUpdate], });
		});
	}

	/**
	 * /developer tweet
	 * @param interaction
	 */
	public async subcommandTweet(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const url = interaction.options.getString("url");
		const server = url.includes("azurlane_staff") ? "JP" : "EN";
		const messageOptions: MessageCreateOptions = {
			content: `__Shikikans, there's a new message from ${server} HQ!__\n` + url,
		};

		for await (const doc of News.find())
		{
			try
			{
				const guild = await this.container.client.guilds.fetch(doc.guildId);
				const channel = await guild.channels.fetch(doc.channelId);

				await (channel as TextChannel).send(messageOptions);
			}
			catch (error)
			{
				console.warn(error);
			}
		}

		const confirmed: EmbedBuilder = new EmbedBuilder()
			.setColor("Green")
			.setDescription("✅ | Sent out tweets to all server!");
		await interaction.editReply({ embeds: [confirmed], });
	}

	/**
	 * /developer blacklist add
	 * @param interaction
	 */
	public async subcommandBLAdd(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const user = await User.findOne({
			userId: interaction.options.getUser("user").id,
		});

		if (!user)
		{
			await User.create({
				userId: interaction.options.getUser("user").id,
				commandsExecuted: 0,
				blacklisted: true,
			});
		}
		else if (user.blacklisted)
		{
			const noOne = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					`${interaction.options.getUser("user")} has already been blacklisted!`
				);
			return interaction.editReply({ embeds: [noOne], });
		}
		else
		{
			await user.updateOne({ blacklisted: true, });
		}

		const success = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				`${interaction.options.getUser("user")} has been added to blacklist!`
			)
			.addFields({
				name: "User ID",
				value: interaction.options.getUser("user").id,
			})
			.setTimestamp();

		await interaction.editReply({ embeds: [success], });
	}

	/**
	 * /developer blacklist remove
	 * @param interaction
	 */
	public async subcommandBLRemove(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const user = await User.findOne({
			userId: interaction.options.getUser("user").id,
		});

		if (!user)
		{
			const noOne = new EmbedBuilder()
				.setColor("Red")
				.setDescription("User is not blacklisted!");
			return interaction.editReply({ embeds: [noOne], });
		}
		else if (user.blacklisted)
		{
			await user.updateOne({ blacklisted: false, });
		}
		else
		{
			const noOne = new EmbedBuilder()
				.setColor("Red")
				.setDescription("User is not blacklisted!");
			return interaction.editReply({ embeds: [noOne], });
		}

		const success = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				`${interaction.options.getUser(
					"user"
				)} has been removed from the blacklist!`
			)
			.setTimestamp();

		await interaction.editReply({ embeds: [success], });
	}

	/**
	 * /developer blacklist check
	 * @param interaction
	 */
	public async subcommandBLCheck(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const user = await User.findOne({
			userId: interaction.options.getUser("user").id,
		});

		if (user.blacklisted)
		{
			const blacklisted = new EmbedBuilder()
				.setColor("Red")
				.setTitle("Uh oh, user is blacklisted!")
				.addFields({
					name: "User:",
					value: `${interaction.options.getUser("user")}`,
				});
			await interaction.editReply({ embeds: [blacklisted], });
		}
		else
		{
			const noOne = new EmbedBuilder()
				.setColor("Red")
				.setDescription("User is not blacklisted!");
			await interaction.editReply({ embeds: [noOne], });
		}
	}
}