import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { getSauce } from "../../lib/Sauce";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<SubcommandOptions>({
	description: "Get the sauce for an image.",
	cooldownLimit: 1,
	cooldownDelay: 7500,
	cooldownFilteredUsers: [...envParseArray("ownerIds")],
	nsfw: true,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "link",
			chatInputRun: "subcommandLink",
		},
		{
			name: "file",
			chatInputRun: "subcommandFile",
		}
	],
})
export class SauceCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setNSFW(true)
				.addSubcommand(command =>
					command
						.setName("link")
						.setDescription("Get the sauce for an image/gif with a raw image link.")
						.addStringOption(option =>
							option
								.setName("link")
								.setDescription("RAW image link.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("file")
						.setDescription("Get the sauce for an image/gif by uploading it.")
						.addAttachmentOption(option =>
							option
								.setName("image")
								.setDescription("The image/GIF itself.")
								.setRequired(true)
						)
				)
		);
	}

	public async subcommandLink(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await getSauce({ interaction, link: interaction.options.getString("link"), ephemeral: false, });
	}

	public async subcommandFile(interaction: Subcommand.ChatInputCommandInteraction)
	{
		await getSauce({ interaction, link: interaction.options.getAttachment("image").proxyURL, ephemeral: false, });
	}

}