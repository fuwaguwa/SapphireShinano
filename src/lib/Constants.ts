import { join } from "path";
import { Collection, InteractionCollector } from "discord.js";

export const rootDir = join(__dirname, "..", "..");
export const srcDir = join(rootDir, "src");
export const sauceEmojis = {
	Pixiv: "<:pixiv:1003211984747118642>",
	Twitter: "<:twitter:1003211986697453680>",
	Danbooru: "<:danbooru:1003212182156230686>",
	Gelbooru: "<:gelbooru:1003211988916252682>",
	"Yande.re": "🔪",
	Konachan: "⭐",
	Fantia: "<:fantia:1003211990673670194>",
	AniDB: "<:anidb:1003211992410107924>",
};
export const buttonCooldown: Collection<string, number> = new Collection();
export const ownerId = "836215956346634270";
export const collectors: Collection<string, InteractionCollector<any>> = new Collection();
export const pageCollectors: Collection<string, InteractionCollector<any>> = new Collection();