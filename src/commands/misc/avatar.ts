import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder, User } from "discord.js";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<SubcommandOptions>({
	description: "Get an user's avatar",
	cooldownLimit: 1,
	cooldownDelay: 3000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "global",
			chatInputRun: "subcommandGlobal",
		},
		{
			name: "guild",
			chatInputRun: "subcommandGuild",
		}
	],
})
export class AvatarCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("global")
						.setDescription("Get an user's global avatar")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The user you want the command to be ran on.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("guild")
						.setDescription("Get an user's server/guild avatar")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("The user you want the command to be ran on.")
						)
				)
		);
	}

	public async subcommandGlobal(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const user = interaction.options.getUser("user") || interaction.user;
		const link = user.displayAvatarURL({ forceStatic: false, size: 1024, });
		await this.sendAvatar(interaction, link, user);
	}

	public async subcommandGuild(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const user = interaction.options.getUser("user") || interaction.user;
		try 
		{
			{
				const guildUser =  await interaction.guild.members.fetch(user);
				const link = guildUser.displayAvatarURL({ forceStatic: false, size: 1024, });
				await this.sendAvatar(interaction, link, user);
			}
		}
		catch (error)
		{
			const errorEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription(
					"❌ | User is not in the guild, please use `/avatar global` instead!"
				);
			return interaction.reply({ embeds: [errorEmbed], });
		}
	}

	private async sendAvatar(interaction: Subcommand.ChatInputCommandInteraction, avatarUrl: string, user: User)
	{
		const avatarEmbed = new EmbedBuilder()
			.setColor("#2b2d31")
			.setDescription(`${user}'s avatar`)
			.setImage(avatarUrl)
			.setFooter({ text: `UID: ${user.id}`, });
		await interaction.reply({ embeds: [avatarEmbed], });
	}
}