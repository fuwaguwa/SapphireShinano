import { ButtonInteraction } from "discord.js";
import { Command } from "@sapphire/framework";
import { Subcommand } from "@sapphire/plugin-subcommands";

export type LewdInteractionMode = "followUp" | undefined
export type SearchableLewdInteraction = Command.ChatInputCommandInteraction | Subcommand.ChatInputCommandInteraction | ButtonInteraction
export type BooruSite = "realbooru" | "gelbooru" | "rule34" | "safebooru"
export interface BooruSearchOptions
{
	interaction: SearchableLewdInteraction;
	query: string[]
	site: string,
	mode?: LewdInteractionMode
}