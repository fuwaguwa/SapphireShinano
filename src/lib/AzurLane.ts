import Fuse from "fuse.js";
import { EmbedBuilder } from "discord.js";
import { toTitleCase } from "./Utils";
import { AzurAPI } from "@azurapi/azurapi";

const AL = new AzurAPI();

const allGears = [];
AL.equipments.forEach(gear => allGears.push(gear));

const searcher = new Fuse(allGears, {
	keys: ["names.en", "names.wiki"],
});

/**
 * Search for gear using fuzzy search
 * @param gearName gear name
 * @returns gear
 */
export async function gearSearch(gearName: string)
{
	return searcher.search(gearName);
}

/**
 * Format gear's stats
 * @param gearStats Stats of the gear
 * @param embed Stats embed
 */
export function gearStats(gearStats, embed: EmbedBuilder)
{
	for (let stat in gearStats)
	{
		let name: string;
		let st = gearStats[stat].formatted; // Stats of {name}

		if (!st) continue;

		switch (stat.toLowerCase())
		{
			case "rof":
				continue;
			case "antiair":
				name = "Anti-Air:";
				break;
			case "volleytime":
				name = "Volley Time:";
				break;
			case "rateoffire":
				name = "Fire Rate:";
				break;
			case "opsdamageboost":
				name = "OPS Damage Boost:";
				break;
			case "ammotype":
				name = "Ammo Type:";
				break;
			case "planehealth":
				name = "Health:";
				break;
			case "dodgelimit":
				name = "Dodge Limit:";
				break;
			case "crashdamage":
				name = "Crash Damage:";
				break;
			case "nooftorpedoes":
				name = "Torpedoes:";
				break;
			case "aaguns": {
				let guns: string[] = [];

				gearStats[stat].stats.forEach((unit) =>
				{
					guns.push(unit.formatted);
				});

				name = "AA Guns";
				st = guns.join("\n");

				break;
			}
			case "ordnance": {
				let ordnances: string[] = [];

				gearStats[stat].stats.forEach((unit) =>
				{
					ordnances.push(unit.formatted);
				});

				name = toTitleCase(stat) + ":";
				st = ordnances.join("\n");

				break;
			}
			default: {
				name = toTitleCase(stat) + ":";
				break;
			}
		}
		embed.addFields({ name, value: st, inline: true, });
	}
}

/**
 * Organize what type of ship can equip the gear
 * @param fits type of ships the gear is equippable on
 * @returns string[]
 */
export function gearFits(fits)
{
	const fitted: string[] = [];
	for (let ship in fits)
	{
		if (fits[ship])
		{
			const slot = toTitleCase(fits[ship]);
			switch (ship.toLowerCase())
			{
				case "destroyer":
					fitted.push(`Destroyer: ${slot}`);
					break;
				case "lightcruiser":
					fitted.push(`Light Cruiser: ${slot}`);
					break;
				case "heavycruiser":
					fitted.push(`Heavy Cruiser: ${slot}`);
					break;
				case "monitor":
					fitted.push(`Monitor: ${slot}`);
					break;
				case "largecruiser":
					fitted.push(`Large Cruiser: ${slot}`);
					break;
				case "battleship":
					fitted.push(`Battleship: ${slot}`);
					break;
				case "battlecruiser":
					fitted.push(`Battlecruiser: ${slot}`);
					break;
				case "aviationbattleship":
					fitted.push(`Aviation Battleship: ${slot}`);
					break;
				case "lightcarrier":
					fitted.push(`Light Carrier: ${slot}`);
					break;
				case "aircraftcarrier":
					fitted.push(`Aircraft Carrier: ${slot}`);
					break;
				case "repairship":
					fitted.push(`Repair Ship: ${slot}`);
					break;
				case "munitionship":
					fitted.push(`Munition Ship: ${slot}`);
					break;
				case "submarine":
					fitted.push(`Submarine: ${slot}`);
					break;
				case "submarinecarrier":
					fitted.push(`Submarine Carrier: ${slot}`);
					break;
			}
		}
	}

	return fitted;
}

/**
 * Get embed color for gear based on gear's tier
 * @param gear gear
 * @param tier gear's tier
 * @returns embed color
 */
export function gearColor(gear, tier: number)
{
	let color: any;
	if (gear.tiers[tier].rarity === "Normal") color = "#b0b7b8";
	if (gear.tiers[tier].rarity === "Rare") color = "#03dbfc";
	if (gear.tiers[tier].rarity === "Elite") color = "#ec18f0";
	if (gear.tiers[tier].rarity === "Super Rare") color = "#eff233";
	if (gear.tiers[tier].rarity === "Ultra Rare") color = "#000000";

	return color;
}