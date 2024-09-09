import { Listener, LogLevel, type ChatInputCommandSuccessPayload } from "@sapphire/framework";
import type { Logger } from "@sapphire/plugin-logger";
import { logSuccessfulCommand } from "../../../lib/Utils";
import User from "../../../schemas/User";

export class ChatInputCommandSuccessListener extends Listener
{
	public override async run(payload: ChatInputCommandSuccessPayload)
	{
		logSuccessfulCommand(payload);

		let user = await User.findOne({ userId: payload.interaction.user.id, });

		if (!user)
		{
			user = await User.create({
				userId: payload.interaction.user.id,
				commandsExecuted: 0,
			});
		}

		await user.updateOne({ commandsExecuted: user.commandsExecuted + 1, });
	}

	public override onLoad() 
	{
		this.enabled = (this.container.logger as Logger).level <= LogLevel.Debug;
		return super.onLoad();
	}
}