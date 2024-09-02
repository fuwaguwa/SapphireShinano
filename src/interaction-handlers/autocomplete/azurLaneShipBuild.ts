import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AutocompleteInteraction } from "discord.js";
import { AL } from "../../commands/games/azur-lane";
import { Ship } from "@azurapi/azurapi/build/types/ship";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class AzurLaneShipBuildAutocompleteHandler extends InteractionHandler
{
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>)
	{
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction)
	{
		if (interaction.commandName !== "azur-lane" || !["ship", "build"].includes(interaction.options.getSubcommand())) return this.none();

		const focusedOption = interaction.options.getFocused(true);


		switch (focusedOption.name)
		{
			case "name":
			{
				let result = ((AL.ships.get(focusedOption.value) as Ship));
				if (!result) return this.none();

				return this.some([{ name: result.names.code, value: result.names.code, }]);
			}

			default: return this.none();
		}
	}
}