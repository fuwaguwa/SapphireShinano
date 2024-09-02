import {
	Command,
	CommandOptions,
	CommandOptionsRunTypeEnum
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";
import SRA from "somerandomapi.js";

@ApplyOptions<CommandOptions>({
	description: "Get an image of a dog!",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class DogCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const dogEmbed = new EmbedBuilder()
			.setColor("Random")
			.setImage((await SRA.animal.image({ animal: "dog", })).imgUrl)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ forceStatic: true, }),
			});

		await interaction.editReply({ embeds: [dogEmbed], });
	}
}