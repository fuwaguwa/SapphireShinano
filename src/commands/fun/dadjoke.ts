import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";


@ApplyOptions<CommandOptions>({
	description: "Make a dadjoke",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class DadjokeCommand extends Command
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

		const response = await fetch(
			"https://dad-jokes.p.rapidapi.com/random/joke",
			{
				method: "GET",
				headers: {
					"X-RapidAPI-Host": "dad-jokes.p.rapidapi.com",
					"X-RapidAPI-Key": process.env.rapidApiKey,
				},
			}
		);
		const dadjoke: any = await response.json();

		const dadjokeEmbed = new EmbedBuilder()
			.setColor("Random")
			.setDescription(
				`**${dadjoke.body[0].setup}**\n${dadjoke.body[0].punchline}`
			);

		await interaction.editReply({ embeds: [dadjokeEmbed], });
	}
}