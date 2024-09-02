import {
	ActionRowBuilder,
	ChatInputCommandInteraction,
	ComponentType,
	EmbedBuilder,
	StringSelectMenuBuilder
} from "discord.js";
import { collectors } from "./Constants";
import { ShinanoPaginator } from "../structures/Paginator";
import { Doujin } from "../structures/Doujin";
/**
 * Generate doujin pages from doujin
 * @param doujin doujin
 * @param title doujin's title
 * @returns embeds of doujin pages
 */
function genDoujinPage(doujin, title)
{
	const doujinPages: EmbedBuilder[] = [];
	for (let i = 0; i < doujin.pagesNumber; i++)
	{
		doujinPages.push(
			new EmbedBuilder()
				.setColor("#2b2d31")
				.setDescription(
					`**[${title} | ${doujin.id}](${doujin.pages[i]})**`
				)
				.setImage(doujin.pages[i])
		);
	}
	return doujinPages;
}

/**
 * Generate embed of information for a doujin
 * @param doujin doujin
 * @returns doujin embed
 */
export function genDoujinEmbed(doujin: Doujin)
{
	const doujinTitle =
		doujin.title.pretty ||
		doujin.title.english ||
		doujin.title.japanese;

	const mainInfo: EmbedBuilder = new EmbedBuilder()
		.setTitle(`${doujinTitle} | ${doujin.id}`)
		.setThumbnail(doujin.pages[0])
		.setColor("#2b2d31")
		.setDescription("**Tags:**\n" + doujin.tags.tags.join(", "))
		.setURL(`https://nhentai.net/g/${doujin.id}`);
	if (doujin.tags.characters.length != 0)
		mainInfo.addFields({
			name: "Characters:",
			value: doujin.tags.characters.join(", "),
			inline: false,
		});
	if (doujin.tags.parodies.length != 0)
		mainInfo.addFields({
			name: "Parodies:",
			value: doujin.tags.parodies.join(", "),
			inline: false,
		});
	if (doujin.tags.languages.length != 0)
		mainInfo.addFields({
			name: "Languages:",
			value: doujin.tags.languages.join(", "),
			inline: false,
		});
	if (doujin.tags.categories.length != 0)
		mainInfo.addFields({
			name: "Categories:",
			value: doujin.tags.categories.join(", "),
			inline: false,
		});
	if (doujin.tags.artists.length != 0)
		mainInfo.addFields({
			name: "Artists:",
			value: doujin.tags.artists.join(", "),
			inline: false,
		});
	if (doujin.tags.groups.length != 0)
		mainInfo.addFields({
			name: "Groups:",
			value: doujin.tags.groups.join(", "),
			inline: false,
		});
	mainInfo.addFields(
		{ name: "Pages:", value: `${doujin.pagesNumber}`, inline: true, },
		{ name: "Favorites:", value: `${doujin.favorites}`, inline: true, },
		{
			name: "Upload Date:",
			value: `<t:${doujin.uploadTimestamp}:D>`,
			inline: true,
		}
	);

	return mainInfo;
}

/**
 * Display a menu for reading and information about a doujin
 * @param interaction ChatInputCommandInteraction
 * @param doujin doujin
 */
export async function displayDoujin(
	interaction: ChatInputCommandInteraction,
	doujin
)
{
	const doujinTitle =
		doujin.title.pretty ||
		doujin.title.english ||
		doujin.title.japanese;

	/**
	 * Filtering Tags
	 */
	const filter = doujin.tags.tags.find((tag) =>
	{
		return (
			tag.includes("Lolicon") ||
			tag.includes("Guro") ||
			tag.includes("Scat") ||
			tag.includes("Insect") ||
			tag.includes("Shotacon") ||
			tag.includes("Amputee") ||
			tag.includes("Vomit") ||
			tag.includes("Vore")
		);
	});

	if (filter)
	{
		const blacklisted: EmbedBuilder = new EmbedBuilder()
			.setColor("Red")
			.setDescription(
				`❌ | I have discovered that the doujin contains a blacklisted tag (\`${filter.toLowerCase()}\`), therefore I shall refrain from displaying it at this moment.\n`
			);
		return interaction.editReply({ embeds: [blacklisted], });
	}

	/**
	 * Components
	 */
	const mainInfo = genDoujinEmbed(doujin);
	let doujinPages: EmbedBuilder[];
	if (doujin.pagesNumber <= 150)
		doujinPages = genDoujinPage(doujin, doujinTitle);

	const navigation: ActionRowBuilder<StringSelectMenuBuilder> =
		new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
			new StringSelectMenuBuilder()
				.setMaxValues(1)
				.setMinValues(1)
				.setCustomId(`${doujin.id}-${interaction.user.id}`)
				.addOptions(
					{
						label: "Info",
						value: "info",
						emoji: "🔍",
						default: true,
					},
					{
						label: "Read",
						value: "read",
						emoji: "📰",
						default: false,
					}
				)
		);

	/**
	 * Collector
	 */
	const message = await interaction.editReply({
		embeds: [mainInfo],
		components: [navigation],
	});
	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.StringSelect,
		time: 150000,
	});

	collectors.set(interaction.user.id, collector);

	let lastPage: number = 0;

	collector.on("collect", async (i) =>
	{
		if (!i.customId.endsWith(`${i.user.id}`))
		{
			return i.reply({
				content: "This menu does not belong to you!",
				ephemeral: true,
			});
		}

		const menu = navigation.components[0];

		if (i.values)
		{
			await i.deferUpdate();
			switch (i.values[0])
			{
				case "info": {
					menu.options[0].setDefault(true);
					menu.options[1].setDefault(false);

					await i.editReply({
						embeds: [mainInfo],
						components: [navigation],
					});
					break;
				}

				case "read": {
					menu.options[0].setDefault(false);
					menu.options[1].setDefault(true);

					if (doujinPages)
					{


						const paginator = new ShinanoPaginator({
							interaction,
							lastPage,
							pages: doujinPages,
							interactorOnly: true,
							menu: navigation,
							time: 150000,
						});

						paginator.startPaginator().then((page) => {lastPage = page;});
					}
					else
					{
						const notAvailable: EmbedBuilder = new EmbedBuilder()
							.setColor("Red")
							.setDescription(
								"Regrettably, I can only provide support for doujins that are up to 150 pages in length, but you can still read them " +
								`[here](https://nhentai.net/g/${doujin.id})`
							);
						await i.editReply({
							embeds: [notAvailable],
							components: [navigation],
						});
					}
				}
			}
		}
	});
}
