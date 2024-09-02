import { InteractionHandler, InteractionHandlerOptions, InteractionHandlerTypes } from "@sapphire/framework";
import type { AutocompleteInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { transform } from "camaro";

@ApplyOptions<InteractionHandlerOptions>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete,
})
export class Rule34AutocompleteHandler extends InteractionHandler
{
	public override async run(interaction: AutocompleteInteraction, result: InteractionHandler.ParseResult<this>)
	{
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction)
	{
		if (interaction.commandName !== "booru" || interaction.options.getSubcommand() !== "rule34") return this.none();

		const focusedOption = interaction.options.getFocused(true);

		switch (focusedOption.name)
		{
			case "tags": {
				const searchArray: string[] = focusedOption.value.split(" ").map(tag => tag.trim());
				const searchArrayExLastTag: string[] = searchArray.length == 1 ? [] : searchArray.slice(0, searchArray.length - 1).map(tag => tag.trim());

				const response = await fetch(`https://api.rule34.xxx/index.php?page=dapi&s=tag&q=index&name_pattern=${searchArray[searchArray.length - 1]}%`);
				const xmlResponse = await response.text();
				const obj = await this.xmlTagsToObj(xmlResponse);
				const autocompleteArray = [{ name: focusedOption.name, value: focusedOption.value, }];

				if (obj.tags.length == 0) return this.some(autocompleteArray);

				const processedArray = obj.tags.reverse().slice(0, 10);
				const mappedTags = processedArray.map(tag => ({
					name: `${searchArrayExLastTag.join(" ")}${searchArray.length == 1 ? tag.name : ` ${tag.name}`}`,
					value: `${searchArrayExLastTag.join(" ")}${searchArray.length == 1 ? tag.name : ` ${tag.name}`}`,
				}));

				return this.some(mappedTags);
			}

			default: return this.none();
		}
	}

	public async xmlTagsToObj(xmlStr: string)
	{
		return await transform(xmlStr, {
			tags: [
				"/tags/tag",
				{
					name: "@name",
				}
			],
		});
	}
}