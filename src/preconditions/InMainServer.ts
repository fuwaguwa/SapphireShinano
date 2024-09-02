import { Precondition } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import { envParseArray } from "@skyra/env-utilities";

export class InMainServerCondition extends Precondition
{
	public override async chatInputRun(interaction: ChatInputCommandInteraction)
	{
		if (envParseArray("coolPeopleIds").includes(interaction.user.id)) return this.ok();
		return await this.checkMutualServer(interaction);
	}

	private async checkMutualServer(interaction: ChatInputCommandInteraction)
	{
		try
		{
			const guild = await this.container.client.guilds.fetch(
				process.env.guildId || "1020960562710052895"
			);
			await guild.members.fetch(interaction.user.id);

			return this.ok();
		}
		catch (error)
		{
			return this.error({ identifier: "inMainServerError", });
		}
	}
}