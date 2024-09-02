import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { SauceOptions } from "../typings/Sauce";
import sagiri, { SagiriResult } from "sagiri";
import { isImageAndGif } from "./Utils";
import { ResultData } from "sagiri/dist/response";
import { sauceEmojis } from "./Constants";

/**
 * Get sauce
 * @param interaction
 * @param link
 * @param ephemeral
 */
export async function getSauce({ interaction, link, ephemeral, }: SauceOptions)
{
	if (!interaction.deferred && !interaction.replied) await interaction.deferReply({ ephemeral, });

	let waitEmbed = new EmbedBuilder()
		.setTitle("Processing...")
		.setColor("Green")
		.setDescription(
			"<a:lod:1021265223707000923> | Validating Link...\n<a:lod:1021265223707000923> | Searching For Sauce...\n<a:lod:1021265223707000923> | Filtering..."
		);
	await interaction.editReply({ embeds: [waitEmbed], });

	if (!isImageAndGif(link))
	{
		const failedEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("Red")
			.setDescription("❌ | Must be an image/gif!");
		return interaction.editReply({ embeds: [failedEmbed], });
	}

	const response = await fetch(link);
	if (response.status !== 200)
	{
		const failedEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("Red")
			.setDescription("❌ | Invalid image/gif link/file.");
		return interaction.editReply({ embeds: [failedEmbed], });
	}

	const fileSize = parseInt(response.headers.get("content-length"), 10) * 0.000001; // Megabytes
	if (fileSize > 20)
	{
		const failedEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("Red")
			.setDescription("❌ | File size must not be over 20MB!");
		return interaction.editReply({ embeds: [failedEmbed], });
	}

	/**
	 * Finding sauce
	 */
	const sagiriClient = sagiri(process.env.saucenaoApiKey);

	waitEmbed.setDescription(
		"✅ | Valid Link!\n" +
		"<a:lod:1021265223707000923> | Searching For Sauce...\n" +
		"<a:lod:1021265223707000923> | Filtering..."
	);
	await interaction.editReply({ embeds: [waitEmbed], });

	let results: SagiriResult[];
	try
	{
		results = await sagiriClient(link);
	}
	catch (err)
	{
		// Usually resolved after a retry, idk why 😭
		results = await sagiriClient(link);
	}

	/**
	 * Processing
	 */
	if (results.length == 0)
	{
		const noResultEmbed= new EmbedBuilder()
			.setColor("Red")
			.setDescription("❌ | No results were found!")
			.setImage(
				"https://cdn.discordapp.com/attachments/977409556638474250/999486337822507058/akairo-azur-lane.gif"
			);
		return interaction.editReply({ embeds: [noResultEmbed], });
	}

	/**
	 * Formatting links
	 */
	// Limited to 5 results
	const links: string[] = [];
	for (let i = 0; i < 5; i++)
	{
		const sauce = results[i];
		links.push(`${sauce.url}|${sauce.similarity}%`);
	}


	/**
	 * Filtering
	 */
	waitEmbed.setDescription(
		"✅ | Valid Link!\n" +
		"✅ | Sauce Found!\n" +
		"<a:lod:1021265223707000923> | Filtering..."
	);
	await interaction.editReply({ embeds: [waitEmbed], });

	const firstResult = results[0];
	const resultEmbed: EmbedBuilder = new EmbedBuilder()
		.setColor("#2b2d31")
		.setTitle("Sauce...Found?")
		.setThumbnail(firstResult.thumbnail)
		.setFooter({ text: "Similarity is displayed below.", });

	if (firstResult.raw.data.source && firstResult.raw.header.index_name.includes("H-Anime"))
	{
		/**
		 * GIFs & Animations
		 */
		resultEmbed.addFields({
			name: "Sauce: ",
			value: firstResult.raw.data.source,
		});
		resultEmbed.addFields({
			name: "Estimated Timestamp: ",
			value: firstResult.raw.data.est_time,
		});
	}
	else
	{
		/**
		 * For other sources
		 */
		const danbooru = results.find(result => result.site === "Danbooru");
		const yandere = results.find(result => result.site === "Yande.re");
		const konachan = results.find(result => result.site === "Konachan");
		const pixiv = results.find(result => result.site === "Pixiv");

		let infoFound: number = 0;
		let info: ResultData;
		let result: string;

		if (danbooru)
		{
			infoFound++;

			info = danbooru.raw.data;
			result = "";

			for (const data in info)
			{
				if (data === "creator" && info[data].length > 0)
					result += `**Artist**: ${info[data]}\n`;
				if (data === "material" && info[data].length > 0)
					result += `**Material**: ${info[data]}\n`;
				if (data === "characters" && info[data].length > 0)
					result += `**Characters**: ${info[data]}\n`;
			}

			resultEmbed.addFields({ name: "Danbooru:", value: result, inline: true, });
		}

		if (pixiv)
		{
			infoFound++;

			info = pixiv.raw.data;
			result = "";

			for (const data in info)
			{
				if (data === "title") result += `**Title**: ${info[data]}\n`;
				if (data === "member_name") result += `**Artist**: ${info[data]}\n`;
				if (data === "member_id") result += `**Artist ID**: ${info[data]}\n`;
			}

			resultEmbed.addFields({
				name: "Pixiv:",
				value: result,
				inline: infoFound % 2 == 0,
			});
		}

		if (yandere)
		{
			infoFound++;

			info = yandere.raw.data;
			result = "";

			for (const data in info)
			{
				if (data === "creator" && info[data].length > 0)
					result += `**Artist**: ${info[data]}\n`;
				if (data === "material" && info[data].length > 0)
					result += `**Material**: ${info[data]}\n`;
				if (data === "characters" && info[data].length > 0)
					result += `**Characters**: ${info[data]}\n`;
			}

			resultEmbed.addFields({
				name: "Yande.re:",
				value: result,
			});
		}

		if (konachan && infoFound < 4)
		{
			info = konachan.raw.data;
			result = "";

			for (const data in info)
			{
				if (data === "creator" && info[data].length > 0)
					result += `**Artist**: ${info[data]}\n`;
				if (data === "material" && info[data].length > 0)
					result += `**Material**: ${info[data]}\n`;
				if (data === "characters" && info[data].length > 0)
					result += `**Characters**: ${info[data]}\n`;
			}

			resultEmbed.addFields({
				name: "Konachan:",
				value: result,
				inline: infoFound % 2 == 1,
			});
		}
	}

	const sortedLinks = {};
	links.forEach((link) =>
	{
		switch (true)
		{
			case link.includes("pixiv.net"): {
				if (!sortedLinks["Pixiv"])
				{
					sortedLinks["Pixiv"] = link;
				}
				break;
			}

			case link.includes("danbooru.donmai.us"): {
				if (!sortedLinks["Danbooru"])
				{
					sortedLinks["Danbooru"] = link;
				}
				break;
			}

			case link.includes("gelbooru.com"): {
				if (!sortedLinks["Gelbooru"])
				{
					sortedLinks["Gelbooru"] = link;
				}
				break;
			}

			case link.includes("konachan.com"): {
				if (!sortedLinks["Konachan"])
				{
					sortedLinks["Konachan"] = link;
				}
				break;
			}

			case link.includes("yande.re"): {
				if (!sortedLinks["Yande.re"])
				{
					sortedLinks["Yande.re"] = link;
				}
				break;
			}

			case link.includes("fantia.jp"): {
				if (!sortedLinks["Fantia"])
				{
					sortedLinks["Fantia"] = link;
				}
				break;
			}

			case link.includes("anidb.net"): {
				if (!sortedLinks["AniDB"])
				{
					sortedLinks["AniDB"] = link;
				}
				break;
			}
		}
	});

	/**
	 * Buttons
	 */
	const sauceURLs: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>();
	for (const link in sortedLinks)
	{
		const source = sortedLinks[link].split("|")[0];
		const similarity = sortedLinks[link].split("|")[1];

		sauceURLs.addComponents(
			new ButtonBuilder()
				.setLabel(`${link} (${similarity})`)
				.setStyle(ButtonStyle.Link)
				.setEmoji(sauceEmojis[link])
				.setURL(source)
		);
	}

	/**
	 * Outputting
	 */
	waitEmbed.setDescription(
		"✅ | Valid Link!\n" +
		"✅ | Searching For Sauce...\n" +
		"✅ | Link Filtered!"
	);
	await interaction.editReply({ embeds: [waitEmbed], });

	return interaction.editReply({
		embeds: [resultEmbed],
		components: [sauceURLs],
	});
}