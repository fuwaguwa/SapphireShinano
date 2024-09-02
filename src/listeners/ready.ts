import { ApplyOptions } from "@sapphire/decorators";
import { Listener, ListenerOptions } from "@sapphire/framework";
import { ActivityType } from "discord.js";
import { updateServerCount } from "../lib/Utils";
import { AzurLaneNews } from "../structures/AzurLaneNews";
import { ShinanoAutoLewd } from "../structures/Auto";

@ApplyOptions<ListenerOptions>({ once: true, })
export class ReadyEvent extends Listener
{
	public override async run()
	{
		this.container.logger.info("Shinano is ready!");
		await updateServerCount();

		/**
		 * Updating Presence
		 */
		const activitiesList= [
			{
				type: ActivityType.Playing,
				message: "with Laffey",
			},
			{
				type: ActivityType.Playing,
				message: "Azur Lane",
			},
			{
				type: ActivityType.Playing,
				message: "with a supercar",
			},
			{
				type: ActivityType.Watching,
				message: "over the fox sisters.",
			},
			{
				type: ActivityType.Watching,
				message: "the shikikan.",
			},
			{
				type: ActivityType.Listening,
				message: "Sandy's singing.",
			},
			{
				type: ActivityType.Listening,
				message: "Feelin' It All",
			},
			{
				type: ActivityType.Custom,
				message: "Begging shikikan for her swimsu-",
			},
			{
				type: ActivityType.Custom,
				message: "Trying for Little Shinano 2",
			}
		];

		const setPresence = () =>
		{
			const presence =
				activitiesList[Math.floor(Math.random() * activitiesList.length)];

			this.container.client.user.setActivity({ name: presence.message, type: presence.type, });
		};
		setPresence();
		setInterval(setPresence, 30000);

		const news = new AzurLaneNews();
		await news.startFetchingTweets();

		const lewd = new ShinanoAutoLewd();
		await lewd.startLewdPosting();
	}
}