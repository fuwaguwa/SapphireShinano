import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AutocompleteInteraction } from "discord.js";
import { gearSearch } from "../../lib/AzurLane";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AzurLaneGearAutocompleteHandler extends InteractionHandler
{
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>)
	{
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction)
	{
		if (interaction.commandName !== "azur-lane" || interaction.options.getSubcommand() !== "gear") return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name)
		{
			case "name":
			{
				const gearFiltered = await gearSearch(focusedOption.value.toLowerCase());

				if (gearFiltered.length == 0) return this.none();

				const responseArray = [];
				const maxItems = Math.min(gearFiltered.length, 10);
				for (let i = 0; i < maxItems;++i)
					responseArray.push({ name: gearFiltered[i].item.names.wiki, value: gearFiltered[i].item.names.wiki, });

				return this.some(responseArray);
			}

			default: return this.none();
		}
	}
}