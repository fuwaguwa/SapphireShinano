import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import {  CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { AzurAPI } from "@azurapi/azurapi";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ChannelType,
	ComponentType,
	EmbedBuilder,
	PermissionsBitField,
	StringSelectMenuBuilder, TextChannel
} from "discord.js";
import { ShinanoShip } from "../../structures/AzurLane";
import { collectors, rootDir } from "../../lib/Constants";
import { ShinanoPaginator } from "../../structures/Paginator";
import News from "../../schemas/ALNews";
import { envParseArray } from "@skyra/env-utilities";
import Canvas, { createCanvas, loadImage } from "canvas";
import puppeteer from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";
import path from "node:path";
import { Ship } from "@azurapi/azurapi/build/types/ship";
import { toTitleCase } from "../../lib/Utils";
import { gearColor, gearFits, gearSearch, gearStats } from "../../lib/AzurLane";

puppeteer.use(Stealth());
Canvas.registerFont(path.join(rootDir, "font", "QuireSansSemiBold.ttf"), { family: "QuireSans", });

export const AL = new AzurAPI();

@ApplyOptions<SubcommandOptions>({
	description: "Commands related to Azur Lane!",
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "ship",
			chatInputRun: "subcommandShip",
		},
		{
			name: "gear",
			chatInputRun: "subcommandGear",
		},
		{
			name: "build",
			chatInputRun: "subcommandBuild",
		},
		{
			name: "news",
			type: "group",
			entries: [
				{
					name: "set",
					requiredUserPermissions: [PermissionsBitField.Flags.ManageWebhooks],
					requiredClientPermissions: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks],
					chatInputRun: "subcommandNewsSet",
				},
				{
					name: "stop",
					requiredUserPermissions: [PermissionsBitField.Flags.ManageWebhooks],
					chatInputRun: "subcommandNewsStop",
				}
			],
		}
	],
})
export class AzurLaneCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("ship")
						.setDescription("Get information about an Azur Lane ship.")
						.addStringOption(option =>
							option
								.setName("name")
								.setDescription("The ship's name")
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("gear")
						.setDescription("Get information about in-game gears")
						.addStringOption(option =>
							option
								.setName("name")
								.setDescription("The gear's name")
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("build")
						.setDescription("Get the recommended gears for a ship from the community tier list!")
						.addStringOption(option =>
							option
								.setName("name")
								.setDescription("The ship's name")
								.setRequired(true)
								.setAutocomplete(true)
						)
				)
				.addSubcommandGroup(command =>
					command
						.setName("news")
						.setDescription("Send the latest tweets/news about the game for both EN and JP server from the official accounts!")
						.addSubcommand(command =>
							command
								.setName("set")
								.setDescription("Send the latest news/tweets about the game for both EN and JP server from the official accounts!")
								.addChannelOption(option =>
									option
										.setName("channel")
										.setDescription("The channel for the bot to send tweets into.")
										.setRequired(true)
										.addChannelTypes([ChannelType.GuildText])
								)
						)
						.addSubcommand(command =>
							command
								.setName("stop")
								.setDescription("Stop posting news/tweets into the server")
						)
				)
		);
	}

	/**
	 * /azur-lane ship
	 * @param interaction
	 */
	public async subcommandShip(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();
		const shipName = interaction.options.getString("name");
		const result = AL.ships.get(shipName);

		if (!result)
		{
			const noResultEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | I apologize, but no ship was found in the database with that name...")
				.setFooter({ text: "AzurAPI only have ships up to Implacable!", });
			return interaction.editReply({ embeds: [noResultEmbed], });
		}

		const ship = await new ShinanoShip(result).getShipEmbeds();

		/**
		 * Menu
		 */
		const categories = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
			new StringSelectMenuBuilder()
				.setMaxValues(1)
				.setMinValues(1)
				.setPlaceholder("Categories")
				.setCustomId(`${shipName}-${interaction.user.id}`)
				.setOptions(
					{
						label: "Info",
						value: "info",
						default: true,
						emoji: "🔍",
					},
					{
						label: "Tech",
						value: "tech",
						default: false,
						emoji: "🛠",
					},
					{
						label: "Stats",
						value: "stats",
						default: false,
						emoji: "🚢",
					},
					{
						label: "Skills",
						value: "skills",
						default: false,
						emoji: "📚",
					},
					{
						label: "Skins",
						value: "skins",
						default: false,
						emoji: "<:GEAMS:1002198674539036672>",
					}
				)
		);

		if (ship.gallery.length != 0)
			categories.components[0].addOptions({
				label: "Gallery",
				value: "gallery",
				default: false,
				emoji: "📸",
			});

		/**
		 * Collector
		 */
		const message = await interaction.editReply({
			embeds: [ship.generalInfo],
			components: [categories],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 120000,
		});
		collectors.set(interaction.user.id, collector);

		let skinPage = 0;
		let galleryPage = 0;

		collector.on("collect", async (i) =>
		{
			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "\"This menu does not pertain to you!\"",
					ephemeral: true,
				});
			}

			const menuOptions = categories.components[0].options;
			await i.deferUpdate();

			for (let j = 0; j < menuOptions.length; j++)
				menuOptions[j].setDefault(menuOptions[j].data.value === i.values[0]);

			switch (i.values[0])
			{
				case "info":
				{
					await i.editReply({
						embeds: [ship.generalInfo],
						components: [categories],
					});

					break;
				}

				case "tech":
				{
					await i.editReply({
						embeds: [ship.tech],
						components: [categories],
					});

					break;
				}

				case "stats":
				{
					await i.editReply({
						embeds: [ship.stats],
						components: [categories],
					});

					break;
				}

				case "skills":
				{
					await i.editReply({
						embeds: [ship.skills],
						components: [categories],
					});

					break;
				}

				case "skins":
				{
					(new ShinanoPaginator({
						interaction,
						pages: ship.skins,
						lastPage: skinPage,
						menu: categories,
						interactorOnly: true,
						time: 120000,
					})).startPaginator().then((page) => {skinPage = page;});

					break;
				}

				case "gallery":
				{
					(new ShinanoPaginator({
						interaction,
						pages: ship.gallery,
						lastPage: galleryPage,
						menu: categories,
						interactorOnly: true,
						time: 120000,
					})).startPaginator().then((page) => {galleryPage = page;});
				}
			}

			collector.resetTimer();
		});

		collector.on("end", async (collected, reason) =>
		{
			categories.components[0].setDisabled(true);
			await interaction.editReply({ components: [categories], });
		});
	}

	/**
	 * /azur-lane build
	 * @param interaction
	 */
	public async subcommandBuild(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const wait: EmbedBuilder = new EmbedBuilder()
			.setTitle("Processing...")
			.setColor("Green")
			.setDescription(
				"<a:lod:1021265223707000923> | Validating Ship...\n" +
				"<a:lod:1021265223707000923> | Fetching Build...\n" +
				"<a:lod:1021265223707000923> | Processing Gear Images...\n" +
				"<a:lod:1021265223707000923> | Creating Infographic...\n"
			);
		await interaction.editReply({ embeds: [wait], });

		const shipName = interaction.options.getString("name");
		const shipInfo = AL.ships.get(shipName) as Ship;
		let name = shipName;
		let validationResponse = "❓ | Ship not found in database, looking up ship build regardless, make sure you spell their name **fully and correctly**!\n";

		if (shipInfo)
		{
			name = shipInfo.names.en;
			validationResponse = "✅ | Valid Ship!\n";
		}

		wait.setDescription(
			validationResponse +
			"<a:lod:1021265223707000923> | Fetching Build...\n" +
			"<a:lod:1021265223707000923> | Processing Gear Images...\n" +
			"<a:lod:1021265223707000923> | Creating Infographic...\n"
		);
		await interaction.editReply({ embeds: [wait], });

		const slot = [];
		const gears = [];

		name = name.toLowerCase().split(" ").join("_").replace("μ", "%C2%B5");
		const link = `https://slaimuda.github.io/ectl/#/home?ship=${name}`;

		/**
		 * Fetching data and generate image
		 */
		const browser = await puppeteer.launch({
			headless: "new",
			args: ["--no-sandbox"],
		});
		const page = await browser.newPage();

		await page.goto(link, { waitUntil: "networkidle0", });
		await page.waitForSelector(
			".modal-body > div:nth-child(5) > div:nth-child(2) > p:nth-child(1)"
		);

		const containerDivs = await page.$$(".equipment-grid");

		if (!containerDivs || containerDivs.length == 0)
		{
			wait.setDescription(
				validationResponse +
				"❌ | Build not found, please make sure you spell the ship name right!\n" +
				"❌ | Failed to process gear images...\n" +
				"❌ | Failed to create infographic\n"
			);
			return interaction.editReply({ embeds: [wait], });
		}

		wait.setDescription(
			validationResponse +
			"✅ | Build Fetched!\n" +
			"<a:lod:1021265223707000923> | Processing Gear Images...\n" +
			"<a:lod:1021265223707000923> | Creating Infographic...\n"
		);
		await interaction.editReply({ embeds: [wait], });

		for (const containerDiv of containerDivs)
		{
			const cols = await containerDiv.$$(".equipment-column");

			const canvas = createCanvas(50, 50);
			const ctx = canvas.getContext("2d");

			for (const col of cols)
			{
				const h6Text = await col.evaluate((element) =>
				{
					const h6Element = element.querySelector("h6");
					return h6Element.textContent.trim();
				});
				slot.push(h6Text);

				const images = await col.$$("img");

				const gearSrc: Buffer[] = [];

				for (const image of images)
				{
					ctx.clearRect(0, 0, canvas.width, canvas.height);

					const imageSrc = await image.evaluate(elm => elm.src);
					const imageClass = await image.evaluate(elm => elm.className);

					let imageData: Buffer;
					if (imageSrc.startsWith("data:image"))
					{
						imageData = Buffer.from(
							imageSrc.replace(/^data:image\/\w+;base64,/, ""),
							"base64"
						);
					}
					else
					{
						// @ts-ignore
						const convB64: string = await image.evaluate(async (elm) =>
						{
							function blobToB64(src: string): Promise<string>
							{
								return new Promise<string>(async (resolve, _) =>
								{
									const response = await fetch(src);
									const blob = await response.blob();
									// eslint-disable-next-line no-undef
									const reader = new FileReader();

									reader.readAsDataURL(blob);
									reader.onloadend = () =>
									{
										resolve(reader.result as string);
									};
								});
							}

							return await blobToB64(elm.src);
						});

						imageData = Buffer.from(
							convB64.replace(/^data:image\/\w+;base64,/, ""),
							"base64"
						);
					}
					let fillStyle: Canvas.CanvasGradient | string;

					switch (true)
					{
						case imageClass.includes("rarity-ultra-rare"): {
							const gradient = ctx.createLinearGradient(
								0,
								0,
								Math.cos(Math.PI / 3) * 100,
								Math.sin(Math.PI / 3) * 100
							);
							gradient.addColorStop(0, "#fbffca");
							gradient.addColorStop(0.25, "#baffbf");
							gradient.addColorStop(0.5, "#a7efff");
							gradient.addColorStop(1, "#ffabff");

							fillStyle = gradient;
							break;
						}

						case imageClass.includes("rarity-super-rare"): {
							fillStyle = "#ee9";
							break;
						}
						case imageClass.includes("rarity-elite"): {
							fillStyle = "#c4adff";
							break;
						}

						case imageClass.includes("rarity-rare"): {
							fillStyle = "#9fe8ff";
							break;
						}
					}

					ctx.fillStyle = fillStyle;
					ctx.fillRect(0, 0, 50, 50);

					const cImage = await loadImage(imageData);
					const aspectRatio = cImage.width / cImage.height;
					let drawWidth = cImage.width;
					let drawHeight = cImage.height;
					let drawX = 0;
					let drawY = 0;

					if (cImage.width > 50 || cImage.height > 50)
					{
						if (aspectRatio > 1)
						{
							drawWidth = 50;
							drawHeight = drawWidth / aspectRatio;
							drawY = (50 - drawHeight) / 2;
						}
						else
						{
							drawHeight = 50;
							drawWidth = drawHeight * aspectRatio;
							drawX = (50 - drawWidth) / 2;
						}
					}
					else
					{
						drawX = (50 - drawWidth) / 2;
						drawY = (50 - drawHeight) / 2;
					}

					ctx.drawImage(cImage, drawX, drawY, drawWidth, drawHeight);
					gearSrc.push(canvas.toBuffer());
				}

				gears.push(gearSrc);
			}
		}

		await page.close();
		await browser.close();

		wait.setDescription(
			validationResponse +
			"✅ | Build Fetched!\n" +
			"✅ | Processed Gear Images!\n" +
			"<a:lod:1021265223707000923> | Creating Infographic...\n"
		);
		await interaction.editReply({ embeds: [wait], });

		/**
		 * Create build image
		 */
		const shipImage = await loadImage(
			shipInfo ? shipInfo.skins[0].image : "https://i.redd.it/zu372dr7rrdb1.jpg"
		);
		const bgImage = await loadImage(
			path.join(rootDir, "data", "buildBG.png")
		);

		const canvas = createCanvas(1280, 720);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(bgImage, 0, 0);

		// Adding ship image
		const rectangleWidth = canvas.width * 0.57;
		const rectangleHeight = canvas.height;

		const partWidth = Math.round(canvas.width - rectangleWidth);
		const partHeight = canvas.height;

		let resizedHeight = canvas.height;
		let resizedWidth = Math.floor(
			resizedHeight * (shipImage.width / shipImage.height)
		);

		if (shipImage.height - canvas.height >= 1500)
		{
			resizedHeight = Math.round(canvas.height * 1.5);
			resizedWidth = Math.floor(
				resizedHeight * (shipImage.width / shipImage.height)
			);
		}

		const imageX = Math.floor((partWidth - resizedWidth) / 2);
		const imageY = Math.floor((partHeight - resizedHeight) / 2);

		ctx.drawImage(
			shipImage,
			rectangleWidth + imageX,
			imageY,
			resizedWidth,
			resizedHeight
		);

		ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
		ctx.fillRect(0, 0, rectangleWidth, rectangleHeight);

		// Setting Text
		let fontSize = 30;
		const textX = 20;
		const textY = 25 + fontSize;

		const text = shipInfo ? shipInfo.names.code : toTitleCase(name);
		ctx.font = `${fontSize}px QuireSans`;
		ctx.fillStyle = "white";
		ctx.fillText(text, textX, textY);

		// Adding gear images
		let rowX = 150;
		let rowY = 85;

		let tX = 20;
		let tY = rowY + 25;

		const imageGap = 5;

		fontSize = 15;
		ctx.font = `${fontSize}px QuireSans`;
		for (let i = 0; i < gears.length; i++)
		{
			if (i >= 1)
			{
				// Extra pixels to make the rows look more seperated
				rowY += 3;
			}

			const buffers = gears[i];

			let imagesInRow = 0;

			for (let j = 0; j < buffers.length; j++)
			{
				const buffer = buffers[j];
				const image = await loadImage(buffer);

				const imageX = rowX + imagesInRow * (image.width + imageGap);
				const imageY = rowY + i * (image.height + imageGap);

				if (i > 0 && j == 0) tY = imageY + 28;

				ctx.drawImage(image, imageX, imageY);
				imagesInRow++;

				if (imagesInRow >= 10 && j != buffers.length - 1)
				{
					imagesInRow = 0;
					rowY += image.height + imageGap;
				}
			}

			// Text Processing
			let gearName: string;

			switch (true)
			{
				case slot[i].includes("(Dev.30)") || slot[i].includes("(Dev.10)"): {
					gearName = slot[i]
						.split("/")
						.join(".\n")
						.replace(/\(Dev\.(30|10)\)/i, "");
					break;
				}

				case slot[i].includes("(LB"): {
					gearName = "Aircraft (Any Type)";
					break;
				}

				case slot[i].includes("Submarine Torpedoes"): {
					gearName = "Submarine Torps.";
					break;
				}

				default: {
					gearName = slot[i];
					break;
				}
			}

			ctx.fillText(gearName, tX, tY);
		}

		const guild = await this.container.client.guilds.fetch("1002188088942022807");
		const channel = await guild.channels.fetch("1022191350835331203");

		const message = await (channel as TextChannel).send({
			files: [new AttachmentBuilder(canvas.toBuffer(), { name: "image.png", })],
		});

		const img = message.attachments.first().url;

		const buildEmbed: EmbedBuilder = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle(
				`${
					shipInfo
						? `${shipInfo.names.en} | ${shipInfo.names.code}`
						: toTitleCase(name)
				}`
			)
			.setDescription(`[Overview of the Ship & Gears Explanation](${link})`)
			.setImage(img)
			.setFooter({
				text: "Community TL @ https://slaimuda.github.io/ectl/#/home",
			});
		if (shipInfo) buildEmbed.setURL(shipInfo.wikiUrl);
		await interaction.editReply({ embeds: [buildEmbed], });
	}

	/**
	 * /azur-lane gear
	 * @param interaction
	 */
	public async subcommandGear(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const gearName = interaction.options.getString("name");
		const gearFiltered = await gearSearch(gearName);

		if (gearFiltered.length === 0)
		{
			const noResult: EmbedBuilder = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | I apologize, but I could not find the mentioned gear. Please ensure that you have spelled the gear's name correctly."
				);
			return interaction.editReply({ embeds: [noResult], });
		}
		const gear: any = gearFiltered[0].item;

		/**
		 * Generating Embeds
		 */
		const infoEmbeds: EmbedBuilder[] = [];
		const statsEmbeds: EmbedBuilder[] = [];
		const equippableEmbeds: EmbedBuilder[] = [];

		for (let i = 0; i < gear.tiers.length; i++)
		{
			const color = gearColor(gear, i);

			/**
			 * General Info
			 */
			infoEmbeds.push(
				new EmbedBuilder()
					.setColor(color)
					.setThumbnail(gear.image)
					.setTitle(
						`${gear.names["wiki"] || gear.names.en} | ${gear.tiers[i].rarity}`
					)
					.setDescription(`Stars: ${gear.tiers[i].stars.stars}`)
					.setFields(
						{ name: "Nationality:", value: gear.nationality, },
						{ name: "Gear Type:", value: `${gear.category} | ${gear.type.name}`, },
						{ name: "Obtain From:", value: gear.misc.obtainedFrom, }
					)
			);

			if (gear.misc.notes.length > 0)
			{
				infoEmbeds[i].addFields({ name: "Notes:", value: gear.misc.notes, });
			}

			/**
			 * Stats
			 */
			statsEmbeds.push(
				new EmbedBuilder()
					.setColor(color)
					.setThumbnail(gear.image)
					.setTitle(
						`${gear.names["wiki"] || gear.names.en} | ${gear.tiers[i].rarity}`
					)
			);

			gearStats(gear.tiers[i].stats, statsEmbeds[i]);

			/**
			 * Equippables
			 */
			equippableEmbeds.push(
				new EmbedBuilder()
					.setColor(color)
					.setThumbnail(gear.image)
					.setTitle(`${gear.names["wiki"] || gear.names.en}`)
					.setFields({
						name: "Equippable By:",
						value: gearFits(gear.fits).join("\n"),
					})
			);
		}

		/**
		 * Menus
		 */
		const tiers = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`TIERS-${interaction.user.id}`)
				.setMinValues(1)
				.setMaxValues(1)
				.setOptions(
					{
						label: "Tier 1",
						emoji: "1️⃣",
						value: "T1",
						default: true,
					},
					{
						label: "Tier 2",
						value: "T2",
						emoji: "2️⃣",
						default: false,
					}
				)
		);

		if (gear.tiers.length == 3) tiers.components[0].addOptions(
			{
				label: "Tier 3",
				value: "T3",
				emoji: "3️⃣",
				default: false,
			}
		);

		const options = new ActionRowBuilder<StringSelectMenuBuilder>().setComponents(
			new StringSelectMenuBuilder()
				.setCustomId(`OPT-${interaction.user.id}`)
				.setMinValues(1)
				.setMaxValues(1)
				.setOptions(
					{
						label: "Info",
						value: "info",
						emoji: "🔎",
						default: true,
					},
					{
						label: "Stats",
						value: "stats",
						emoji: "📝",
						default: false,
					},
					{
						label: "Fits",
						value: "fits",
						emoji: "🚢",
						default: false,
					}
				)
		);

		const components: ActionRowBuilder<StringSelectMenuBuilder>[] = gear.tiers.length > 1 ? [tiers, options] : [options];

		/**
		 * Collector
		 */
		const message = await interaction.editReply({
			embeds: [infoEmbeds[0]],
			components: gear.tiers.length > 1 ? [tiers, options] : [options],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 120000,
		});

		collectors.set(interaction.user.id, collector);

		let tierCount = 0;

		collector.on("collect", async (i) =>
		{
			const customId = i.customId.split("-")[0];
			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "This menu does not belong to you!",
					ephemeral: true,
				});
			}

			await i.deferUpdate();
			if (customId === "TIERS")
			{
				const menuOptions = tiers.components[0].options;

				for (let j = 0; j < menuOptions.length; j++)
					menuOptions[j].setDefault(menuOptions[j].data.value === i.values[0]);


				switch (i.values[0])
				{
					case "T1": {
						await i.editReply({
							embeds: [infoEmbeds[0]],
							components: [tiers, options],
						});
						tierCount = 0;

						break;
					}

					case "T2": {
						await i.editReply({
							embeds: [infoEmbeds[1]],
							components: [tiers, options],
						});
						tierCount = 1;

						break;
					}

					case "T3": {
						await i.editReply({
							embeds: [infoEmbeds[2]],
							components: [tiers, options],
						});
						tierCount = 2;

						break;
					}
				}
			}
			else
			{
				const menuOptions = options.components[0].options;

				for (let j = 0; j < menuOptions.length; j++)
					menuOptions[j].setDefault(menuOptions[j].data.value === i.values[0]);

				switch (i.values[0])
				{
					case "info": {
						await i.editReply({
							embeds: [infoEmbeds[tierCount]],
							components,
						});

						break;
					}

					case "stats": {
						await i.editReply({
							embeds: [statsEmbeds[tierCount]],
							components,
						});

						break;
					}

					case "fits": {
						await i.editReply({
							embeds: [equippableEmbeds[tierCount]],
							components,
						});

						break;
					}
				}
			}

			collector.resetTimer();
		});

		collector.on("end", async (collected, reason) =>
		{
			tiers.components[0].setDisabled(true);
			options.components[0].setDisabled(true);

			await interaction.editReply({ components, });
		});
	}

	/**
	 * /azur-lane news set
	 * @param interaction
	 */
	public async subcommandNewsSet(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const channel = interaction.options.getChannel("channel") as TextChannel;
		if (!interaction.guild.members.me.permissionsIn(channel).has("SendMessages"))
		{
			const noPerm: EmbedBuilder = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | My apologies, but I need the `Send Messages` permission in this channel..."
				);
			return interaction.editReply({ embeds: [noPerm], });
		}

		/**
		 * Setting the channel to post news
		 */
		const dbChannel = await News.findOne({ guildId: interaction.guild.id, });
		dbChannel
			? await dbChannel.updateOne({ channelId: channel.id, })
			: await News.create({
				guildId: interaction.guild.id,
				channelId: channel.id,
			});
		const done: EmbedBuilder = new EmbedBuilder()
			.setColor("Green")
			.setDescription(
				`✅ | I shall send you the most recent news in <#${channel.id}>...please make sure I have permission to send messages and embed links...`
			);
		await interaction.editReply({ embeds: [done], });
	}

	/**
	 * /azur-lane news stop
	 * @param interaction
	 */
	public async subcommandNewsStop(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		/**
		 * Channel Check
		 */
		const dbChannel = await News.findOne({ guildId: interaction.guild.id, });
		if (!dbChannel)
		{
			const none: EmbedBuilder = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | I apologize, you have yet to set any channels for me to deliver news in the first place..."
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
				"✅ | I shall cease from distributing news in this server..."
			);
		await interaction.editReply({ embeds: [deleted], });
	}
}