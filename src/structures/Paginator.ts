import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	ChatInputCommandInteraction,
	EmbedBuilder,
	InteractionEditReplyOptions,
	InteractionReplyOptions, Message,
	MessagePayload, StringSelectMenuBuilder
} from "discord.js";
import { ShinanoPaginatorOptions } from "../typings/Paginator";
import { pageCollectors } from "../lib/Constants";

export class ShinanoPaginator
{
	interaction: ChatInputCommandInteraction;
	lastPage: number;
	pages: EmbedBuilder[];
	payloads: MessagePayload[] | InteractionReplyOptions[] | InteractionEditReplyOptions[] ;
	menu: ActionRowBuilder<StringSelectMenuBuilder>;
	interactorOnly: boolean = false;
	time: number;

	paginatorNavigation: ActionRowBuilder<ButtonBuilder>;
	pagingButtons: ButtonBuilder[];

	public constructor({ interaction, lastPage, pages, payloads, menu, interactorOnly, time, }: ShinanoPaginatorOptions)
	{
		this.interaction = interaction;
		this.lastPage = lastPage;
		this.pages = pages;
		this.payloads = payloads;
		this.menu = menu;
		this.interactorOnly = interactorOnly;
		this.time = time;
	}

	public async startPaginator(): Promise<number>
	{
		return new Promise(async (resolve) =>
		{
			let pageCount: number = this.lastPage || 0;
			let menuId: string;


			if (this.menu) menuId = this.menu.components[0].data.custom_id.split("-")[0];
			if (!this.interaction.deferred) await this.interaction.deferReply();

			/**
			 * Paginator Buttons
			 */
			this.setButtons(pageCount);

			/**
			 * Modifying buttons based on page
			 */
			if (this.pages.length == 1)
			{
				for (let i = 0; i < this.pagingButtons.length; i++)
				{
					this.pagingButtons[i].setStyle(ButtonStyle.Secondary).setDisabled(true);
				}
			}
			else if (this.pages.length === pageCount)
			{
				this.pagingButtons[3].setDisabled(true);
				this.pagingButtons[4].setDisabled(true);
			}
			else if (pageCount == 0)
			{
				this.pagingButtons[0].setDisabled(true);
				this.pagingButtons[1].setDisabled(true);
			}


			/**
			 * Collector
			 */
			let message: Message;
			const components: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[] = [this.paginatorNavigation];
			if (this.menu) components.unshift(this.menu);

			message = await this.interaction.editReply(
				this.payloads
					? Object.assign(this.payloads[pageCount], { components, })
					:{ embeds: [this.pages[pageCount]], components, }
			);

			if (this.pages.length == 1) return;

			const collector = message.createMessageComponentCollector({ time: this.time, });

			pageCollectors.set(this.interaction.user.id, collector);

			collector.on("collect", async (i) =>
			{
				const customId = i.customId.split("-")[0];
				if (customId === menuId)
				{
					resolve(pageCount);
					pageCount = 0;
					return collector.stop("interaction ended");
				}

				if (this.interactorOnly && i.customId.split("-")[1] !== i.user.id)
				{
					return i.reply({
						content: "This button does not belong to you!",
						ephemeral: true,
					});
				}

				/**
				 * Changing pages
				 */
				switch (customId)
				{
					case "BACK": {
						pageCount--;
						break;
					}

					case "NEXT": {
						pageCount++;
						break;
					}

					case "FIRST": {
						pageCount = 0;
						break;
					}

					case "LAST": {
						pageCount = this.pages.length - 1;
						break;
					}
				}

				/**
				 * Editing buttons
				 */
				if (!i.deferred) await i.deferUpdate();
				this.pagingButtons[2].setLabel(`Page: ${pageCount + 1}/${this.pages.length}`);

				// First Page
				if (pageCount == 0)
				{
					this.pagingButtons[0].setDisabled(true);
					this.pagingButtons[1].setDisabled(true);

					this.pagingButtons[3].setDisabled(false);
					this.pagingButtons[4].setDisabled(false);
				}

				// Normal Pages
				if (pageCount != 0 && pageCount != this.pages.length - 1)
				{
					this.pagingButtons.forEach((button, i) =>
					{
						if (i == 2) return;
						button.setDisabled(false);
					});
				}

				// Last Page
				if (pageCount == this.pages.length - 1)
				{
					this.pagingButtons[0].setDisabled(false);
					this.pagingButtons[1].setDisabled(false);

					this.pagingButtons[3].setDisabled(true);
					this.pagingButtons[4].setDisabled(true);
				}

				const updatedComponents: ActionRowBuilder<StringSelectMenuBuilder | ButtonBuilder>[]  = [this.paginatorNavigation];
				if (this.menu) updatedComponents.unshift(this.menu);

				await i.editReply(
					this.payloads
						? Object.assign(this.payloads[pageCount], { components: updatedComponents, })
						: { embeds: [this.pages[pageCount]], components: updatedComponents, }
				);

				collector.resetTimer();
			});

			/**
			 * I give up
			 */
			collector.on("end", async (collected, reason) =>
			{
				if (["messageDelete", "interaction ended"].includes(reason)) return;

				for (let i = 0; i < this.paginatorNavigation.components.length; ++i)
				{
					this.pagingButtons[i].setStyle(ButtonStyle.Secondary).setDisabled(true);
				}

				if (this.menu)
				{
					this.menu.components[0].setDisabled(true);
					await this.interaction.editReply({
						components: [this.menu, this.paginatorNavigation],
					});
				}
				else
				{
					await this.interaction.editReply({ components: [this.paginatorNavigation], });
				}
			});
		});
	}

	private setButtons(pageCount: number)
	{
		this.paginatorNavigation = 	new ActionRowBuilder<ButtonBuilder>().setComponents(
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji({ id: "1002197527732437052", })
				.setDisabled(pageCount == 0)
				.setCustomId(`FIRST-${this.interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji({ id: "1002197531335327805", })
				.setDisabled(pageCount == 0)
				.setCustomId(`BACK-${this.interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Secondary)
				.setDisabled(true)
				.setCustomId("pagecount")
				.setLabel(`Page: ${pageCount + 1}/${this.pages.length}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji({ id: "1002197525345865790", })
				.setCustomId(`NEXT-${this.interaction.user.id}`),
			new ButtonBuilder()
				.setStyle(ButtonStyle.Primary)
				.setEmoji({ id: "1002197529095577612", })
				.setCustomId(`LAST-${this.interaction.user.id}`)
		);

		this.pagingButtons = this.paginatorNavigation.components;
	}
}