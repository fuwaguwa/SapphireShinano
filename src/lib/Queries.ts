import {
	AnimationGetFromOptions,
	AnimationQueryOptions,
	PrivateCollectionGetFromOption,
	PrivateCollectionQueryOptions
} from "../typings/Queries";
import Image from "../schemas/Image";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } from "discord.js";
import { collectors } from "./Constants";
import { buttonCooldownCheck, buttonCooldownSet } from "./Utils";
import { EmbedBuilder } from "discord.js";
import { searchBooru } from "./Booru";

/**
 * Get media from DB and send/manage interaction relating to it
 * @param interaction
 * @param category
 * @param embed
 * @param mode
 */
export async function getFromPrivateCollection({ interaction, category, embed, mode, }: PrivateCollectionGetFromOption)
{
	const imageResult = category === "random"
		? (await Image.aggregate([{ $sample: { size: 1, }, }]))[0]
		: (await Image.aggregate([
			{ $match: { category: category, }, },
			{ $sample: { size: 1, }, }
		]))[0];

	let imageInfo: ActionRowBuilder<ButtonBuilder> = new ActionRowBuilder<ButtonBuilder>()
		.addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setEmoji({ name: "🔗", })
				.setLabel("Image Link")
				.setURL(imageResult.link),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({ name: "🔍", })
				.setLabel("Get Sauce")
				.setCustomId("SAUCE")
		);
	const load: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel("Load More")
				.setCustomId(`LMORE-${interaction.user.id}`)
		);

	embed
		.setImage(imageResult.link)
		.setColor("Random");
	const interactionOptions = !(imageResult.link as string).endsWith("mp4")
		? { embeds: [embed], components: [imageInfo, load], }
		: { content: imageResult.link, components: [load], };
	const message = mode === "followUp"
		? await interaction.followUp(interactionOptions)
		: await interaction.editReply(interactionOptions);

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 40000,
	});

	collectors.set(interaction.user.id, collector);

	collector.on("collect", async (i) =>
	{
		if (!i.customId.endsWith(i.user.id))
		{
			return i.reply({
				content: "This button does not belong to you!",
				ephemeral: true,
			});
		}

		if (i.customId.includes("LMORE"))
		{
			if (await buttonCooldownCheck("LMORE", i)) return;

			await i.deferUpdate();
			load.components[0].setDisabled(true);
			await message.edit({ components: imageInfo ? [imageInfo, load] : [load], });

			await getFromPrivateCollection({ interaction: i, category, embed, mode: "followUp", });
			buttonCooldownSet("LMORE", i);

			return collector.stop("done");
		}
	});

	collector.on("end", async (collected, reason) =>
	{
		if (reason !== "done")
		{
			load.components[0].setDisabled(true);
			await message.edit({ components: imageInfo ? [imageInfo, load] : [load], });
		}
	});
}

/**
 * Fanbox image queries
 * @param interaction
 * @param tag
 * @param embed
 * @param mode
 */
export async function getFromQuality({ interaction, category: tag, embed, mode, }: PrivateCollectionGetFromOption)
{
	const item = (
		await Image.aggregate([
			{ $match: { category: tag, fanbox: true, }, },
			{ $sample: { size: 1, }, }
		])
	)[0];

	embed.setImage(item.link).setColor("Random");
	const load: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel("Load More")
				.setCustomId(`LMORE-${interaction.user.id}`)
		);
	const imageLink: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setEmoji({ name: "🔗", })
				.setLabel("Image Link")
				.setURL(item.link)
		);

	const message = mode === "followUp"
		? await interaction.followUp({ embeds: [embed], components: [imageLink, load], })
		: await interaction.editReply({ embeds: [embed], components: [imageLink, load], });

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 40000,
	});

	collectors.set(interaction.user.id, collector);

	collector.on("collect", async (i) =>
	{
		if (!i.customId.endsWith(i.user.id))
		{
			return i.reply({
				content: "This button does not belong to you!",
				ephemeral: true,
			});
		}

		if (i.customId.includes("LMORE"))
		{
			if (await buttonCooldownCheck("LMORE", i)) return;

			await i.deferUpdate();
			load.components[0].setDisabled(true);
			await message.edit({ components: [imageLink, load], });
			await getFromQuality({ interaction: i, embed, category: tag, mode: "followUp", });

			buttonCooldownSet("LMORE", i);

			return collector.stop("done");
		}
	});
}

