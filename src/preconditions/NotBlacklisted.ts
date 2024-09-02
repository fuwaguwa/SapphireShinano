import { Precondition, PreconditionOptions } from "@sapphire/framework";
import { ChatInputCommandInteraction } from "discord.js";
import User from "../schemas/User";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<PreconditionOptions>({
	position: 20,
})
export class NotBlacklistedPrecondition extends Precondition
{
	public override async chatInputRun(interaction: ChatInputCommandInteraction)
	{
		return await this.checkUser(interaction);
	}

	private async checkUser(interaction: ChatInputCommandInteraction)
	{
		let user = await User.findOne({ userId: interaction.user.id, });
		if (!user)
		{
			user = await User.create({
				userId: interaction.user.id,
				commandsExecuted: 0,
			});
		}

		return user.blacklisted ? this.error({ identifier: "blacklisted", }) : this.ok();
	}
}