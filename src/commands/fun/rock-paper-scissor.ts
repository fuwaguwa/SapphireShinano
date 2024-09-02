import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder, Message, User } from "discord.js";
import { collectors } from "../../lib/Constants";


@ApplyOptions<CommandOptions>({
	description: "Play a game of RPS against someone (or with Shinano)",
	cooldownLimit: 1,
	cooldownDelay: 10000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class RPSCommand extends Command
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
						.setDescription("The user you want play against with")
				)
		);
	}

	user: User;
	choiceButtons: ActionRowBuilder<ButtonBuilder>;
	rpsButtons: ActionRowBuilder<ButtonBuilder>;

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		this.user = interaction.options.getUser("user");

		if (this.user && ![this.container.client.user.id, interaction.user.id].includes(this.user.id))
		{
			await interaction.reply(`${this.user}`);

			/**
			 * Buttons
			 */
			 this.choiceButtons =
				new ActionRowBuilder<ButtonBuilder>().setComponents(
				  new ButtonBuilder()
				    .setStyle(ButtonStyle.Success)
				    .setLabel("Accept")
				    .setCustomId(`ACCEPT-${this.user.id}`)
				    .setDisabled(false),
				  new ButtonBuilder()
				    .setStyle(ButtonStyle.Danger)
				    .setLabel("Decline")
				    .setCustomId(`DECLINE-${this.user.id}`)
				    .setDisabled(false)
				);
			this.rpsButtons =
				new ActionRowBuilder<ButtonBuilder>().setComponents(
				  new ButtonBuilder()
				    .setStyle(ButtonStyle.Primary)
				    .setDisabled(false)
				    .setCustomId(`ROCK-${interaction.user.id}-${this.user.id}`)
				    .setEmoji({ name: "👊", }),
				  new ButtonBuilder()
				    .setStyle(ButtonStyle.Primary)
				    .setDisabled(false)
				    .setCustomId(`PAPER-${interaction.user.id}-${this.user.id}`)
				    .setEmoji({ name: "🖐", }),
				  new ButtonBuilder()
				    .setStyle(ButtonStyle.Primary)
				    .setDisabled(false)
				    .setCustomId(`SCISSOR-${interaction.user.id}-${this.user.id}`)
				    .setEmoji({ name: "✌", })
				);

			/**
			 * Duel Acceptance
			 */
			const duelAcceptance = new EmbedBuilder()
				.setColor("#2b2d31")
				.setTitle("⚔ It's Time To D-D-D-DUEL!")
				.setDescription(
					`${this.user}\n**${interaction.user.username} challenged you to a game of RPS!**\nReact to this message to accept or decline the duel!`
				);

			const message = await interaction.editReply({
				embeds: [duelAcceptance],
				components: [this.choiceButtons],
			});

			await this.processDuel(message, interaction);
		}
		else
		{
			if (!interaction.deferred) await interaction.deferReply();

			this.rpsButtons = new ActionRowBuilder<ButtonBuilder>().setComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setDisabled(false)
					.setCustomId(`ROCK-${interaction.user.id}`)
					.setEmoji({ name: "👊", }),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setDisabled(false)
					.setCustomId(`PAPER-${interaction.user.id}`)
					.setEmoji({ name: "🖐", }),
				new ButtonBuilder()
					.setStyle(ButtonStyle.Primary)
					.setDisabled(false)
					.setCustomId(`SCISSOR-${interaction.user.id}`)
					.setEmoji({ name: "✌", })
			);

			const resEmbed = new EmbedBuilder()
				.setColor("#2b2d31")
				.setDescription(
					`\`${interaction.user.username}\` vs \`Shinano\`\n\nMake your choice!`
				);


			const message = await interaction.editReply({
				embeds: [resEmbed],
				components: [this.rpsButtons],
			});

			await this.processBotDuel(message, interaction, resEmbed);
		}
	}

	private async processDuel(message: Message, interaction: Command.ChatInputCommandInteraction)
	{
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
		});

		collectors.set(interaction.user.id, collector);

		collector.on("collect", async (i) =>
		{
			const customId = i.customId.split("-")[0];
			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "This button is not for you!",
					ephemeral: true,
				});
			}

			await i.deferUpdate();
			switch (customId)
			{
				case "ACCEPT":
				{
					const resEmbed = new EmbedBuilder()
						.setColor("#2b2d31")
						.setDescription(
							`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n${this.user}, make your choice!`
						);

					await i.editReply({
						content: `${this.user}`,
						embeds: [resEmbed],
						components: [this.rpsButtons],
					});

					collector.stop("ACCEPTED");
					break;
				}

				case "DECLINE":
				{
					const declinedEmbed = new EmbedBuilder()
						.setColor("Red")
						.setDescription(`❌ \`${this.user.username}\` declined the duel!`);

					await i.editReply({
						content: "",
						embeds: [declinedEmbed],
						components: [],
					});

					collector.stop("DECLINED");
					break;
				}
			}
		});

		collector.on("end", async (collected, reason) =>
		{
			if (!["ACCEPTED", "DECLINED"].includes(reason))
			{
				const timeoutEmbed: EmbedBuilder = new EmbedBuilder()
					.setColor("Red")
					.setDescription(`❌ \`${this.user.username}\` did not respond!`);
				return interaction.editReply({ embeds: [timeoutEmbed], components: [], });
			}
			else if (reason === "ACCEPTED")
			{
				await this.startDuel(message, interaction);
			}
		});
	}

	private async startDuel(message: Message, interaction: Command.ChatInputCommandInteraction)
	{
		let challengerChoice: string;
		let opponentChoice: string;

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 30000,
		});

		collector.on("collect", async (i) =>
		{
			const choice = i.customId.split("-")[0];
			const challengerId = i.customId.split("-")[1];
			const opponentId = i.customId.split("-")[2];

			/**
			 * Opponent Turn
			 */
			if (!opponentChoice)
			{
				if (i.user.id !== opponentId)
				{
					return  i.reply({
						content: "This button is not for you!",
						ephemeral: true,
					});
				}

				await i.deferUpdate();
				opponentChoice = choice;

				const res: EmbedBuilder = new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(
						`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n${interaction.user}, make your choice!`
					);

				await i.editReply({
					content: `${interaction.user}`,
					embeds: [res],
					components: [this.rpsButtons],
				});

				return collector.resetTimer();
			}

			if (i.user.id !== challengerId)
			{
				return await i.reply({
					content: "This button is not for you!",
					ephemeral: true,
				});
			}

			await i.deferUpdate();
			challengerChoice = choice;

			const emojiChallengerChoice = this.choiceToEmoji(challengerChoice);
			const emojiOpponentChoice = this.choiceToEmoji(opponentChoice);

			/**
			 * Result
			 */
			const finalResult: EmbedBuilder = new EmbedBuilder().setColor("#2b2d31");
			if (challengerChoice === opponentChoice)
			{
				finalResult.setDescription(
					`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n` +
					`${this.user.username} picked ${emojiOpponentChoice}\n` +
					`${interaction.user.username} picked ${emojiChallengerChoice}\n` +
					"It's a draw!"
				);
			}
			else
			{
				if (challengerChoice === opponentChoice)
				{
					finalResult.setDescription(
						`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n` +
						`${this.user.username} picked ${emojiOpponentChoice}\n` +
						`${interaction.user.username} picked ${emojiChallengerChoice}\n` +
						"It's a draw!"
					);
				}
				else
				{
					if (
						(challengerChoice === "ROCK" && opponentChoice === "PAPER") ||
						(challengerChoice === "PAPER" && opponentChoice === "SCISSOR") ||
						(challengerChoice === "SCISSOR" && opponentChoice === "ROCK")
					)
					{
						finalResult.setDescription(
							`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n` +
							`${this.user.username} picked ${emojiOpponentChoice}\n` +
							`${interaction.user.username} picked ${emojiChallengerChoice}\n` +
							`${this.user.username} wins!`
						);
					}
					else
					{
						finalResult.setDescription(
							`\`${interaction.user.username}\` vs \`${this.user.username}\`\n\n` +
							`${this.user.username} picked ${emojiOpponentChoice}\n` +
							`${interaction.user.username} picked ${emojiChallengerChoice}\n` +
							`${interaction.user.username} wins!`
						);
					}
				}

				/**
				 * Disable Buttons
				 */
				for (let i = 0; i < 3; i++)
				{
					this.rpsButtons.components[i]
						.setStyle(ButtonStyle.Secondary)
						.setDisabled(true);
				}

				await i.editReply({
					embeds: [finalResult],
					components: [this.rpsButtons],
				});

				collector.stop("Finished!");
			}
		});

		collector.on("end", async (collected, reason) =>
		{
			// Timeout
			if (reason !== "Finished!")
			{
				await interaction.editReply({
					content: "❌ | No interaction from user, duel ended!",
				});
			}
		});
	}

	private choiceToEmoji(choice: string): string
	{
		switch (choice)
		{
			case "ROCK":
				return "👊";
			case "PAPER":
				return "🖐️";
			case "SCISSOR":
				return "✌️";
		}
	}

	private async processBotDuel(message: Message, interaction: Command.ChatInputCommandInteraction, res: EmbedBuilder)
	{
		const collector =
			message.createMessageComponentCollector({
				componentType: ComponentType.Button,
				time: 30000,
			});

		collector.on("collect", async (i) =>
		{
			const customId = i.customId.split("-")[0];

			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "This button does not belong to you!",
					ephemeral: true,
				});
			}

			const allChoices = ["ROCK", "PAPER", "SCISSOR"];
			const botChoice =
				allChoices[Math.floor(Math.random() * allChoices.length)];

			const emojiChallengerChoice = this.choiceToEmoji(customId);
			const convertedBotChoice = this.choiceToEmoji(botChoice);

			await i.deferUpdate();
			for (let i = 0; i < 3; i++)
			{
				this.rpsButtons.components[i].setDisabled(true);
				if (
					customId ===
					this.rpsButtons.components[i].data["custom_id"].split("-")[0]
				)
				{
					this.rpsButtons.components[i].setStyle(ButtonStyle.Success);
				}
				else
				{
					this.rpsButtons.components[i].setStyle(ButtonStyle.Secondary);
				}
			}

			if (customId === botChoice)
			{
				res.setDescription(
					`\`${interaction.user.username}\` vs \`Shinano\`\n\n` +
					` I picked ${convertedBotChoice}\n` +
					`You picked ${emojiChallengerChoice}\n` +
					"It's a draw!"
				);
			}
			else
			{
				if (
					(customId === "ROCK" && botChoice === "PAPER") ||
					(customId === "PAPER" && botChoice === "SCISSOR") ||
					(customId === "SCISSOR" && botChoice === "ROCK")
				)
				{
					res.setDescription(
						`\`${interaction.user.username}\` vs \`Shinano\`\n\n` +
						`I picked ${convertedBotChoice}\n` +
						`You picked ${emojiChallengerChoice}\n` +
						"I won!"
					);
				}
				else
				{
					res.setDescription(
						`\`${interaction.user.username}\` vs \`Shinano\`\n\n` +
						`I picked ${convertedBotChoice}\n` +
						`You picked ${emojiChallengerChoice}\n` +
						"You won!"
					);
				}
			}

			await i.editReply({
				embeds: [res],
				components: [this.rpsButtons],
			});

			collector.stop("picked");
		});

		collector.on("end", async (collected, reason) =>
		{
			// Timeout
			if (reason !== "picked")
			{
				for (let i = 0; i < 3; i++)
				{
					this.rpsButtons.components[i]
						.setDisabled(true)
						.setStyle(ButtonStyle.Secondary);
				}
				const res: EmbedBuilder = new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(
						`\`${interaction.user.username}\` vs \`Shinano\`\n\nUser didn't make a choice!`
					);

				await interaction.editReply({
					embeds: [res],
					components: [this.rpsButtons],
				});
			}
		});
	}
}