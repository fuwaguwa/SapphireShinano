import {
	Command,
	CommandOptions,
	CommandOptionsRunTypeEnum
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Roll a dice.",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class RollCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription("Roll a dice.")
				.addIntegerOption(option =>
					option
						.setName("range")
						.setDescription("How many faces the dice have.")
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		const range: number = interaction.options.getInteger("range");
		const dice = Math.floor(range * Math.random());

		const diceEmbed = new EmbedBuilder()
			.setDescription(`You rolled **${dice}**`)
			.setColor("#2b2d31");
		await interaction.reply({ embeds: [diceEmbed], });
	}
}