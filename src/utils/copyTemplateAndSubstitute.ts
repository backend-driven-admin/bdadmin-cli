import { join } from "node:path";
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";

export async function copyTemplateAndSubstitute(
	templateDir: string,
	destDir: string,
	projectName: string,
): Promise<void> {
	await mkdir(destDir, { recursive: true });
	const items = await readdir(templateDir, { withFileTypes: true });

	for (const item of items) {
		const srcPath = join(templateDir, item.name);
		const destPath = join(destDir, item.name);

		if (item.isDirectory()) {
			await copyTemplateAndSubstitute(srcPath, destPath, projectName);
		} else if (item.isFile()) {
			let content = await readFile(srcPath, "utf-8");

			if (item.name === "package.json" || item.name === "package-lock.json") {
				const json = JSON.parse(content);
				json.name = projectName;
				content = JSON.stringify(json, null, 2);
			} else if (item.name === "index.html") {
				content = content.replace(
					/<title>.*<\/title>/i,
					`<title>${projectName}</title>`,
				);
			}

			await writeFile(destPath, content, "utf-8");
		}
	}
}
