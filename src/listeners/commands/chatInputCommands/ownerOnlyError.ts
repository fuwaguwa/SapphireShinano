import { ChatInputCommandDeniedPayload, Events, Listener, ListenerOptions, UserError } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<ListenerOptions>({
	event: "chatInputCommandDenied",
})
export class OwnerOnlyErrorListener extends Listener<typeof Events.ChatInputCommandDenied>
{
	public override async run({ context, identifier, }: UserError, { interaction, }: ChatInputCommandDeniedPayload )
	{
		if (Reflect.get(Object(context), "silent")) return;
		if (identifier !== "ownerOnlyError") return;

		const errorEmbed = new EmbedBuilder()
			.setColor("Red")
			.setDescription("This command is only available to the developers~");

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