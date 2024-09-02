import { Events, Listener } from "@sapphire/framework";
import {  Guild } from "discord.js";
import { updateServerCount } from "../../lib/Utils";

export class GuildDeleteListener extends Listener<typeof Events.GuildDelete>
{
	public override async run(guild: Guild)
	{
		const info = `[${guild.shard.id}] - Removed Guild - ${guild.name}: ${guild.id}`;
		this.container.logger.info(info);

		await updateServerCount();
	}
}