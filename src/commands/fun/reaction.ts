import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { EmbedBuilder, User } from "discord.js";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";

@ApplyOptions<SubcommandOptions>({
	description: "Reaction commands.",
	cooldownLimit: 1,
	cooldownDelay: 4500,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "bite",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "blush",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "bored",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "dance",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "handhold",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "highfive",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "hug",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "kick",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "kiss",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "nod",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "pat",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "poke",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "punch",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "slap",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "sleep",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "stare",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "think",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "tickle",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "yeet",
			chatInputRun: "subcommandDefault",
		}
	],
})
export class ReactionCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand(command =>
					command
						.setName("bite")
						.setDescription("Chomp!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("blush")
						.setDescription("...")
				)
				.addSubcommand(command =>
					command
						.setName("bored")
						.setDescription("Nothing to do...")
				)
				.addSubcommand(command =>
					command
						.setName("cuddle")
						.setDescription("Cuddle with someone!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("dance")
						.setDescription("💃🕺")
				)
				.addSubcommand(command =>
					command
						.setName("handhold")
						.setDescription("Hold someone's hand.")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("highfive")
						.setDescription("Highfive someone!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("hug")
						.setDescription("Give someone a warm hug!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("kick")
						.setDescription("Kick someone!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("kiss")
						.setDescription("Kiss someone!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("nod")
						.setDescription("AgreeAgreeAgreeAgree")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("pat")
						.setDescription("There there...")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("poke")
						.setDescription("Don't poke at the bear")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("punch")
						.setDescription("Punth thomeone inth the fathe")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("slap")
						.setDescription("Will Smith")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("sleep")
						.setDescription("The average day of Shinano")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("stare")
						.setDescription("👀")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("think")
						.setDescription("🤔")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("tickle")
						.setDescription("Tickle someone")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
				.addSubcommand(command =>
					command
						.setName("yeet")
						.setDescription("Absolutely yeet someone!")
						.addUserOption(option =>
							option
								.setName("user")
								.setDescription("User receiving the reaction.")
						)
				)
		);
	}

	public async subcommandDefault(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const user = interaction.options.getUser("user");
		const reaction = interaction.options.getSubcommand();
		const description = this.getDescription(reaction, user, interaction);
		const imageLink = await this.getReactionImageLink(reaction);

		const reactionEmbed = new EmbedBuilder()
			.setColor("Random")
			.setDescription(description)
			.setImage(imageLink);

		await interaction.editReply({ embeds: [reactionEmbed], });
	}

	private getDescription(reaction: string, user: User | null, interaction: Subcommand.ChatInputCommandInteraction): string
	{
		switch (reaction)
		{
			case "bite": return user ? `${interaction.user} bit ${user}!` : "You bit yourself...wtf?";
			case "blush": return `${interaction.user} blushed!`;
			case "bored": return `${interaction.user} is bored...`;
			case "cuddle": return user ? `${interaction.user} cuddled with ${user}!` : "You cuddled with yourself?";
			case "dance": return "";
			case "handhold": return user ? `${interaction.user} helf ${user}'s hand!` : "You held hands with yourself...";
			case "highfive": return user ? `${interaction.user} highfived ${user}` : "You highfived yourself?";
			case "hug": return user ? `${interaction.user} hugged ${user}!` : "You hugged yourself?";
			case "kick": return user ? `${interaction.user} kicked ${user}!` : "You kicked yourself?";
			case "kiss": return user ? `${interaction.user} kissed ${user}!` : "You kissed yourself?";
			case "nod": return "";
			case "pat": return user ? `${interaction.user} headpatted ${user}!` : "You headpatted yourself?";
			case "poke": return user ? `${interaction.user} poked ${user}!` : "You poked yourself?";
			case "punch": return user ? `${interaction.user} poked ${user}!` : "You poked yourself?";
			case "slap": return user ? `${interaction.user} slapped ${user}!` : "You slapped yourself?";
			case "sleep": return `Shh...${interaction.user} is sleeping!`;
			case "stare": return user ? `${interaction.user} is staring at ${user}!` : "You are staring at yourself?";
			case "think": return `${interaction.user} is cooking up something malicious...`;
			case "tickle": return user ? `${interaction.user} tickled ${user}!` : "You tickled yourself?";
			case "yeet": return user ? `${interaction.user} yeeted ${user}!` : "You yeeted yourself?";
		}
	}

	private async getReactionImageLink(reaction: string): Promise<string>
	{
		const response = await fetch(`https://nekos.best/api/v2/${reaction}`);
		const rep = await response.json();

		return (rep.results[0].url as string);
	}
}