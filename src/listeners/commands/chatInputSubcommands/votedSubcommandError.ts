import {
	Listener, ListenerOptions,
	UserError
} from "@sapphire/framework";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder
} from "discord.js";
import { ChatInputSubcommandDeniedPayload, SubcommandPluginEvents } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({
	event: "chatInputSubcommandDenied",
})
export class VotedSubcommandError extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandDenied>
{
	public override async run({ context, identifier, message: content, }: UserError, { interaction, }: ChatInputSubcommandDeniedPayload )
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