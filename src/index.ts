import {Command} from "commander";
import packageJson from "../package.json";
import ora from "ora";
import {access, constants, readFile} from "node:fs/promises";
import inquirer from "inquirer";
import validateConfig from "./utils/validateConfig";
import {execa} from "execa";

const program = new Command();
program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version)

program
    .command("create")
    .description("Start generating the admin panel")
    .option("-p --path <VALUE>", "Path to bdadmin config")
    .action(async ({ path }: { path: string }) => {
        const state = ora();
        try {
            if (!path) {
                state.fail("The path to the configuration is not specified")
                process.exit(1);
            }

            let config: any = {};

            if (/^https?:\/\//i.test(path)) {
                const response = await fetch(path);

                if (!response.ok) {
                    state.fail("Couldn't get the config")
                    process.exit(1);
                }
                config = await response.json();
            } else {
                if (!/\.json$/i.test(path)) {
                    state.fail("The path to the config is incorrect")
                    process.exit(1);
                }
                try {
                    await access(path, constants.F_OK);

                    const fileContent = await readFile(path, { encoding: "utf-8" });
                    config = JSON.parse(fileContent);
                } catch (error) {
                    state.fail("The configuration file was not found")
                    process.exit(1);
                }
            }

            const validationError = validateConfig(config);
            if (validationError) {
                state.fail(validationError)
                process.exit(1);
            }

            const answers = await inquirer.prompt<{name: string, languages: string[]}>([
                {
                    type: "input",
                    name: "name",
                    message: "Enter the name of your project",
                    default: "admin-panel"
                },
                {
                    type: "checkbox",
                    name: "languages",
                    message: "Select supported languages",
                    choices: ["Russian", "French", "Arabian", "Chinese"],
                }
            ]);

            try {
                await access(answers.name, constants.F_OK);
                state.fail(`The directory "${answers.name}" already exists.`);
                process.exit(1);
            } catch {}

            state.start("Start of admin panel generation");

            await execa("npx", ["create-vite@latest", answers.name, "--template", "react-swc-ts"], { env: {...process.env, CI: 'true'} })
            state.succeed("The admin panel has been successfully created");
        } catch (error) {
            state.fail("The admin panel could not be generated");
            process.exit(1);
        }
    })

program.parse(process.argv);