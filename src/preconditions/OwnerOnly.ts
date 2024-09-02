import { AllFlowsPrecondition } from "@sapphire/framework";
import type { CommandInteraction, ContextMenuCommandInteraction, Message } from "discord.js";
import { envParseArray } from "@skyra/env-utilities";

const owners = envParseArray("ownerIds");

export class OwnerOnlyPrecondition extends AllFlowsPrecondition
{
	public override async messageRun(message: Message)
	{
		return this.checkOwner(message.author.id);
	}

	public override async chatInputRun(interaction: CommandInteraction)
	{
		return this.checkOwner(interaction.user.id);
	}

	public override async contextMenuRun(interaction: ContextMenuCommandInteraction)
	{
		return this.checkOwner(interaction.user.id);
	}

	private async checkOwner(userId: string)
	{
		return owners.includes(userId)
			? this.ok()
			: this.error({ message: "ownerOnlyError", identifier: "ownerOnlyError", });
	}
}