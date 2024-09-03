import type { ArrayString } from "@skyra/env-utilities";

declare module "@skyra/env-utilities"
{
	interface Env
	{
		ownerIds: ArrayString;
		coolPeopleIds: ArrayString;
		botToken: string;
		guildId: string;
		mongoDB: string;
		rapidApiKey: string;
		saucenaoApiKey: string;
		malClientId: string;
		discordServicesApiKey: string;
		topggApiKey: string;
		gelbooruApiKey: string;
		gelbooruUserId: string;
	}
}

export {};