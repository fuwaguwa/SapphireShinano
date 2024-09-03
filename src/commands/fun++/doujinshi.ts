import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { envParseArray } from "@skyra/env-utilities";
import { Doujin } from "../../structures/Doujin";
import { ActionRowBuilder, ComponentType, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { displayDoujin, genDoujinEmbed } from "../../lib/Doujin";
import { collectors } from "../../lib/Constants";
import { ShinanoPaginator } from "../../structures/Paginator";

@ApplyOptions<SubcommandOptions>({
	description: "Search up an doujin on the most popular doujin site.",
	nsfw: true,
	cooldownLimit: 1,
	cooldownDelay: 5000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "code",
			chatInputRun: "subcommandCode",
		},
		{
			name: "search",
			chatInputRun: "subcommandSearch",
		}
	],
})
export class DoujinCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setNSFW(true)
				.addSubcommand(command =>
					command
						.setName("code")
						.setDescription("Search up a doujinshi with the 6-digits code.")
						.addIntegerOption(option =>
							option
								.setName("nuclear-launch-code")
								.setDescription("The doujin's code.")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("search")
						.setDescription("Search up a doujinshi.")
						.addStringOption(option =>
							option
								.setRequired(true)
								.setName("search-query")
								.setDescription("Search query (title, artists, groups, tags, etc).")
						)
						.addStringOption(option =>
							option
								.setName("sorting")
								.setDescription("The search sorting")
								.setChoices([
									{ name: "Popular All-Time", value: "popular", },
									{ name: "Popular Weekly", value: "popular-weekly", },
									{ name: "Popular Today", value: "popular-today", },
									{ name: "Recent", value: "recent", }
								])
						)
				)
		);
	}

	/**
	 * /doujinshi code
	 * @param interaction
	 * @param launchCode
	 */
	public async subcommandCode(interaction: Subcommand.ChatInputCommandInteraction, launchCode?: number)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const code = launchCode && typeof launchCode !== "object" ? launchCode : interaction.options.getInteger("nuclear-launch-code");
		const response = await fetch(`https://nhentai.net/api/gallery/${code}`);
		const doujinRep = await response.json();

		if (doujinRep.error)
		{
			const errorEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | I apologize, no doujin was found...");

			return interaction.editReply({ embeds: [errorEmbed], });
		}

		const doujin = new Doujin(doujinRep);
		await displayDoujin(interaction, doujin);
	}


	/**
	 * /doujinshi search
	 * @param interaction
	 */
	public async subcommandSearch(interaction: Subcommand.ChatInputCommandInteraction)
	{
		if (!interaction.deferred) await interaction.deferReply();

		const name = interaction.options.getString("search-query");
		const sorting = interaction.options.getString("sorting") || "popular";
		const blacklist = "-lolicon -scat -guro -insect -shotacon -amputee -vomit -vore -bestiality";

		const response = await fetch(`https://nhentai.net/api/galleries/search?query=${name} ${blacklist}&sort=${sorting}`);
		const body = await response.json();

		if (body.error || body.result.length == 0)
		{
			const noResultEmbed = new EmbedBuilder()
				.setColor("Red")
				.setDescription("❌ | No Result!");
			return interaction.editReply({ embeds: [noResultEmbed], });
		}

		const doujinResults: EmbedBuilder[] = [];
		const resultCount = body.result.length;
		const resultNavigation = new ActionRowBuilder<StringSelectMenuBuilder>()
			.setComponents(
				new StringSelectMenuBuilder()
					.setMaxValues(1)
					.setMinValues(1)
					.setCustomId(`RES-${interaction.user.id}`)
					.setPlaceholder(`Doujin Search Results (${resultCount})`)
			);

		for (let i = 0; i < resultCount; i++)
		{
			const raw = body.result[i];
			const doujin = new Doujin(raw);

			doujinResults.push(genDoujinEmbed(doujin));

			resultNavigation.components[0].addOptions({
				label: `Page ${i + 1} | ${doujin.id}`,
				value: `${doujin.id}`,
			});
		}

		/**
		 * Collector
		 */
		const message = await interaction.editReply({
			embeds: [doujinResults[0]],
			components: [resultNavigation],
		});

		const collector = message.createMessageComponentCollector({
			componentType: ComponentType.StringSelect,
			time: 120000,
		});

		collectors.set(interaction.user.id, collector);

		(new ShinanoPaginator({
			interaction,
			interactorOnly: true,
			pages: doujinResults,
			menu: resultNavigation,
			time: 120000,
		})).startPaginator();

		collector.on("collect", async (i) =>
		{
			if (!i.customId.endsWith(i.user.id))
			{
				return i.reply({
					content: "This menu does not belong to you",
					ephemeral: true,
				});
			}

			await i.deferUpdate();
			const menu = resultNavigation.components[0];
			for (let j = 0; j < menu.options.length; j++)
				menu.options[j].setDefault(menu.options[j].data.value === i.values[0]);

			await this.subcommandCode(interaction, parseInt(i.values[0], 10));

			collector.stop("Processed");
		});

		collector.on("end", async (collected, reason) =>
		{
			// timeout
			if (reason !== "Processed")
			{
				resultNavigation.components[0].setDisabled(true);
				await interaction.editReply({ components: [resultNavigation], });
			}
		});
	}
}