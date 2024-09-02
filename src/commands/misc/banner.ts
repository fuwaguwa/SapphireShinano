import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { EmbedBuilder } from "discord.js";

@ApplyOptions<CommandOptions>({
	description: "Get an user's banner",
	cooldownLimit: 1,
	cooldownDelay: 3000,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	preconditions: ["NotBlacklisted"],
})
export class BannerCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addUserOption(option =>
					option
						.setName("user")
						.setDescription("The user you want the banner from")
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		const user = interaction.options.getUser("user") || interaction.user;

		if (!interaction.deferred) await interaction.deferReply();
		const response = await fetch(
			`https://discord.com/api/v8/users/${user.id}`,
			{
				method: "GET",
				headers: {
					Authorization: `Bot ${process.env.botToken}`,
				},
			}
		);

		const received = await response.json();
		if (!received.banner)
		{
			const failedEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | User does not have a banner.");
			return interaction.editReply({ embeds: [failedEmbed], });
		}

		let format = "png";
		if (received.banner.substring(0, 2) === "a_") format = "gif";

		const banner: EmbedBuilder = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(`${user}'s Banner`)
			.setImage(
				`https://cdn.discordapp.com/banners/${user.id}/${received.banner}.${format}?size=512`
			);

		await interaction.editReply({ embeds: [banner], });
	}
}