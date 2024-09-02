import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { ButtonInteraction, TextChannel } from "discord.js";
import { getSauce } from "../../lib/Sauce";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Button,
})
export class SauceHandler extends InteractionHandler
{
	public override parse(interaction: ButtonInteraction)
	{
		if (!interaction.customId.includes("SAUCE")) return this.none();

		return this.some();
	}

	public override async run(interaction: ButtonInteraction)
	{
		const link = interaction.message.embeds[0].data.image.url;

		await getSauce({
			interaction,
			link,
			ephemeral: interaction.customId.split("-")[1] === "EPH" || !(interaction.channel as TextChannel).nsfw,
		});
	}
}