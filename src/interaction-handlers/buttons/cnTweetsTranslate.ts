import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction, EmbedBuilder } from "discord.js";
import fs from "fs";
import { join } from "path";
import { rootDir } from "../../lib/Constants";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class CNTweetsTranslateButtonHandler extends InteractionHandler
{
	public override parse(interaction: ButtonInteraction)
	{
		if (!interaction.customId.includes("CTWT")) return this.none();

		return this.some();
	}

	public override async run(interaction: ButtonInteraction)
	{
		await interaction.deferReply({ ephemeral: true, });

		const tweetId = interaction.customId.split("-")[1];

		fs.readFile(join(rootDir, "data", "weiboTweetsInfo.json"), "utf-8", (err, data) =>
		{
			const json = JSON.parse(data);
			const tweet = json.tweets.find(tweet => tweet.id == tweetId);

			if (!tweet || !tweet.enTranslate)
			{
				const noTweetEmbed = new EmbedBuilder()
					.setColor("Red")
					.setDescription(
						"❌ | \"The tweet is currently not in the database...please visit the tweet directly and seek translation there...\""
					);
				return interaction.editReply({ embeds: [noTweetEmbed], });
			}

			const translatedTweetEmbed = new EmbedBuilder()
				.setColor("#2b2d31")
				.setTitle("Translated Tweet")
				.setDescription(tweet.enTranslate)
				.setFooter({ text: "Translated with Google Translate", });

			return interaction.editReply({ embeds: [translatedTweetEmbed], });
		});
	}
}