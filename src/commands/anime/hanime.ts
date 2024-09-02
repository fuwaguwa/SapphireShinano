import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";
import { processAnimeInfo } from "../../lib/Anime";

@ApplyOptions<CommandOptions>({
	description: "The anime command - but for hentai!",
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	nsfw: true,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class HanimeCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setNSFW(true)
				.addStringOption(option =>
					option
						.setName("name")
						.setDescription("Hentai name")
						.setRequired(true)
						.setAutocomplete(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
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
}