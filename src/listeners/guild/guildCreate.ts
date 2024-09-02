import { Events, Listener } from "@sapphire/framework";
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Guild, TextChannel } from "discord.js";
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

		/**
		 * Join message
		 */
		guild.channels.cache.some(async (channel) =>
		{
			if (
				channel.name.includes("general") ||
				channel.name.includes("lobby") ||
				channel.name.includes("chat")
			) 
			{
				const helloEmbed: EmbedBuilder = new EmbedBuilder()
					.setColor("#2b2d31")
					.setDescription(
						"I am Shinano, a multi-purpose Discord bot designed to serve shikikans all over the world. " +
						"Whether it is providing information about shipfus, query information in Genshin, or to entertain you, I can do it all while being half-asleep...zzz\n\n" +
						"You can learn more about what I can do by using <placeholder>. If you're experiencing any trouble with the bot, please join the support server down below!"
					)
					.setThumbnail(
						"https://cdn.discordapp.com/avatars/1002193298229829682/14d86d9092130bb9b6dfc49af0a110b2.webp?size=1024"
					);
				const supportServer: ActionRowBuilder<ButtonBuilder> =
					new ActionRowBuilder<ButtonBuilder>().addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setURL("https://discord.gg/NFkMxFeEWr")
							.setLabel("Support Server")
							.setEmoji({ name: "⚙️", }),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setURL("https://top.gg/bot/1002193298229829682")
							.setLabel("Top.gg")
							.setEmoji({ id: "1002849574517477447", })
					);

				await (channel as TextChannel).send({
					embeds: [helloEmbed],
					components: [supportServer],
				});
				return true;
			}

			return false;
		});
	}
}