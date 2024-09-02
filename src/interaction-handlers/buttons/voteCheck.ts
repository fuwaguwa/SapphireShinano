import {
	InteractionHandler,
	InteractionHandlerOptions,
	InteractionHandlerTypes
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder } from "discord.js";
import User from "../../schemas/User";
import { buttonCooldownCheck, buttonCooldownSet } from "../../lib/Utils";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class VoteCheckButtonHandler extends InteractionHandler
{
	public override parse(interaction: ButtonInteraction)
	{
		if (interaction.customId !== "VOTE-CHECK") return this.none();

		return this.some();
	}

	public override async run(interaction: ButtonInteraction)
	{
		if (await buttonCooldownCheck("VOTE-CHECK", interaction)) return;

		const user = await User.findOne({ userId: interaction.user.id, });

		const voteLink: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel("Vote for Shinano!")
					.setEmoji({ id: "1002849574517477447", })
					.setURL("https://top.gg/bot/1002193298229829682/vote")
			);

		buttonCooldownSet("VOTE-CHECK", interaction);

		if (!user.lastVoteTimestamp)
		{
			// Haven't voted at all
			const noVotesEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"It seems that you have not cast your vote for me! Please do so with the option below!"
				)
				.setTimestamp();
			return interaction.reply({
				embeds: [noVotesEmbed],
				components: [voteLink],
				ephemeral: true,
			});
		}
		else if (
			Math.floor(Date.now() / 1000) - user.lastVoteTimestamp >
			43200
		)
		{
			// 12 hours has passed
			const votableEmbed = new EmbedBuilder()
				.setColor("Green")
				.setDescription(
					`Your last vote was <t:${user.lastVoteTimestamp}:R>, you can now vote again using the button below!`
				)
				.setTimestamp();
			return interaction.reply({
				embeds: [votableEmbed],
				components: [voteLink],
				ephemeral: true,
			});
		}
		else
		{
			// 12 hours has not passed
			const unvotableEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					`Your last vote was <t:${
						user.lastVoteTimestamp
					}:R>, you can vote again <t:${user.lastVoteTimestamp + 43200}:R>`
				)
				.setTimestamp();
			return interaction.reply({ embeds: [unvotableEmbed], ephemeral: true, });
		}
	}
}