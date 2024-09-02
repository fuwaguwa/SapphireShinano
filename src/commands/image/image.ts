import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import Canvas from "canvas";
import { join } from "path";
import { rootDir } from "../../lib/Constants";
import { AttachmentBuilder, EmbedBuilder, User } from "discord.js";
import { ImageSendOptions } from "../../typings/Image";
import SRA, { CanvasMiscOogwayQuoteType, CanvasMiscTweetTheme } from "somerandomapi.js";

Canvas.registerFont(join(rootDir, "font", "Upright.otf"), { family: "Upright", });


@ApplyOptions<SubcommandOptions>({
	description: "Image Generation & Manipulation Commands",
	cooldownLimit: 1,
	cooldownDelay: 6500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "bronya",
			chatInputRun: "subcommandBronya",
		},
		{
			name: "pixelate",
			chatInputRun: "subcommandPixelate",
		},
		{
			name: "border",
			chatInputRun: "subcommandBorder",
		},
		{
			name: "jpg",
			chatInputRun: "subcommandJpg",
		},
		{
			name: "no",
			chatInputRun: "subcommandNo",
		},
		{
			name: "heart-crop",
			chatInputRun: "subcommandHeartCrop",
		},
		{
			name: "lolice",
			chatInputRun: "subcommandLolice",
		},
		{
			name: "filter",
			chatInputRun: "subcommandFilter",
		},
		{
			name: "oogway",
			chatInputRun: "subcommandOogway",
		},
		{
			name: "horny-card",
			chatInputRun: "subcommandHornyCard",
		},
		{
			name: "simp-card",
			chatInputRun: "subcommandSimpCard",
		},
		{
			name: "sigma",
			chatInputRun: "subcommandSigma",
		},
		{
			name: "namecard",
			chatInputRun: "subcommandNamecard",
		},
		{
			name: "comment",
			chatInputRun: "subcommandComment",
		},
		{
			name: "tweet",
			chatInputRun: "subcommandTweet",
		},
		{
			name: "gay",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "jail",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "wasted",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "triggered",
			chatInputRun: "subcommandDefault",
		}
	],
})
export class ImageCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("bronya")
						.setDescription("Bronya's certificate")
						.addStringOption(option =>
							option
								.setName("text")
								.setDescription("Text to put on the certificate.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("pixelate")
						.setDescription("Make someone avatar looks lewd")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to pixelate.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("border")
						.setDescription("Add a LGBT+ border to someone avatar.")
						.addStringOption(option =>
							option
								.setName("border-type")
								.setDescription("Type of border")
								.setRequired(true)
								.setChoices([
									{ name: "LGBT", value: "lgbt", },
									{ name: "Bisexual", value: "bisexual", },
									{ name: "Non-binary", value: "nonbinary", },
									{ name: "Pansexual", value: "pansexual", },
									{ name: "Transgender", value: "transgender", },
									{ name: "Lesbian", value: "lesbian", }
								])
						)
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User you want to add the border to")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("jpg")
						.setDescription("Feel the artifacts")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to jpg-ify.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("no")
						.setDescription("No women?")
						.addStringOption(option =>
							option
								.setName("item")
								.setDescription("Item.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("heart-crop")
						.setDescription("Crop someone avatar into a heart!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to be cropped.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("lolice")
						.setDescription("Anti-PDF file gang!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The lolicon`")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("filter")
						.setDescription("Add some color filter to an avatar.")
						.addStringOption(option =>
							option
								.setName("filter")
								.setDescription("Filter to be added over.")
								.setRequired(true)
								.setChoices([
									{ name: "Blurple", value: "discordBlurpify", },
									{ name: "Sepia", value: "sepia", },
									{ name: "Red", value: "redify", },
									{ name: "Green", value: "greenify", },
									{ name: "Blue", value: "blueify", },
									{ name: "Invert", value: "invert", },
									{ name: "Greyscale", value: "greyscale", },
									{ name: "Invert and Greyscale", value: "invertGreyscale", }
								])
						)
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to add the filter on.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("oogway")
						.setDescription("Wise turtle")
						.addStringOption(option =>
							option
								.setName("wisdom")
								.setDescription("His wisdom.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("horny-card")
						.setDescription("Grant someone the horny card")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The person receiving the card.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("simp-card")
						.setDescription("Give someone the simp card. Shame on them")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The person receiving the card.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("sigma")
						.setDescription("Sigma grindset")
						.addStringOption(option =>
							option
								.setName("text")
								.setDescription("Sigmna quote.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("namecard")
						.setDescription("Generate a Genshin namecard.")
						.addStringOption(option =>
							option
								.setName("birthday")
								.setDescription("The birthday to display on the namecard.")
								.setRequired(true)
						)
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The user on the namecard")
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName("signature")
								.setDescription("The signature of the namecard")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("comment")
						.setDescription("Generate a fake picture of a YouTube comment")
						.addStringOption(option =>
							option
								.setName("content")
								.setDescription("The content of the comment.")
								.setRequired(true)
						)
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The author of the comment")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("tweet")
						.setDescription("Generate a fake tweet.")
						.addStringOption(option =>
							option
								.setName("display-name")
								.setDescription("Display name of the tweet")
								.setRequired(true)
						)
						.addStringOption(option =>
							option
								.setName("content")
								.setDescription("Content of the tweet")
								.setRequired(true)
						)
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The author of the tweet")
						)
						.addIntegerOption(option =>
							option
								.setName("retweets")
								.setDescription("The number of retweets")
						)
						.addIntegerOption(option =>
							option
								.setName("likes")
								.setDescription("The number of likes")
						)
						.addStringOption(option =>
							option
								.setName("theme")
								.setDescription("Theme of the tweet")
								.setChoices([
									{ name: "Dark Mode", value: "dark", },
									{ name: "Light Mode", value: "light", }
								])
						)
				)
				.addSubcommand(command =>
					command
						.setName("gay")
						.setDescription("Apply a rainbow filter to an user or yourself.")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to turn gay")
						)
				)
				.addSubcommand(command =>
					command
						.setName("jail")
						.setDescription("Put an user or yourself behind bars")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User to be put behind bars")
						)
				)
				.addSubcommand(command =>
					command
						.setName("wasted")
						.setDescription("Wasted.")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User")
						)
				)
				.addSubcommand(command =>
					command
						.setName("triggered")
						.setDescription("Triggered.")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User")
						)
				)
		);
	}

	target: User;
	avatar: string;

	public async subcommandDefault(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = (
			await SRA.canvas.overlay[interaction.options.getSubcommand()]({
				imgUrl: this.avatar,
			})
		).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image bronya
	 * @param interaction interaction
	 */
	public async subcommandBronya(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		let canvas = Canvas.createCanvas(1547, 1920);
		let context = canvas.getContext("2d");
		let background = await Canvas.loadImage(
			"https://i.imgur.com/EH71R7O.png"
		);


		let applyText = (canvas, text) =>
		{
			const context = canvas.getContext("2d");
			let fontSize = 120;
			do
			{
				context.font = `${(fontSize -= 5)}px upright`;
			} while (context.measureText(text).width > 847);
			return context.font;
		};

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		context.font = applyText(canvas, interaction.options.getString("text"));
		context.fillStyle = "#000000";
		context.textAlign = "center";
		context.fillText(
			interaction.options.getString("text"),
			canvas.width / 2 + 5,
			1485
		);

		await this.send({ interaction, image: canvas.toBuffer(), });
	}

	/**
	 * /image pixelate
	 * @param interaction interaction
	 */
	public async subcommandPixelate(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);
		const link = SRA.canvas.misc.pixelate({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image border
	 * @param interaction interaction
	 */
	public async subcommandBorder(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const borderType = interaction.options.getString("border-type");
		const link = (await SRA.canvas.misc[borderType]({ imgUrl: this.avatar, })).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image jpg
	 * @param interaction
	 */
	public async subcommandJpg(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = SRA.canvas.misc.jpg({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image no
	 * @param interaction interaction
	 */
	public async subcommandNo(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const text = interaction.options.getString("item");
		const link = SRA.canvas.misc.noBitches({ item: text, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image heart-crop
	 * @param interaction
	 */
	public async subcommandHeartCrop(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = SRA.canvas.misc.heartCrop({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image lolice
	 * @param interaction
	 */
	public async subcommandLolice(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = SRA.canvas.misc.lolice({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image filter
	 * @param interaction
	 */
	public async subcommandFilter(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const filter = interaction.options.getString("filter");
		const link = (await SRA.canvas.filter[filter]({ imgUrl: this.avatar, })).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image oogway
	 * @param interaction
	 */
	public async subcommandOogway(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const type = ["1", "2"][Math.floor(Math.random() * 2)];
		const text = interaction.options.getString("wisdom");
		const link = SRA.canvas.misc.oogwayQuote({
			type: type as CanvasMiscOogwayQuoteType,
			quote: text,
		}).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image horny-card
	 * @param interaction
	 */
	public async subcommandHornyCard(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = SRA.canvas.misc.hornyCard({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image simp-card
	 * @param interaction
	 */
	public async subcommandSimpCard(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const link = SRA.canvas.misc.simpCard({ imgUrl: this.avatar, }).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image sigma
	 * @param interaction
	 */
	public async subcommandSigma(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		let canvas = Canvas.createCanvas(750, 750);
		let context = canvas.getContext("2d");

		const sigmaImages = [
			"https://i.imgur.com/G7i9yyS.jpg",
			"https://i.imgur.com/jEFhMKd.png",
			"https://i.imgur.com/MZCirY7.jpg",
			"https://i.imgur.com/6YvbFX5.jpg",
			"https://i.imgur.com/LM9Tpfb.png",
			"https://i.imgur.com/bL1sqcf.png",
			"https://i.imgur.com/DKuRMcU.png"
		];
		let background = await Canvas.loadImage(
			sigmaImages[Math.floor(Math.random() * sigmaImages.length)]
		);

		let applyText = (canvas, text) =>
		{
			const context = canvas.getContext("2d");
			let fontSize = 130;
			do
			{
				context.font = `${(fontSize -= 5)}px upright`;
			} while (context.measureText(text).width > 720);
			return context.font;
		};

		context.drawImage(background, 0, 0, canvas.width, canvas.height);
		context.font = applyText(canvas, interaction.options.getString("text"));
		context.fillStyle = "#ffffff";
		context.strokeStyle = "#000000";
		context.lineWidth = 3.5;
		context.textAlign = "center";
		context.fillText(
			interaction.options.getString("text"),
			canvas.width / 2,
			canvas.height / 2 + 30
		);
		context.strokeText(
			interaction.options.getString("text"),
			canvas.width / 2,
			canvas.height / 2 + 30
		);

		await this.send({ interaction, image: canvas.toBuffer(), });
	}

	/**
	 * /image namecard
	 * @param interaction
	 */
	public async subcommandNamecard(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const birthday = interaction.options.getString("birthday");
		const description = interaction.options.getString("signature");
		const username = this.target.username;

		if (birthday.match(/^(0?[1-9]|[12][0-9]|3[01])\/(0?[1-9]|[1][0-2])$/i) == null)
		{
			const failedEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | Birthday must be in `DD/MM` format!");
			return interaction.editReply({ embeds: [failedEmbed], });
		}

		const link = SRA.canvas.misc.genshinNamecard({
			imgUrl: this.avatar,
			birthday,
			username,
			description,
		}).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image comment
	 * @param interaction
	 */
	public async subcommandComment(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const content = interaction.options.getString("content");
		const username = this.target.username;
		const link = SRA.canvas.misc.youtubeComment({
			username,
			imgUrl: this.avatar,
			comment: content,
		}).imgUrl;

		await this.send({ interaction, link, });
	}

	/**
	 * /image tweet
	 * @param interaction
	 */
	public async subcommandTweet(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await this.initial(interaction);

		const displayName = interaction.options.getString("display-name");
		const username = this.target.username.toLowerCase();
		const content = interaction.options.getString("content");
		const replies = interaction.options.getInteger("replies");
		const retweets = interaction.options.getInteger("retweets");
		const likes = interaction.options.getInteger("likes");
		const theme = interaction.options.getString("theme") || "light";
		const link =  SRA.canvas.misc.tweet({
			displayName,
			username,
			content,
			imgUrl: this.avatar,
			repliesCount: replies,
			retweetsCount: retweets,
			likesCount: likes,
			theme: theme as CanvasMiscTweetTheme,
		}).imgUrl;

		await this.send({ interaction, link, });
	}

	private async initial(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		this.target = interaction.options.getUser("user") || interaction.user;
		this.avatar =  this.target.displayAvatarURL({
			size: 512,
			extension: "png",
			forceStatic: false,
		});
	}

	private async send({ interaction, image, link, }: ImageSendOptions)
	{
		if (image)
		{
			let attachment = new AttachmentBuilder(image, { name: "image.gif", });
			return interaction.editReply({ files: [attachment], });
		}

		const embed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setImage(link);
		return interaction.editReply({ embeds: [embed], });
	}
}