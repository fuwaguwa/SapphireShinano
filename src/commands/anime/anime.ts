import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { EmbedBuilder } from "discord.js";
import { processAnimeInfo, processCharacterInfo } from "../../lib/Anime";

@ApplyOptions<SubcommandOptions>({
	description: "Get information about animes and anime characters.",
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "get",
			chatInputRun: "subcommandGet",
		},
		{
			name: "character",
			chatInputRun: "subcommandCharacter",
		},
		{
			name: "random",
			chatInputRun: "subcommandRandom",
		}
	],
})
export class AnimeCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("get")
						.setDescription("Get the information of an anime on MyAnimeList")
						.addStringOption(option =>
							option
								.setName("name")
								.setDescription("The anime title (JP name is recommended)")
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("character")
						.setDescription("Search up information of an anime character on MyAnimeList")
						.addStringOption(option =>
							option
								.setName("name")
								.setDescription("Character name")
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("random")
						.setDescription("Get a random anime.")
				)
		);
	}

	/**
	 * /anime get
	 * @param interaction
	 */
	public async subcommandGet(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const id = interaction.options.getString("name");
		const malResult = await fetch(`https://api.jikan.moe/v4/anime/${id}`,
			{
				method: "GET",
				headers: {
					"X-MAL-CLIENT-ID": process.env.malClientId,
				},
			});

		if (malResult.status == 404)
		{
			const noResultError = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | No result!");
			return interaction.editReply({ embeds: [noResultError], });
		}

		const anime = (await malResult.json()).data;
		processAnimeInfo(anime, interaction);
	}

	/**
	 * /anime character
	 * @param interaction
	 */
	public async subcommandCharacter(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const id = interaction.options.getString("name");
		const malResult = await fetch(`https://api.jikan.moe/v4/characters/${id}/full`,
			{
				method: "GET",
				headers: {
					"X-MAL-CLIENT-ID": process.env.malClientId,
				},
			});

		if (malResult.status == 404)
		{
			const noResultError = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | No result!");
			return interaction.editReply({ embeds: [noResultError], });
		}

		const character = (await malResult.json()).data;
		await processCharacterInfo(character, interaction);
	}

	/**
	 * /anime random
	 * @param interaction
	 */
	public async subcommandRandom(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const malResult = await fetch(`https://api.jikan.moe/v4/random/anime`,
			{
				method: "GET",
				headers: {
					"X-MAL-CLIENT-ID": process.env.malClientId,
				},
			});

		if (malResult.status == 404)
		{
			const noResultError = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | No result!");
			return interaction.editReply({ embeds: [noResultError], });
		}

		const anime = (await malResult.json()).data;
		processAnimeInfo(anime, interaction);
	}
}