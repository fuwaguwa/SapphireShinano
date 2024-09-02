declare module "@sapphire/framework" {
	interface Preconditions {
		OwnerOnly: never;
		Voted: never;
		NotBlacklisted: never;
		InMainServer: never;
	}
}

export {};