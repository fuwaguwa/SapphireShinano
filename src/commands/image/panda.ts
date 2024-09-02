import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import SRA from "somerandomapi.js";
import { EmbedBuilder } from "discord.js";
import { envParseArray } from "@skyra/env-utilities";

@ApplyOptions<CommandOptions>({
	description: "Pandas.",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class PandaCommand extends Command
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

		const pandaEmbed = new EmbedBuilder()
			.setColor("Random")
			.setImage((await SRA.animal.image({ animal: "panda", })).imgUrl)
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
			});

		await interaction.editReply({ embeds: [pandaEmbed], });
	}
}