/**
 * Animation queries
 * @param interaction
 * @param tag
 * @param mode
 */
export async function getFromAnimation({ interaction, category, format, mode, }: AnimationGetFromOptions)
{
	const load: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel("Load More")
				.setCustomId(`LMORE-${interaction.user.id}`)
		);

	const message = format === "video"
		? await queryVideo({ interaction, category, buttons: load, mode, })
		: await queryGif({ interaction, buttons: load, mode, category: category === "random" ? null : category, });

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 40000,
	});

	collectors.set(interaction.user.id, collector);

	collector.on("collect", async (i) =>
	{
		if (!i.customId.endsWith(i.user.id))
		{
			return i.reply({
				content: "This button does not belong to you!",
				ephemeral: true,
			});
		}

		if (i.customId.includes("LMORE"))
		{
			if (await buttonCooldownCheck("LMORE", i)) return;

			await i.deferUpdate();

			load.components[0].setDisabled(true);
			const components = [];
			if (message.components[0].components[0].data["url"])
			{
				components.push(
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setEmoji({ name: "🔗", })
							.setLabel("Image Link")
							.setURL(message.components[0].components[0].data["url"])
					)
				);
			}
			components.push(load);

			await message.edit({ components: components, });
			await getFromAnimation({ interaction: i, format, category, mode: "followUp", });

			buttonCooldownSet("LMORE", i);
			return collector.stop();
		}
	});

	collector.on("end", async (collected, reason) =>
	{
		if (reason !== "done")
		{
			load.components[0].setDisabled(true);

			const components = [];
			if (message.components[0].components[0].data["url"])
			{
				components.push(
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setEmoji({ name: "🔗", })
							.setLabel("Image Link")
							.setURL(message.components[0].components[0].data["url"])
					)
				);
			}

			components.push(load);

			await message.edit({ components: components, });
		}
	});
}

/**
 * Default query
 * @param interaction
 * @param embed
 * @param tag
 * @param mode
 */
export async function getFromDefault({ interaction, embed, category: tag, mode, }: PrivateCollectionGetFromOption)
{
	if (!["nekomimi", "gif"].includes(tag as string)) return searchBooru({ interaction, query: [tag as string], site: "gelbooru", });

	const image = await queryNG(tag as string);

	embed.setImage(image).setColor("Random");
	const load: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setLabel("Load More")
				.setCustomId(`LMORE-${interaction.user.id}`)
		);
	const imageInfo = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setStyle(ButtonStyle.Link)
			.setEmoji({ name: "🔗", })
			.setLabel("Image Link")
			.setURL(image),
		new ButtonBuilder()
			.setStyle(ButtonStyle.Secondary)
			.setEmoji({ name: "🔍", })
			.setLabel("Get Sauce")
			.setCustomId("SAUCE")
	);

	const message = mode === "followUp"
		? await interaction.followUp({
			embeds: [embed],
			components: [imageInfo, load],
		})
		: await interaction.editReply({
			embeds: [embed],
			components: [imageInfo, load],
		});

	const collector = message.createMessageComponentCollector({
		componentType: ComponentType.Button,
		time: 40000,
	});

	collectors.set(interaction.user.id, collector);

	collector.on("collect", async (i) =>
	{
		if (!i.customId.endsWith(i.user.id))
		{
			return i.reply({
				content: "\"This button does not pertain to you!\"",
				ephemeral: true,
			});
		}

		if (i.customId.includes("LMORE"))
		{
			if (await buttonCooldownCheck("LMORE", i)) return;
			await i.deferUpdate();

			load.components[0].setDisabled(true);
			await message.edit({ components: [imageInfo, load], });

			await getFromDefault({ interaction: i, embed, category: tag, mode: "followUp", });

			buttonCooldownSet("LMORE", i);
			return collector.stop("done");
		}
	});
}

/**
 * Query media from the private collection
 * @param category
 * @param format
 * @param size
 * @param fanbox
 */
