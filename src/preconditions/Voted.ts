import {  Precondition } from "@sapphire/framework";
import { ChatInputCommandInteraction, CommandInteraction } from "discord.js";
import User from "../schemas/User";
import { envParseArray } from "@skyra/env-utilities";

export class VotedPrecondition extends Precondition
{
	public override async chatInputRun(interaction: ChatInputCommandInteraction)
	{
		if (envParseArray("coolPeopleIds").includes(interaction.user.id)) return this.ok();
		return await this.checkVote(interaction);
	}

	private async checkVote(interaction: CommandInteraction)
	{
		const user = await User.findOne({ userId: interaction.user.id, });

		if (!user?.lastVoteTimestamp)
		{
			return this.error({ message: "noVote", identifier: "votedError", });
		}
		else if (Math.floor(Date.now() / 1000) - user.lastVoteTimestamp <= 43200)
		{
			return this.ok();
		}
		else
		{
			return this.error({ message: `expiredVote-${user.lastVoteTimestamp}`, identifier: "votedError", });
		}
	}
}