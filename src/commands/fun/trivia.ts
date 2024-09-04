import { Command, CommandOptions, CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { envParseArray } from "@skyra/env-utilities";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, EmbedBuilder } from "discord.js";
import { collectors } from "../../lib/Constants";

@ApplyOptions<CommandOptions>({
	description: "Trivia questions!",
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
})
export class TriviaCommand extends Command
{
	public override registerApplicationCommands(registry: Command.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.addStringOption(option =>
					option
						.setName("category")
						.setDescription("Question category")
						.setChoices([
							{ name: "Arts and Literature", value: "arts_and_literature", },
							{ name: "Film and TV", value: "film_and_tv", },
							{ name: "Food and Drink", value: "food_and_drink", },
							{ name: "General Knowledge", value: "general_knowledge", },
							{ name: "Geography", value: "geography", },
							{ name: "History", value: "history", },
							{ name: "Music", value: "music", },
							{ name: "Science", value: "science", },
							{ name: "Society and Culture", value: "society_and_culture", },
							{ name: "Sport and Leisure", value: "sport_and_leisure", }
						])
				)
				.addStringOption(option =>
					option
						.setName("difficulty")
						.setDescription("Question difficulty")
						.setChoices([
							{ name: "Easy", value: "easy", },
							{ name: "Medium", value: "medium", },
							{ name: "Hard", value: "hard", }
						])
				)
		);
	}

	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const categoryChoice = interaction.options.getString("category") || "random";
		const difficultyChoice = interaction.options.getString("difficulty") || "random";

		let category = categoryChoice;
		if (categoryChoice === "random")
		{
			const all_category = [
				"arts_and_literature",
				"film_and_tv",
				"food_and_drink",
				"general_knowledge",
				"geography",
				"history",
				"music",
				"science",
				"society_and_culture",
				"sport_and_leisure"
			];
			category = all_category[Math.floor(Math.random() * all_category.length)];
		}

		let difficulty = difficultyChoice;
		if (difficultyChoice === "random")
		{
			const allDiff = ["easy", "medium", "hard"];
			difficulty = allDiff[Math.floor(Math.random() * allDiff.length)];
		}

		const trivia = await this.getQuestion(category, difficulty);

		/**
		 * Buttons and Embed
		 */
		const answersRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(trivia.answer1)
				.setCustomId(`${trivia.answer1}-${interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(trivia.answer2)
				.setCustomId(`${trivia.answer2}-${interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(trivia.answer3)
				.setCustomId(`${trivia.answer3}-${interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setLabel(trivia.answer4)
				.setCustomId(`${trivia.answer4}-${interaction.user.id}`)
		);

		const question = new EmbedBuilder()
			.setAuthor({
				iconURL: interaction.user.displayAvatarURL({ forceStatic: false, }),
				name: `${interaction.user.username}'s Trivia Question:`,
			})
			.setDescription(`${trivia.question}\u200b\n\u200b`)
			.setColor("Random")
			.setFields(
				{
					name: "Difficulty",
					value: `${trivia.difficulty.toUpperCase()}`,
					inline: true,
				},
				{
					name: "Category",
					value: `${trivia.category.toUpperCase()}`,
					inline: true,
				}
			)
			.setFooter({ text: "You have 15s to answer!", });

		/**
		 * Collector
		 */
		const message = await interaction.editReply({
			embeds: [question],
			components: [answersRow],
		});
		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.Button,
			time: 15000,
		});

		collectors.set(interaction.user.id, collector);

		collector.on("collect", async (i) =>
		{
			const answer = i.customId.split("-")[0];
			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "This button does not belong to you!",
					ephemeral: true,
				});
			}

			await i.deferUpdate();

			if (answer === trivia.correctAnswer)
			{
				for (let i = 0; i < answersRow.components.length; i++)
				{
					answersRow.components[i].data["custom_id"].split("-")[0] ===
					trivia.correctAnswer
						? answersRow.components[i]
							.setStyle(ButtonStyle.Success)
							.setDisabled(true)
						: answersRow.components[i]
							.setStyle(ButtonStyle.Secondary)
							.setDisabled(true);
				}
				question.setColor("Green");

				collector.stop("End");

				await i.editReply({
					embeds: [question],
					components: [answersRow],
					content: "You are correct!",
				});
			}
			else
			{
				for (let i = 0; i < answersRow.components.length; i++)
				{
					const btnId = answersRow.components[i].data["custom_id"].split("-")[0];
					switch (true)
					{
						case btnId === trivia.correctAnswer: {
							answersRow.components[i]
								.setStyle(ButtonStyle.Success)
								.setDisabled(true);
							break;
						}

						case btnId === answer: {
							answersRow.components[i]
								.setStyle(ButtonStyle.Danger)
								.setDisabled(true);
							break;
						}

						default: {
							answersRow.components[i]
								.setStyle(ButtonStyle.Secondary)
								.setDisabled(true);
							break;
						}
					}
				}
				question.setColor("Red");

				collector.stop("End");

				await i.editReply({
					embeds: [question],
					components: [answersRow],
					content: `That was incorrect, the answer was \`${trivia.correctAnswer}\`.`,
				});
			}
		});

		
	}

	public async getQuestion(category: string, difficulty: string)
	{
		let result = await this.fetchQuestion(category, difficulty);
		while (result.answers[0].length > 60 || result.answers[1].length > 60 || result.answers[2].length > 60 || result.answers[3].length > 60)
			result	= await this.fetchQuestion(category, difficulty);

		console.log(`Trivia Answer: ${result.answers[0]}`);

		// Randomizing answers
		const randChoices = [];
		while (randChoices.length < 4)
		{
			const r = Math.floor(Math.random() * 4);
			if (randChoices.indexOf(r) === -1) randChoices.push(r);
		}

		return {
			question: result.question,
			difficulty: result.difficulty,
			category: result.category,
			correctAnswer: result.answers[0],
			answer1: result.answers[randChoices[0]],
			answer2: result.answers[randChoices[1]],
			answer3: result.answers[randChoices[2]],
			answer4: result.answers[randChoices[3]],
		};
	}

	public async fetchQuestion(category: string, difficulty: string)
	{
		const response = await fetch(`https://the-trivia-api.com/api/questions?categories=${category}&limit=1&difficulty=${difficulty}`,
			{
				method: "GET",
			});
		const trivia = await response.json();

		const answers = [trivia[0].correctAnswer];
		for (let i = 0; i < 3; i++)
			answers.push(trivia[0].incorrectAnswers[i]);

		return { question: trivia[0].question, difficulty: trivia[0].difficulty, category: trivia[0].category, answers, };
	}
}