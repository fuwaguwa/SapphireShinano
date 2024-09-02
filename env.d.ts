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
		amagiApiKey: string;
		rapidApiKey: string;
		deepAIApiKey: string;
		saucenaoApiKey: string;
		malClientId: string;
		discordServicesApiKey: string;
		topggApiKey: string;
		twitterApiKey: string;
		twitterApiKeySecret: string;
		twitterBearerToken: string;
		twitterAccessToken: string;
		twitterAccessTokenSecret: string;
		nhentaiIP: string;
		topggWebhook: string;
		amagiApi: string;
		gelbooruApiKey: string;
		gelbooruUserId: string;
	}
}

export {};