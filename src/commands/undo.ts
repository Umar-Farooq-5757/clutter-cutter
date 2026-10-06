import chalk from "chalk";
import { access, readdir, rename, rm } from "fs/promises";
import path from "path";

const exists = async (filePath: string) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const undo = async (targetDir: string) => {
  try {
    const resolvedTarget = path.resolve(process.cwd(), targetDir);
    const entries = await readdir(resolvedTarget, { withFileTypes: true });
    const validCategories = [
      "images",
      "documents",
      "archives",
      "executables",
      "others",
    ];
    const categoryFolders = entries.filter(
      (entry) => entry.isDirectory() && validCategories.includes(entry.name),
    );

    if (categoryFolders.length === 0) {
      console.log(chalk.yellow("No category folders found to undo."));
      return;
    }

    for (const folder of categoryFolders) {
      const categoryFolderPath = path.join(resolvedTarget, folder.name);
      const categoryFiles = await readdir(categoryFolderPath, {
        withFileTypes: true,
      });

      for (const file of categoryFiles) {
        if (!file.isFile()) continue;
        const currentFilePath = path.join(categoryFolderPath, file.name);
        let originalFilePath = path.join(resolvedTarget, file.name);

        if (await exists(originalFilePath)) {
          const ext = path.extname(file.name);
          const nameWithoutExt = path.basename(file.name, ext);
          originalFilePath = path.join(
            resolvedTarget,
            `${nameWithoutExt}-restored${ext}`,
          );
        }

        await rename(currentFilePath, originalFilePath);
        console.log(
          chalk.green(`Restored: ${file.name} (from ${folder.name}/)`),
        );
      }
      await rm(categoryFolderPath, { recursive: true, force: true });
    }
    console.log(chalk.bold.green("Undo completed successfully!"));
  } catch (err) {
    console.log(chalk.red("Error during undo:", err));
  }
};

export default undo;
