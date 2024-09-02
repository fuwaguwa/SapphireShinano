import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ChannelType, EmbedBuilder, PermissionsBitField, TextChannel } from "discord.js";
import {
	getFromAnimation,
	getFromDefault,
	getFromPrivateCollection,
	getFromQuality,
	queryPrivateImage
} from "../../lib/Queries";
import { PrivateCollectionCategory, PrivateCollectionFileFormat } from "../../typings/Queries";
import Guild from "../../schemas/AutoLewd";

@ApplyOptions<SubcommandOptions>({
	description: "NSFW Commands - Anime & IRL",
	nsfw: true,
	cooldownLimit: 2,
	cooldownDelay: 5000,
	cooldownFilteredUsers: [...envParseArray("ownerIds")],
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	preconditions: ["Voted"],
	subcommands: [
		{
			name: "autohentai",
			type: "group",
			entries: [
				{ name: "set",
					chatInputRun: "subcommandAutoSet",
					preconditions: ["InMainServer"],
					requiredClientPermissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks, PermissionsBitField.Flags.AttachFiles],
					requiredUserPermissions: [PermissionsBitField.Flags.ManageWebhooks],

				},
				{
					name: "stop",
					chatInputRun: "subcommandAutoStop",
					requiredUserPermissions: [PermissionsBitField.Flags.ManageWebhooks],
				}
			],
		},
		{ name: "genshin", chatInputRun: "subcommandPrivateCollection", },
		{ name: "kemonomimi", chatInputRun: "subcommandPrivateCollection", },
		{ name: "misc", chatInputRun: "subcommandPrivateCollection", },
		{ name: "shipgirls", chatInputRun: "subcommandPrivateCollection", },
		{ name: "undies", chatInputRun: "subcommandPrivateCollection", },
		{ name: "uniform", chatInputRun: "subcommandPrivateCollection", },
		{ name: "honkai", chatInputRun: "subcommandPrivateCollection", },
		{ name: "random", chatInputRun: "subcommandPrivateCollection", },
		{ name: "bomb", chatInputRun: "subcommandBomb", },
		{ name: "quality-bomb", chatInputRun: "subcommandQualityBomb", preconditions: ["InMainServer"], },
		{ name: "animation-bomb", chatInputRun: "subcommandBomb", preconditions: ["InMainServer"], },
		{ name: "quality", chatInputRun: "subcommandQuality", preconditions: ["InMainServer"], },
		{ name: "animation", chatInputRun: "subcommandAnimation", },
		{ name: "ass", chatInputRun: "subcommandDefault", },
		{ name: "anal", chatInputRun: "subcommandDefault", },
		{ name: "paizuri", chatInputRun: "subcommandDefault", },
		{ name: "blowjob", chatInputRun: "subcommandDefault", },
		{ name: "pussy", chatInputRun: "subcommandDefault", }
	],
})
export class NSFWCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommandGroup(command =>
					command
						.setName("autohentai")
						.setDescription("Automatically post hentai!")
						.addSubcommand(command =>
							command
								.setName("set")
								.setDescription("Automatically post hentai into a channel every 5 minutes!")
								.addChannelOption(option =>
									option
										.setRequired(true)
										.setName("channel")
										.setDescription("Channel you want Shinano to post in.")
										.addChannelTypes([ChannelType.GuildText])
								)
						)
						.addSubcommand(command =>
							command
								.setName("stop")
								.setDescription("Stop autohentai job in the server.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("ass")
						.setDescription("Booty")
				)
				.addSubcommand(command =>
					command
						.setName("anal")
						.setDescription("There is another...")
				)
				.addSubcommand(command =>
					command
						.setName("paizuri")
						.setDescription("\"Take this, my special technique!\"")
				)
				.addSubcommand(command =>
					command
						.setName("blowjob")
						.setDescription("Playing the trumpet")
				)
				.addSubcommand(command =>
					command
						.setName("pussy")
						.setDescription("😺🐈")
				)
				.addSubcommand(command =>
					command
						.setName("genshin")
						.setDescription("gayshin impact")
				)
				.addSubcommand(command =>
					command
						.setName("random")
						.setDescription("Return images/GIFs/videos from a random category.")
				)
				.addSubcommand(command =>
					command
						.setName("honkai")
						.setDescription("Characters from the Honkai series (both of them!)")
				)
				.addSubcommand(command =>
					command
						.setName("undies")
						.setDescription("Undies, sportwears, swimsuits, bodysuits and stockings/thigh highs")
				)
				.addSubcommand(command =>
					command
						.setName("kemonomimi")
						.setDescription("Fox girls, cat girls, bunny girls, succubus and more!")
				)
				.addSubcommand(command =>
					command
						.setName("uniform")
						.setDescription("Maid, Office Lady, JK")
				)
				.addSubcommand(command =>
					command
						.setName("shipgirls")
						.setDescription("Azur Lane shipgirls")
				)
				.addSubcommand(command =>
					command
						.setName("misc")
						.setDescription("Miscellaneous content.")
				)
				.addSubcommand(command =>
					command
						.setName("bomb")
						.setDescription("Bombs you with lewdness!")
						.addStringOption(option =>
							option
								.setName("category")
								.setDescription("The category of the image. Ignore this option for random category.")
								.setChoices([
									{ name: "Shipgirls", value: "shipgirls", },
									{ name: "Undies", value: "undies", },
									{ name: "Genshin", value: "genshin", },
									{ name: "Honkai", value: "honkai", },
									{ name: "Kemonomimi", value: "kemonomimi", },
									{ name: "Misc", value: "misc", },
									{ name: "Uniform", value: "uniform", }
								])
						)
				)
				.addSubcommand(command =>
					command
						.setName("quality-bomb")
						.setDescription("Bombs you with (EXTRA) lewdness!")
						.addStringOption(option =>
							option
								.setName("category")
								.setDescription("The category of the image. Ignore this option for random category.")
								.setChoices([
									{ name: "Shipgirls", value: "shipgirls", },
									{ name: "Undies ⭐", value: "undies", },
									{ name: "Uniform ⭐", value: "uniform", },
									{ name: "Genshin ⭐", value: "genshin", },
									{ name: "Honkai", value: "honkai", },
									{ name: "Kemonomimi", value: "kemonomimi", },
									{ name: "Misc", value: "misc", }
								])
						)
				)
				.addSubcommand(command =>
					command
						.setName("animation-bomb")
						.setDescription("Bombs you with animations!")
						.addStringOption(option =>
							option
								.setName("type")
								.setDescription("File type. Ignore this option for random file type.")
								.setChoices([
									{ name: "Video", value: "mp4", },
									{ name: "GIF", value: "gif", },
									{ name: "Random", value: "animation", }
								])
						)
						.addStringOption(option =>
							option
								.setName("category")
								.setDescription("The category of the image. Ignore this option for random category.")
								.setChoices([
									{ name: "Shipgirls ⭐", value: "shipgirls", },
									{ name: "Genshin ⭐", value: "genshin", },
									{ name: "Undies", value: "undies", },
									{ name: "Kemonomimi", value: "kemonomimi", },
									{ name: "Misc", value: "misc", },
									{ name: "Uniform", value: "uniform", }
								])
						)
				)
				.addSubcommand(command =>
					command
						.setName("quality")
						.setDescription("High(er) quality images!")
						.addStringOption(option =>
							option
								.setName("category")
								.setDescription("The category of the image. Ignore this option for random category.")
								.setChoices([
									{ name: "Shipgirls", value: "shipgirls", },
									{ name: "Undies ⭐", value: "undies", },
									{ name: "Uniform ⭐", value: "uniform", },
									{ name: "Genshin ⭐", value: "genshin", },
									{ name: "Honkai", value: "honkai", },
									{ name: "Kemonomimi", value: "kemonomimi", },
									{ name: "Misc", value: "misc", }
								])
						)
				)
				.addSubcommand(command =>
					command
						.setName("animation")
						.setDescription("When pictures are not enough...")
						.addStringOption(option =>
							option
								.setName("type")
								.setDescription("File type. Ignore this option for random file type.")
								.setChoices([
									{ name: "Video", value: "mp4", },
									{ name: "GIF", value: "gif", },
									{ name: "Random", value: "animation", }
								])
						)
						.addStringOption(option =>
							option
								.setName("category")
								.setDescription("The category of the image. Ignore this option for random category.")
								.setChoices([
									{ name: "Shipgirls ⭐", value: "shipgirls", },
									{ name: "Genshin ⭐", value: "genshin", },
									{ name: "Undies", value: "undies", },
									{ name: "Kemonomimi", value: "kemonomimi", },
									{ name: "Misc", value: "misc", },
									{ name: "Uniform", value: "uniform", }
								])
						)
				)
		);
	}


	embed = new EmbedBuilder();

	public async subcommandPrivateCollection(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		return getFromPrivateCollection({ interaction, category: (interaction.options.getSubcommand() as PrivateCollectionCategory), embed: this.embed, });
	}

	public async subcommandBomb(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const category = interaction.options.getString("category") || "random";
		const type = interaction.options.getString("type") ||
			(interaction.options.getSubcommand() === "animation-bomb"
				? ["mp4", "gif", "animation"][Math.floor(3 * Math.random())]
				: "random");
		const bomb = await queryPrivateImage({ category: category as PrivateCollectionCategory, format: type as PrivateCollectionFileFormat, size: 5, });

		await interaction.editReply({ content: bomb.map(item => item.link).join("\n"), });
	}

	public async subcommandQualityBomb(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const category = interaction.options.getString("category") || "random";
		const bomb = await queryPrivateImage({ category: category as PrivateCollectionCategory, format: null, size: 5, fanbox: true, });

		await interaction.editReply({ content: bomb.map(item => item.link).join("\n"), });
	}

	public async subcommandQuality(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const tags = [
			"genshin",
			"kemonomimi",
			"shipgirls",
			"undies",
			"misc",
			"uniform"
		];
		const tag = interaction.options.getString("hquality-category") || tags[Math.floor(Math.random() * tags.length)];

		return getFromQuality({ interaction, category: tag, embed: this.embed, });
	}

	public async subcommandAnimation(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const fileType: string =
			interaction.options.getString("type") === "random"
				? ["video", "gif"][Math.floor(Math.random() * 2)]
				: interaction.options.getString("type");
		const category: string =
			interaction.options.getString("category") || "random";

		return getFromAnimation({ interaction, category, format: fileType as PrivateCollectionFileFormat, });
	}

	public async subcommandDefault(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		return getFromDefault({ interaction, embed: this.embed, category: interaction.options.getSubcommand() as PrivateCollectionCategory, });
	}

	public async subcommandAutoSet(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		/**
		 * Specific channel permission checking / NSFW checking
		 */
		const channel = interaction.options.getChannel("channel") as TextChannel;
		if (!interaction.guild.members.me.permissionsIn(channel).has("SendMessages"))
		{
			const noPerm: EmbedBuilder = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | I seem to lack the permission to `Send Messages` in this channel..."
				);
			return interaction.editReply({ embeds: [noPerm], });
		}

		if (!channel.nsfw)
		{
			const noNSFWEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | I apologize, but this feature can only be setup in NSFW channels!");
			return interaction.editReply({ embeds: [noNSFWEmbed], });
		}

		/**
		 * Setting channel for autohentai
		 */
		const dbChannel = await Guild.findOne({ guildId: interaction.guild.id, });
		dbChannel
			? await dbChannel.updateOne(
				{ guildId: dbChannel.guildId, },
				{
					channelId: channel.id,
					identifier: `${interaction.guild.id}|${interaction.user.id}`,
				}
			)
			: await Guild.create({
				guildId: interaction.guild.id,
				channelId: channel.id,
				identifier: `${interaction.guild.id}|${interaction.user.id}`,
			});
		const done: EmbedBuilder = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				`✅ | Shinano will now post lewdies into <#${channel.id}> every 5 minutes! She won't start posting right away, and please make sure she has permission to send message in that channel!`
			);
		await interaction.editReply({ embeds: [done], });
	}

	public async subcommandAutoStop(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		/**
		 * Channel Check
		 */
		const dbChannel = await Guild.findOne({ guildId: interaction.guild.id, });
		if (!dbChannel)
		{
			const none: EmbedBuilder = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | You have not setup Shinano to post anything..."
				);
			return interaction.editReply({ embeds: [none], });
		}

		/**
		 * Stop posting news
		 */
		await dbChannel.deleteOne();

		const deleted: EmbedBuilder = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				"✅ | Shinano will no longer send lewdies into the server!"
			);
		await interaction.editReply({ embeds: [deleted], });
	}

	private async initial(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		this.embed
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
			});
	}
}