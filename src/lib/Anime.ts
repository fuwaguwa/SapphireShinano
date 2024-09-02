import { ChatInputCommandInteraction, EmbedBuilder } from "discord.js";
import { ShinanoPaginator } from "../structures/Paginator";

/**
 * Process anime info from MAL
 * @param anime
 * @param interaction
 */
export function processAnimeInfo(anime, interaction: ChatInputCommandInteraction)
{
	const genres: string[] = [];
	anime.genres.forEach(genre => genres.push(genre.name));

	const studios: string[] = [];
	anime.studios.forEach(studio =>
		studios.push(`[${studio.name}](${studio.url})`)
	);

	const startDate = Math.floor(new Date(anime.aired.from).getTime() / 1000);
	const endDate = Math.floor(new Date(anime.aired.to).getTime() / 1000);

	const synopsisEmbed = new EmbedBuilder()
		.setColor("#2b2d31")
		.setThumbnail(anime.images.jpg.large_image_url)
		.setTitle(`${anime.title} | Synopsis`)
		.setDescription(`*${anime.synopsis || "No Sypnosis Can Be Found"}*`);

	const generalInfoEmbed: EmbedBuilder = new EmbedBuilder()
		.setColor("#2b2d31")
		.setThumbnail(anime.images.jpg.large_image_url)
		.setTitle(`${anime.title} | General Info`)
		.addFields(
			{
				name: "MyAnimeList Info:",
				value:
					`**ID**: [${anime.mal_id}](${anime.url})\n` +
					`**Rating**: ${anime.score} ⭐\n` +
					`**Ranking**: ${anime.rank ? `#${anime.rank}` : "N/A"}\n` +
					`**Favorites**: ${anime.favorites}\n` +
					`**Popularity**: #${anime.popularity}\n`,
			},
			{
				name: "Anime Info:",
				value:
					`**Rating**: ${anime.rating}\n` +
					`**Genres**: ${genres.join(", ")}\n` +
					`**JP Title**: ${anime.title_japanese || "None"}\n` +
					`**Trailer**: ${
						anime.trailer.url ? `[Trailer Link](${anime.trailer.url})` : "None"
					}\n` +
					`**Studio**: ${studios.join(", ")}\n`,
			},
			{
				name: "Episodes Info:",
				value:
					`**Status**: ${anime.status}\n` +
					`**Episodes**: ${anime.episodes || "N/A"}\n` +
					`**Duration**: ${anime.duration}\n` +
					`**Start Date**: <t:${startDate}>\n` +
					`**End Date**: ${
						endDate == 0 ? "Ongoing" : `<t:${endDate}>`
					}\n`,
			}
		);

	(new ShinanoPaginator({
		interaction,
		interactorOnly: true,
		pages: [synopsisEmbed, generalInfoEmbed],
		time: 120000,
	})).startPaginator();
}

export async function processCharacterInfo(character, interaction: ChatInputCommandInteraction)
{
	const VAs: string[] = [];
	if (character.voices)
	{
		character.voices.forEach((va) =>
		{
			if (va.language !== "Japanese" && va.language !== "English") return;
			VAs.push(`[${va.person.name}](${va.person.url})`);
		});
	}

	const characterEmbed: EmbedBuilder = new EmbedBuilder()
		.setColor("Random")
		.setTitle(`${character.name} | ${character.name_kanji || "No Kanji Name"}`)
		.setThumbnail(character.images.jpg.image_url)
		.setDescription(character.about || "No Biography Found");

	if (character.anime && character.anime.length != 0)
	{
		characterEmbed.addFields(
			{
				name: "Extra Info:",
				value:
					`**Anime**: [${character.anime[0].anime.title}](${character.anime[0].anime.url})\n` +
					`**Voice Actors**: ${VAs.length != 0 ? VAs.join("; ") : "None"}\n` +
					`**Nicknames**: ${
						character.nicknames.length != 0
							? character.nicknames.join(", ")
							: "None"
					}`,
			},
			{
				name: "MyAnimeList Info",
				value:
					`**ID**: [${character.mal_id}](${character.url})\n` +
					`**Favorites**: ${character.favorites}`,
			}
		);
	}
	else
	{
		characterEmbed.addFields({
			name: "MyAnimeList Info",
			value:
				`**ID**: [${character.mal_id}](${character.url})\n` +
				`**Favorites**: ${character.favorites}`,
		});
	}

	await interaction.editReply({ embeds: [characterEmbed], });
}