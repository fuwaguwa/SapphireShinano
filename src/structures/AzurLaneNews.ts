import { formatString, getRSSFeed } from "../lib/Utils";
import fs from "fs";
import { rootDir } from "../lib/Constants";
import path from "node:path";
import translate from "google-translate-api-x";
import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	MessageCreateOptions,
	TextChannel
} from "discord.js";
import News from "../schemas/ALNews";
import { container } from "@sapphire/framework";
import axios from "axios";
import puppeteer from "puppeteer-extra";
import Stealth from "puppeteer-extra-plugin-stealth";

puppeteer.use(Stealth());

export class AzurLaneNews
{
	retries = 0;
	EHOSTRetries = 0;

	/**
	 * Start fetching new tweets
	 */
	public async startFetchingTweets()
	{
		if (!process.env.guildId)
		{
			setInterval(async () =>
			{
				await this.fetchTweets();
				await this.fetchWeiboPosts();
			}, 390000);
		}

		container.logger.info("Started fetching tweets...");
	}

	/**
	 * Post tweets to all registered servers
	 * @param tweet
	 * @private
	 */
	private async postTweet(tweet)
	{
		let messageOptions: MessageCreateOptions;

		if (tweet.url.includes("azurlane_staff"))
		{
			const translate = new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setCustomId(`JTWT-${tweet.id}`)
					.setLabel("Translate Tweet")
					.setEmoji({ id: "1065640481687617648", })
			);
			messageOptions = {
				content:
					"__Shikikans, a new message has arrived from JP HQ!__\n" + tweet.url,
				components: [translate],
			};
		}
		else if (tweet.url.includes("weibo.cn"))
		{
			const translate = new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setCustomId(`CTWT-${tweet.id}`)
					.setLabel("Translate Tweet")
					.setEmoji({ id: "1065640481687617648", })
			);
			const tweetEmbed = new EmbedBuilder()
				.setColor("#1da0f2")
				.setDescription(tweet.raw)
				.setAuthor({
					name: "碧蓝航线",
					iconURL:
						"https://cdn.discordapp.com/attachments/1022191350835331203/1110126024978616361/response.jpeg",
					url: "https://m.weibo.cn/u/5770760941",
				});

			if (tweet.img) tweetEmbed.setImage(tweet.img);

