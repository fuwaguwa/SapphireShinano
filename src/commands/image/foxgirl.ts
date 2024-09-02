import { ApplyOptions } from "@sapphire/decorators";
import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { envParseArray } from "@skyra/env-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "If you love me, you'll love them too (SFW)",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class KitsuneClass extends Command
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

		const response = await fetch("https://nekos.best/api/v2/kitsune");
		const kitsunePic = await response.json();

		const foxgirlEmbed = new EmbedBuilder()
			.setColor("Random")
			.setFooter({
				text: `Requested by ${interaction.user.username}`,
				iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
			})
			.setTimestamp()
			.setImage(kitsunePic.results[0].url);

		const imageInfo = new ActionRowBuilder<ButtonBuilder>().addComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Link)
				.setEmoji({ name: "🔗", })
				.setLabel("Image Link")
				.setURL(kitsunePic.results[0].url),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setEmoji({ name: "🔍", })
				.setLabel("Get Sauce")
				.setCustomId("SAUCE")
		);

		await interaction.editReply({
			embeds: [foxgirlEmbed],
			components: [imageInfo],
		});
	}
}
