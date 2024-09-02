import { Subcommand } from "@sapphire/plugin-subcommands";
import { ButtonInteraction } from "discord.js";
import { Command } from "@sapphire/framework";

export interface SauceOptions
{
	interaction: Command.ChatInputCommandInteraction | Subcommand.ChatInputCommandInteraction | ButtonInteraction;
	link: string;
	ephemeral: boolean
}