import { Subcommand } from "@sapphire/plugin-subcommands";

export interface ImageSendOptions
{
	interaction: Subcommand.ChatInputCommandInteraction;
	link?: string;
	image?: Buffer
}