export async function queryPrivateImage({ category, format, size, fanbox, }: PrivateCollectionQueryOptions)
{
	if (
		category === "random" &&
		!["gif", "mp4"].includes(format) &&
		!fanbox &&
		![undefined, "animation", "random"].includes(category)
	)
		return queryRandom(size);

	if (fanbox)
	{
		let match = { fanbox: true, };
		if (category !== "random")
			match = Object.assign(match, { category: category, });

		const result = await Image.aggregate([
			{ $match: match, },
			{ $sample: { size: size || 1, }, }
		]);

		return result.length > 1 ? result : result[0];
	}

	let result;
	if (format === "animation")
	{
		const formatType = ["gif", "mp4"];

		let match = { format: { $in: formatType, }, };
		if (category !== "random")
			match = Object.assign(match, { category: category, });

		result = await Image.aggregate([
			{ $match: match, },
			{ $sample: { size: size || 1, }, }
		]);
	}
	else if (format === "random" || format == undefined)
	{
		const aggregate: any = [{ $sample: { size: size || 1, }, }];
		if (category !== "random")
			aggregate.unshift({ $match: { category: category, }, });

		result = await Image.aggregate(aggregate);
	}
	else
	{
		let match = { format: format, };
		if (category !== "random")
			match = Object.assign(match, { category: category, });

		result = await Image.aggregate([
			{ $match: match, },
			{ $sample: { size: size || 1, }, }
		]);
	}
	return result.length > 1 ? result : result[0];
}


/**
 * Query an amount of images from the DB
 * @param size
 */
export async function queryRandom(size: number)
{
	const content = await Image.aggregate([{ $sample: { size: size || 1, }, }]);
	return size > 1 ? content : content[0];
}

/**
 * Nekomimi and GIF query
 * @param tag
 */
export async function queryNG(tag: string)
{
	switch (tag)
	{
		case "nekomimi": {
			const response = await fetch("https://api.waifu.pics/nsfw/neko");
			const neko = await response.json();

			return neko.url;
		}

		case "gif": {
			if ([1, 2][Math.floor(Math.random() * 2)] == 1)
			{
				const requestHentai = async () =>
				{
					const choice = ["cum", "anal", "blowjob", "paizuri"];
					const botChoice = choice[Math.floor(Math.random() * choice.length)];

					const response = await fetch(`https://hmtai.hatsunia.cfd/v2/${botChoice}`);
					const json = await response.json();

					return json.url;
				};

				let image = await requestHentai();
				while (!(image as string).endsWith("gif"))
					image = await requestHentai();
				return image;
			}

			return (await queryPrivateImage({ category: "random", format: "gif", })).link;
		}
	}
}

/**
 * Query video
 * @param interaction
 * @param category
 * @param buttons
 * @param mode
 */
export async function queryVideo({ interaction, category, buttons, mode, }: AnimationQueryOptions)
{
	const match = { format: "mp4", };
	if (category !== "random") Object.assign(match, { category: category, });

	const image = (await Image.aggregate([{ $match: match, }, { $sample: { size: 1, }, }]))[0];

	return mode === "followUp"
		? await interaction.followUp({
			content: image.link,
			components: [buttons],
		})
		: await interaction.editReply({
			content: image.link,
			components: [buttons],
		});
}

/**
 * Query GIF
 * @param interaction
 * @param category
 * @param buttons
 * @param mode
 */
export async function queryGif({ interaction, category, buttons, mode, }: AnimationQueryOptions)
{
	const url = !category
		? await queryNG("gif")
		: (await Image.aggregate([
			{ $match: { category: category, format: "gif", }, },
			{ $sample: { size: 1, }, }
		]))[0].link;

	const lewdEmbed = new EmbedBuilder()
		.setColor("Random")
		.setFooter({
			text: `Requested by ${interaction.user.username}`,
			iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
		})
		.setImage(url);
	const imageLink: ActionRowBuilder<ButtonBuilder> =
		new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setEmoji({ name: "🔗", })
				.setLabel("Image Link")
				.setURL(url)
		);

	return mode === "followUp"
		? await interaction.followUp({
			embeds: [lewdEmbed],
			components: [imageLink, buttons],
		})
		: await interaction.editReply({
			embeds: [lewdEmbed],
			components: [imageLink, buttons],
		});
}