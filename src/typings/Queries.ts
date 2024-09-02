import { LewdInteractionMode, SearchableLewdInteraction } from "./Booru";
import { ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";

export type PrivateCollectionCategory =
	"genshin" | "kemonomimi" | "shipgirls" | "undies" | "uniform" | "honkai" | "random" | "animation"
export type PrivateCollectionFileFormat = "image" | "gif" | "mp4" | "animation" | "random" | "video"

export interface PrivateCollectionGetFromOption
{
	interaction: SearchableLewdInteraction;
	embed: EmbedBuilder;
	category: Omit<PrivateCollectionCategory, "animation">;
	mode?: LewdInteractionMode;
}

export interface PrivateCollectionQueryOptions
{
	category?: PrivateCollectionCategory;
	format?: PrivateCollectionFileFormat;
	size?: number;
	fanbox?: boolean;
}

export interface AnimationQueryOptions
{
	interaction: SearchableLewdInteraction;
	category: Omit<PrivateCollectionCategory, "animation">;
	buttons: ActionRowBuilder<ButtonBuilder>
	mode?: LewdInteractionMode
}

export interface AnimationGetFromOptions
{
	interaction: SearchableLewdInteraction;
	format?: PrivateCollectionFileFormat;
	category: Omit<PrivateCollectionCategory, "animation">;
	mode?: LewdInteractionMode;
}