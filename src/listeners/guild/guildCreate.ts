import { Events, Listener } from "@sapphire/framework";
import { Guild } from "discord.js";
import { updateServerCount } from "../../lib/Utils";

export class GuildCreateListener extends Listener<typeof Events.GuildCreate>
{
	public override async run(guild: Guild)
	{
		await guild
			.fetchAuditLogs({
				type: 28,
				limit: 1,
			})
			.then (async (log) =>
			{
				const adder = log.entries.first().executor;

				const info = `[${guild.shard.id}] - New Guild - ${guild.name}: ${guild.id} - ${adder.username}: ${adder.id}`;
				this.container.logger.info(info);

				await updateServerCount();
			});
	}
}