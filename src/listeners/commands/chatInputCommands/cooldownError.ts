import {
	ChatInputCommandDeniedPayload,
	Events,
	Identifiers,
	Listener,
	ListenerOptions,
	UserError
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<ListenerOptions>({
	event: "chatInputCommandDenied",
})
export class CooldownErrorListener extends Listener<typeof Events.ChatInputCommandDenied>
{
	public override async run({ context, identifier, }: UserError, { interaction, }: ChatInputCommandDeniedPayload )
	{
		if (Reflect.get(Object(context), "silent")) return;
		if (identifier !== Identifiers.PreconditionCooldown) return;

		const errorEmbed = new EmbedBuilder()
			.setTitle("You're on cooldown!")
			.setDescription(`You will be able to run the command again <t:${Math.floor((Date.now() + context["remaining"])/1000)}:R>`)
			.setColor("Red");

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