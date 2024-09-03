import { Subcommand, SubcommandOptions } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import { searchBooru } from "../../lib/Booru";
import { envParseArray } from "@skyra/env-utilities";
import { CommandOptionsRunTypeEnum } from "@sapphire/framework";
import { BooruSite } from "../../typings/Booru";

@ApplyOptions<SubcommandOptions>({
	description: "Search for content on booru image boards!",
	cooldownLimit: 1,
	cooldownDelay: 8000,
	cooldownFilteredUsers: envParseArray("ownerIds"),
	nsfw: true,
	runIn: CommandOptionsRunTypeEnum.GuildAny,
	subcommands: [
		{
			name: "gelbooru",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "rule34",
			chatInputRun: "subcommandDefault",
		},
		{
			name: "realbooru",
			chatInputRun: "subcommandDefault",
		}
	],
})
export class BooruCommand extends Subcommand
{
	public override registerApplicationCommands(registry: Subcommand.Registry)
	{
		registry.registerChatInputCommand(builder =>
			builder
				.setName(this.name)
				.setDescription(this.description)
				.setNSFW(true)
				.addSubcommand(command =>
					command
						.setName("gelbooru")
						.setDescription("Search for posts on the Gelbooru image board!")
						.addStringOption(option =>
							option
								.setAutocomplete(true)
								.setName("tags")
								.setDescription("Post tags, seperate the tags by space, exclude with dash, e.g: shinano_(azur_lane), -hat")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("rule34")
						.setDescription("You know what this is.")
						.addStringOption(option =>
							option
								.setAutocomplete(true)
								.setName("tags")
								.setDescription("Post tags, seperate the tags by space, exclude with dash, e.g: shinano_(azur_lane), -hat")
								.setRequired(true)
						)
				)
				.addSubcommand(command =>
					command
						.setName("realbooru")
						.setDescription("Search for medias on the Realbooru image board!")
						.addStringOption(option =>
							option
								.setAutocomplete(true)
								.setName("tags")
								.setDescription("Post tags, seperate the tags by space, exclude with dash, e.g: japanese -femboy")
								.setRequired(true)
						)
				)
		);
	}

	public async subcommandDefault(interaction: Subcommand.ChatInputCommandInteraction)
	{
		const site = interaction.options.getSubcommand() as BooruSite;

		const query: string[] = interaction.options
			.getString("tags")
			.split(" ")
			.map(tag => tag.trim());

		await searchBooru({ interaction, query, site, });
	}
}