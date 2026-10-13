import listFiles from "../utils/listFiles.js";
import path from "path";
import { mkdir, rename } from "fs/promises";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import treeify from "treeify";
import chokidar from "chokidar";
import { checkbox } from "@inquirer/prompts";
import loadConfig from "../utils/loadConfig.js";

const getCategory = (
  ext: string,
  categories: Record<string, string[]>,
): string => {
  for (const [category, extensions] of Object.entries(categories)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return "others";
};

const dryRun = async (
  files: { name: string; path: string; ext: string }[],
  resolvedPath: string,
  categories: Record<string, string[]>,
) => {
  const rootFolder = path.basename(resolvedPath);
  const folderStructure: Record<string, any> = {
    [chalk.blue.bold(rootFolder)]: {},
  };

  files.forEach((file) => {
    const category = getCategory(file.ext, categories);
    const rootKey = Object.keys(folderStructure)[0];

    if (!folderStructure[rootKey][chalk.magenta(category)]) {
      folderStructure[rootKey][chalk.magenta(category)] = {};
    }
    folderStructure[rootKey][chalk.magenta(category)][file.name] = "";
  });

  console.log(treeify.asTree(folderStructure, false, false));
};

const organizeFiles = async (
  files: { name: string; path: string; ext: string }[],
  resolvedPath: string,
  categories: Record<string, string[]>,
) => {
  const spinner = ora({
    text: "Organizing files...",
    spinner: "aesthetic",
    color: "magenta",
  }).start();
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const category = getCategory(file.ext, categories);
    const categoryFolderPath = path.join(resolvedPath, category);
    const fileDestinationPath = path.join(categoryFolderPath, file.name);

    try {
      await mkdir(categoryFolderPath, { recursive: true });
      await rename(file.path, fileDestinationPath);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(chalk.red(`Failed to move ${file.name}: ${err}`));
    }
  }

  if (errorCount > 0) {
    spinner.warn(
      `Some errors occurred. Moved: ${successCount}, Failed: ${errorCount}`,
    );
  } else {
    spinner.succeed(`Successfully organized all ${successCount} files`);
  }
};

const organize = async (targetDir: string, options: any) => {
  const resolvedPath = path.resolve(process.cwd(), targetDir);
  const config = await loadConfig(resolvedPath);

  /**
   * Watch mode
   */
  if (options.watch) {
    console.log(
      chalk.cyan.bold(`Watch mode active! Monitoring: ${resolvedPath}`),
    );
    console.log(
      chalk.gray(
        "New files will be organized automatically. Press Ctrl+C to exit.\n",
      ),
    );

    chokidar
      .watch(resolvedPath, {
        ignored: /(^|[/\\])\../, // Ignore dotfiles
        depth: 0,
        ignoreInitial: true,
      })
      .on("add", async (filePath) => {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        // Check if file is ignored by .clutterrc.json
        if (config.ignore.includes(fileName) || fileName === ".clutterrc.json") {
          return;
        }

        setTimeout(async () => {
          try {
            const category = getCategory(ext, config.categories);
            const categoryFolderPath = path.join(resolvedPath, category);
            const destinationPath = path.join(categoryFolderPath, fileName);

            await mkdir(categoryFolderPath, { recursive: true });
            await rename(filePath, destinationPath);

            console.log(
              chalk.green(`Auto-organized: ${fileName}`) +
                chalk.gray(` -> ${category}/`),
            );
          } catch (err) {
            console.error(chalk.red(`Failed to organize ${fileName}:`, err));
          }
        }, 500);
      });
    return;
  }

  const allFiles = await listFiles(resolvedPath);

  // Filter out ignored files and dotfiles/clutterrc
  const files = allFiles.filter(
    (file) =>
      !config.ignore.includes(file.name) &&
      !file.name.startsWith(".") &&
      file.name !== ".clutterrc.json",
  );

  if (files.length === 0) {
    console.log("No files found to organize.");
    return;
  }

  /**
   * Interactive mode
   */
  if (options.interactive) {
    const choices = files.map((file) => ({
      name: file.name,
      value: file.name,
    }));
    const selectedFiles = await checkbox({
      message: "Select the files you want to organize:",
      choices,
    });
    const filesToOrganize = files.filter((file) =>
      selectedFiles.includes(file.name),
    );

    if (filesToOrganize.length === 0) {
      console.log("No files selected to organize.");
      return;
    }

    await organizeFiles(filesToOrganize, resolvedPath, config.categories);
    return;
  }

  /**
   * Dry run
   */
  if (options.dryRun) {
    await dryRun(files, resolvedPath, config.categories);
    return;
  }

  // Confirm from the user before organizing files
  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: `Are you sure you want to organize all the files in "${chalk.cyan.bold(resolvedPath)}"`,
    },
  ]);

  if (!proceed) {
    console.log("Cancelled organizing files");
    return;
  }

  console.log(chalk.cyan.bold("Organizing: ", resolvedPath));
  await organizeFiles(files, resolvedPath, config.categories);
};

export default organize;