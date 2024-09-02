import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { AutocompleteInteraction } from "discord.js";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class HanimeAutocompleteHandler extends InteractionHandler
{
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>)
	{
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction)
	{
		if (interaction.commandName !== "hanime") return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name)
		{
			case "name":
			{
				const malSearch = await fetch(`https://api.jikan.moe/v4/anime?q=${focusedOption.value}&limit=15&rating=rx`,
					{
						method: "GET",
						headers: {
							"X-MAL-CLIENT-ID": process.env.malClientId,
						},
					});
				const result = await malSearch.json();
				if (result.data.length == 0) return this.none();

				return this.some(result.data.map(res => ({ name: res.title, value: (res.mal_id as number).toString(), })));
			}

			default: return this.none();
		}
	}
}