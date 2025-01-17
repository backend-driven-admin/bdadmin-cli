import { Command } from "commander";
import packageJson from "../package.json";
import ora from "ora";
import { access, constants, readFile, rm } from "node:fs/promises";
import inquirer from "inquirer";
import validateConfig from "./utils/validateConfig";
import { execa } from "execa";
import checkDirectoryExists from "./utils/checkDirectoryExists";

const program = new Command();
program
	.name(packageJson.name)
	.description(packageJson.description)
	.version(packageJson.version);

program
	.command("create")
	.description("Start generating the admin panel")
	.requiredOption("-p --path <VALUE>", "Path to bdadmin config")
	.requiredOption("-u --url <VALUE>", "Api url")
	.action(async ({ path }: { path: string }) => {
		const state = ora();
		try {
			if (!path) {
				state.fail("The path to the configuration is not specified");
				process.exit(1);
			}

			let config: any = {};

			if (/^https?:\/\//i.test(path)) {
				const response = await fetch(path);

				if (!response.ok) {
					state.fail("Couldn't get the config");
					process.exit(1);
				}
				config = await response.json();
			} else {
				if (!/\.json$/i.test(path)) {
					state.fail("The path to the config is incorrect");
					process.exit(1);
				}
				try {
					await access(path, constants.F_OK);

					const fileContent = await readFile(path, { encoding: "utf-8" });
					config = JSON.parse(fileContent);
				} catch (error) {
					state.fail("The configuration file was not found");
					process.exit(1);
				}
			}

			const validationError = validateConfig(config);
			if (validationError) {
				state.fail(validationError);
				process.exit(1);
			}

			let projectName = "admin-panel";
			let shouldOverwrite = false;
			async function promptAndCheckProjectName() {
				projectName = await promptProjectName();
				const exists = await checkDirectoryExists(projectName);

				if (exists) {
					const operation = await promptOverrideOrCancel(projectName);
					if (operation === "back") await promptAndCheckProjectName();
					else shouldOverwrite = true;
				}
			}
			await promptAndCheckProjectName();

			const answers = await inquirer.prompt<{ languages: string[] }>([
				{
					type: "checkbox",
					name: "languages",
					message: "Select supported languages",
					choices: ["Russian", "French", "Arabian", "Chinese"],
				},
			]);

			state.start("Start of admin panel generation");

			if (shouldOverwrite)
				await rm(projectName, { recursive: true, force: true });
			await execa(
				"npx",
				["create-vite@latest", projectName, "--template", "react-swc-ts"],
				{ env: { ...process.env, CI: "true" } },
			);

			state.succeed("The admin panel has been successfully created");
		} catch (error) {
			state.fail("The admin panel could not be generated");
			process.exit(1);
		}
	});

async function promptProjectName(): Promise<string> {
	const { name } = await inquirer.prompt<{ name: string }>([
		{
			type: "input",
			name: "name",
			message: "Enter the name of your project",
			default: "admin-panel",
		},
	]);
	return name;
}

async function promptOverrideOrCancel(
	projectName: string,
): Promise<"overwrite" | "back"> {
	const { action } = await inquirer.prompt<{ action: "overwrite" | "back" }>([
		{
			type: "list", // или radio аналог в inquirer
			name: "action",
			message: `The directory "${projectName}" already exists. What do you want to do?`,
			choices: [
				{ name: "Back", value: "back" },
				{ name: "Overwrite the path", value: "overwrite" },
			],
		},
	]);
	return action;
}

program.parse(process.argv);
