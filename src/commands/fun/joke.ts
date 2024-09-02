import SRA from "somerandomapi.js";
import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Tell you a joke, may or may not be funny",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class JokeCommand extends Command
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

		const jk = await SRA.others.joke();

		const jokeEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(jk.joke);

		await interaction.editReply({ embeds: [jokeEmbed], });
	}
}