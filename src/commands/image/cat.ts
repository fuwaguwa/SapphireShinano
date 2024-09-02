import { ApplyOptions } from "@sapphire/decorators";
import {  Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { envParseArray } from "@skyra/env-utilities";
import SRA from "somerandomapi.js";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Get an image of a cat!",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class CatCommand extends Command
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

		const catEmbed = new EmbedBuilder()
			.setColor("Random")
			.setImage((await SRA.animal.image({ animal: "cat", })).imgUrl)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
			});

		await interaction.editReply({ embeds: [catEmbed], });
	}
}