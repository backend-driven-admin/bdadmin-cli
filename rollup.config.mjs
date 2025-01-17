import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { defineConfig } from "rollup";
import terser from "@rollup/plugin-terser";
import json from "@rollup/plugin-json";

const packageJson = require("./package.json");

export default defineConfig([
	{
		input: "src/index.ts",
		output: {
			file: packageJson.main,
			format: "cjs",
			banner: "#!/usr/bin/env node",
		},
		plugins: [json(), resolve(), commonjs(), typescript(), terser()],
	},
]);
