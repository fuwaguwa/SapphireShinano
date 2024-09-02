import { Listener, ListenerOptions, UserError } from "@sapphire/framework";
import {
	ChatInputSubcommandDeniedPayload,
	SubcommandPluginEvents
} from "@sapphire/plugin-subcommands";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<ListenerOptions>({
	event: "chatInputSubcommandDenied",
})
export class InMainServerErrorSubcommandListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandDenied>
{
	public override async run({ context, identifier, }: UserError, { interaction, }: ChatInputSubcommandDeniedPayload)
	{
		if (Reflect.get(Object(context), "silent")) return;
		if (identifier !== "notInMainServerError") return;

		const exclusiveEmbed = new EmbedBuilder()
			.setColor("Red")
			.setTitle("Exclusive Command!")
			.setDescription(
				"You have used a command exclusive to the members of the Shrine of Shinano server, join the server to use the command anywhere!"
			);
		const button: ActionRowBuilder<ButtonBuilder> =
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Link)
					.setLabel("Join Server!")
					.setEmoji({ name: "🔗", })
					.setURL("https://discord.gg/NFkMxFeEWr")
			);
		await interaction.editReply({
			embeds: [exclusiveEmbed],
			components: [button],
		});
	}
}