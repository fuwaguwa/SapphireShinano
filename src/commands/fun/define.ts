import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Get a word's definition from Urban Dictionary",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class DefineCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName("word")
						.setDescription("The word you want to define")
						.setRequired(true)
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const word = interaction.options.getString("word");
		const response = await fetch(
			`https://api.urbandictionary.com/v0/define?term=${word}`,
			{
				method: "GET",
			}
		);
		const definition = await response.json();

		if (definition.list.length == 0)
		{
			const noResult = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					`❌ | I apologize, but no definition for \`${word}\` can be located...`
				);
			return interaction.editReply({ embeds: [noResult], });
		}

		const wordInfo = definition.list[0];
		const definitionEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setTitle(`"${wordInfo.word}"`)
			.setDescription(wordInfo.definition)
			.setFooter({
				text: `Defintion by ${wordInfo.author} | ${wordInfo.thumbs_up} 👍 /  ${wordInfo.thumbs_down} 👎`,
			});
		if (word.toLowerCase() === "shinano")
			definitionEmbed.setImage(
				"https://cdn.donmai.us/sample/c0/37/__shinano_azur_lane_drawn_by_waa_okami__sample-c037f94c2287a60578bef71acf163865.jpg"
			);

		await interaction.editReply({ embeds: [definitionEmbed], });
	}
}