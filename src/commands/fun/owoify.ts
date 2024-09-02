import { ApplicationCommandRegistry, Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Owoify your text",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class OwoifyCommand extends Command
{
	public override registerApplicationCommands(registry: ApplicationCommandRegistry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName("text")
						.setDescription("The text you want to owoify (Limit: 200 chars)")
						.setRequired(true)
				)

		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const text: string = interaction.options.getString("text");
		if (text.length > 200)
		{
			const invalidEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | The `text` is constrained by a limit of 200 characters..."
				);
			return interaction.editReply({ embeds: [invalidEmbed], });
		}

		const response = await fetch(
			`https://nekos.life/api/v2/owoify?text=${text.split(" ").join("%20")}`
		);
		const owo = (await response.json()).owo;

		const owoEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(`> ${owo}\n\n` + `- ${interaction.user}`);

		await interaction.editReply({ embeds: [owoEmbed], });
	}
}