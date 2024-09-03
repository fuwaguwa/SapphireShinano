import { ChatInputCommandDeniedPayload, Events, Listener, ListenerOptions, UserError } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

@ApplyOptions<ListenerOptions>({
	event: "chatInputCommandDenied",
})
export class VotedError extends Listener<typeof Events.ChatInputCommandDenied>
{
	public override async run({ context, identifier, message: content, }: UserError, { interaction, }: ChatInputCommandDeniedPayload )
	{
		if (Reflect.get(Object(context), "silent")) return;
		if (identifier !== "votedError") return;

		const errorEmbed = new EmbedBuilder()
			.setColor("Red")
			.setTimestamp();

		content === "noVote"
			? errorEmbed.setDescription("It seems that you have not cast your vote for me! Please do so with the option below!")
			: errorEmbed.setDescription(`Your last vote was <t:${content.split("-")[1]}:R>, you can now vote again using the button below!`);

		const voteLink: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel("Vote for Shinano!")
					.setEmoji({ id: "1002849574517477447", })
					.setURL("https://top.gg/bot/1002193298229829682/vote")
			);

		if (interaction.deferred || interaction.replied)
		{
			return interaction.editReply({
				embeds: [errorEmbed],
				components: [voteLink],
				allowedMentions: { users: [interaction.user.id], roles: [], },
			});
		}

		return interaction.reply({
			embeds: [errorEmbed],
			components: [voteLink],
			allowedMentions: { users: [interaction.user.id], roles: [], },
			ephemeral: true,
		});

	}
}