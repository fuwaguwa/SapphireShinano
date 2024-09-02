import { Listener, ListenerOptions, UserError } from "@sapphire/framework";
import { ChatInputSubcommandDeniedPayload, SubcommandPluginEvents } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<ListenerOptions>({
	event: "chatInputSubcommandDenied",
})
export class MissingClientPermissionSubcommandListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandDenied>
{
	public override async run({ context, identifier, }: UserError, { interaction, }: ChatInputSubcommandDeniedPayload )
	{
		if (Reflect.get(Object(context), "silent")) return;

		const errorEmbed = new EmbedBuilder()
			.setColor("Red")
			.setDescription(`❌ | Shinano is currently missing the following permission(s): ${context["missing"].join(" ")}`);

		if (interaction.deferred || interaction.replied)
		{
			return interaction.editReply({
				embeds: [errorEmbed],
				allowedMentions: { users: [interaction.user.id], roles: [], },
			});
		}

		return interaction.reply({
			embeds: [errorEmbed],
			allowedMentions: { users: [interaction.user.id], roles: [], },
			ephemeral: true,
		});
	}
}