			messageOptions = {
				content:
					"__Shikikans, a new message has arrived from CN HQ!__\n" +
					`<${tweet.url}>`,
				embeds: [tweetEmbed],
				components: [translate],
			};
		}
		else
		{
			messageOptions = {
				content:
					"__Shikikans, a new message has arrived from EN HQ!__\n" + tweet.url,
			};
		}

		for await (const doc of News.find())
		{
			try
			{
				const guild = await container.client.guilds.fetch(doc.guildId);
				const channel = await guild.channels.fetch(doc.channelId);

				await (channel as TextChannel).send(messageOptions);
			}
			catch (error)
			{
				/**
				 * 50001: Missing Access
				 * 10003: Unknown Channel
				 * 10004: Unknown Guild
				 */
				if (error.name !== "DiscordAPIError[50001]") console.warn(error);
				if (
					["DiscordAPIError[10004]", "DiscordAPIError[10003]"].includes(
						error.name
					)
				)
					await doc.deleteOne();
			}
		}
	}


	/**
	 * Fetch Tweets from EN and JP twitter account
	 * @private
	 */
	private async fetchTweets()
	{
		const enFeed = await getRSSFeed("AzurLane_EN");
		const jpFeed = await getRSSFeed("azurlane_staff");

		const allFeed = enFeed.items.concat(jpFeed.items);

		allFeed.sort((x, y) =>
		{
			const xId = x.link.substring(0, x.link.length - 2).split("/status/")[1];
			const yId = y.link.substring(0, y.link.length - 2).split("/status/")[1];

			if (xId > yId) return -1;
			if (xId < yId) return 1;
			return 0;
		});

		const newestTweet = allFeed[0];
		const newestTweetLinkUn = newestTweet.link
			.substring(0, newestTweet.link.length - 2)
			.split("/")
			.splice(3);
		const newestTweetLink =
			"https://vxtwitter.com/" + newestTweetLinkUn.join("/");
		const newestTweetId = parseInt(newestTweetLink.split("/status/")[1]);

		const tweetJsonDir = path.join(rootDir, "data", "tweetsInfo.json");
		fs.readFile(tweetJsonDir, "utf-8", async (err, data) =>
		{
			const allSavedTweets = JSON.parse(data);

			const newTweetPresence = allSavedTweets.tweets.find(
				tweet => tweet.id == newestTweetId
			);

			const validTweet =
				!newTweetPresence &&
				!newestTweet.title.includes("RT by") &&
				!newestTweet.title.includes("R to");

			if (validTweet)
			{
				console.log("new valid tweet");
				allSavedTweets.tweets.push({
					id: newestTweetId,
					url: newestTweetLink,
					raw: null,
					enTranslate: newestTweetLink.includes("azurlane_staff")
						? await this.translateTweet(formatString(newestTweet.content), "ja")
						: null,
				});

				fs.writeFile(
					tweetJsonDir,
					JSON.stringify(allSavedTweets, null, "\t"),
					"utf-8",
					(err) =>
					{
						if (err) console.log(err);
					}
				);

				await this.postTweet(allSavedTweets.tweets[allSavedTweets.tweets.length - 1]);
			}
		});
	}

	/**
	 * Fetch posts from CN account
	 * @private
	 */
	private async fetchWeiboPosts()
	{
		fetch("https://al-tweet-scraper.onrender.com/alweibotweet")
			.then(res => res.json())
			.then((json) =>
			{
				const tweetJsonDir = path.join(rootDir, "data", "weiboTweetsInfo.json");

				fs.readFile(tweetJsonDir, "utf-8", async (err, data) =>
				{
					const tweetsInfo = JSON.parse(data);

					const response = json.data;
					response.sort((a, b) => b.id - a.id);
					const tweet = response[0];

					const result = tweetsInfo.tweets.find(tweetI => tweetI.id == tweet.id);

					if (!result)
					{
						const main = async (url: string) =>
						{
							const browser = await puppeteer.launch({
								headless: "new",
								args: ["--no-sandbox"],
							});

							const page = await browser.newPage();
							await page.goto(url);
							await page.waitForSelector(".weibo-text", { timeout: 300000, });

							const pageData = await page.evaluate(() =>
							{
								// eslint-disable-next-line no-undef
								const div = document.querySelector(".weibo-text");
								const textNodes = div.childNodes;

								let text = "";
								for (let i = 0; i < textNodes.length; i++)
								{
									const node = textNodes[i];

									if (node.nodeName === "#text")
									{
										text += node.textContent;
									}
									else if (node.nodeName === "A")
									{
										text += node.textContent;
									}
									else if (node.nodeName === "BR")
									{
										text += "\n";
									}
								}

								return text;
							});

							await browser.close();

							return pageData;
						};

						const text = await main(tweet.url);
						let img = null;

						if (tweet.pictures && tweet.pictures.length >= 1)
						{
							const imageResponse = await axios.get(tweet.pictures[0], {
								responseType: "arraybuffer",
								headers: {
									Host: "wx2.sinaimg.cn",
									Referer: "https://m.weibo.cn/",
								},
							});

							const buffer = Buffer.from(imageResponse.data, "utf-8");

							const guild = await container.client.guilds.fetch("1002188088942022807");
							const channel = await guild.channels.fetch("1110132419484454935");

							let fileFormat = tweet.pictures[0].slice(-3);
							if (["jpg", "png"].includes(fileFormat)) fileFormat = "png";

							const message = await (channel as TextChannel).send({
								files: [
									new AttachmentBuilder(buffer, { name: `image.${fileFormat}`, })
								],
							});

							img = message.attachments.first().url;
						}

						tweetsInfo.tweets.push({
							id: tweet.id,
							url: tweet.url,
							raw: text,
							img: img,
							enTranslate: await this.translateTweet(text, "zh-CN"),
						});

						fs.writeFile(
							tweetJsonDir,
							JSON.stringify(tweetsInfo, null, "\t"),
							"utf-8",
							(err) =>
							{
								if (err) console.error(err);
							}
						);

						await this.postTweet(tweetsInfo.tweets[tweetsInfo.tweets.length - 1]);
					}
				});
			})
			.catch((err) =>
			{
				if (this.retries < 3)
				{
					this.retries++;
					return this.fetchWeiboPosts();
				}

				this.retries = 0;
				console.error(err);
			});
	}

	/**
	 * Translate tweet to english
	 * @param content
	 * @param language
	 * @private
	 */
	private async translateTweet(content: string, language: string)
	{
		try
		{
			const translations = await translate(content, {
				from: language,
				to: "en",
				requestFunction: fetch,
				forceBatch: false,
			});

			return translations.text;
		}
		catch (err)
		{
			console.error(err);

			if (err.message.includes("EHOSTUNREACH") && this.EHOSTRetries < 3)
			{
				this.EHOSTRetries += 1;
				return this.translateTweet(content, language);
			}

			this.EHOSTRetries = 0;
		}
	}

}