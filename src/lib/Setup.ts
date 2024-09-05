import { srcDir } from "./Constants";

import {
	ApplicationCommandRegistries,
	RegisterBehavior
} from "@sapphire/framework";
import "@sapphire/plugin-editable-commands/register";
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";
import * as colorette from "colorette";
import { setup } from "@skyra/env-utilities";
import { join } from "path";

ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(
	RegisterBehavior.BulkOverwrite
);

setup({ path: join(srcDir, ".env"), });

colorette.createColors({ useColor: true, });