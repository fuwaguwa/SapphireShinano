import {
	Command,
	CommandOptions,
	CommandOptionsRunTypeEnum
} from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Ask 8Ball",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class EightBallCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry) 
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName("question")
						.setDescription("Your question.")
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction )
	{
		const responses = [
			"As I see it, yes.",
			"Kindly inquire again at a later time.",
			"It would be preferable not to disclose that information at this moment.",
			"I am unable to provide a prediction at the moment...",
			"Focus your thoughts and pose the question once more.",
			"I advise against relying on it.",
			"It is certain.",
			"It is decidedly so.",
			"Most likely.",
			"Regrettably, my response is in the negative.",
			"According to my sources, the answer is in the negative.",
			"The outlook appears to be unfavorable.",
			"The outlook seems promising.",
			"The response remains uncertain. Please attempt your inquiry once more.",
			"The signs indicate an affirmative response.",
			"Highly doubtful, I'm afraid.",
			"Without a doubt.",
			"Yes.",
			"Indeed, without a doubt.",
			"You may rely on it."
		];

		const responseEmbed= new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(
				`> **${interaction.options.getString("question")}**\n` +
				responses[Math.floor(Math.random() * responses.length)]
			);

		await interaction.reply({ embeds: [responseEmbed], });
	}
}