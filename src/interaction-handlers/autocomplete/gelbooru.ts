import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class GelbooruAutocompleteHandler extends InteractionHandler
{
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>) 
	{
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction) 
	{
		if (interaction.commandName !== "booru" || interaction.options.getSubcommand() !== "gelbooru") return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name)
		{
			case "tags": {
				const searchArray: string[] = focusedOption.value.split(" ").map(tag => tag.trim());
				const searchArrayExLastTag: string[] = searchArray.length == 1 ? [] : searchArray.slice(0, searchArray.length - 1).map(tag => tag.trim());

				const response = await fetch(`https://gelbooru.com/index.php?page=dapi&s=tag&q=index&json=1&name_pattern=${searchArray[searchArray.length - 1]}%&api_key=${process.env.gelbooruApiKey}&user_id=${process.env.gelbooruUserId}&limit=10`);
				const jsonResponse = await response.json();
				const autocompleteArray = [{ name: focusedOption.name, value: focusedOption.value, }];

				if (!jsonResponse.tag) return this.some(autocompleteArray);

				const mappedTags = jsonResponse.tag.map(tag => ({
					name: `${searchArrayExLastTag.join(" ")}${searchArray.length == 1 ? tag.name : ` ${tag.name}`}`,
					value: `${searchArrayExLastTag.join(" ")}${searchArray.length == 1 ? tag.name : ` ${tag.name}`}`,
				}));

				return this.some(mappedTags);
			}

			default: return this.none();
		}
	}
}