import {  Events, Listener, ListenerOptions } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { collectorsRefresh } from "../../../lib/Utils";
import { ChatInputCommandInteraction } from "discord.js";

@ApplyOptions<ListenerOptions>({
	event: "chatInputCommandRun",
})
export class CollectorRefreshListener extends Listener<typeof Events.ChatInputCommandRun>
{
	public override run(interaction: ChatInputCommandInteraction)
	{
		collectorsRefresh(interaction);
	}
}
