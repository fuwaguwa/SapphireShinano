import { Listener, LogLevel } from "@sapphire/framework";
import {
	ChatInputCommandSubcommandMappingMethod,
	ChatInputSubcommandSuccessPayload,
	SubcommandPluginEvents
} from "@sapphire/plugin-subcommands";
import { logSuccessfulCommand } from "../../../lib/Utils";
import type { Logger } from "@sapphire/plugin-logger";
import { Interaction } from "discord.js";

export class ChatInputSubcommandSuccessListener extends Listener<typeof SubcommandPluginEvents.ChatInputSubcommandSuccess>
{
	public override run(interaction: Interaction, subcommand: ChatInputCommandSubcommandMappingMethod, payload: ChatInputSubcommandSuccessPayload)
	{
		logSuccessfulCommand(payload, subcommand);
	}

	public override onLoad()
	{
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}
}