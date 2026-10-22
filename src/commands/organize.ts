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

const spooky = {
  accent: chalk.hex("#ff7518"),
  ghost: chalk.hex("#e6e6fa"),
  toxic: chalk.hex("#39ff14"),
  blood: chalk.hex("#dc143c"),
  dim: chalk.hex("#4a4a4a"),
  bold: chalk.bold,
};

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
  isSpooky: boolean,
) => {
  const rootFolder = path.basename(resolvedPath);
  const folderStructure: Record<string, any> = {
    [isSpooky ? spooky.accent.bold(rootFolder) : chalk.blue.bold(rootFolder)]:
      {},
  };

  files.forEach((file) => {
    const category = getCategory(file.ext, categories);
    const rootKey = Object.keys(folderStructure)[0];
    const catKey = isSpooky ? spooky.ghost(category) : chalk.magenta(category);

    if (!folderStructure[rootKey][catKey]) {
      folderStructure[rootKey][catKey] = {};
    }
    folderStructure[rootKey][catKey][file.name] = "";
  });

  if (isSpooky) {
    console.log(spooky.accent("\n--- THE HAUNTED MANIFEST (Dry Run) ---\n"));
  }
  console.log(treeify.asTree(folderStructure, false, false));
  if (isSpooky) {
    console.log(
      spooky.dim("\n[ No files were physically harmed in this séance ]\n"),
    );
  }
};

const organizeFiles = async (
  files: { name: string; path: string; ext: string }[],
  resolvedPath: string,
  categories: Record<string, string[]>,
  isSpooky: boolean,
) => {
  const spinner = ora({
    text: isSpooky
      ? spooky.ghost("Gazing into the crystal ball... organizing files...")
      : "Organizing files...",
    spinner: isSpooky ? "moon" : "aesthetic",
    color: isSpooky ? "magenta" : "magenta",
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
      if (isSpooky) {
        console.error(
          spooky.blood(
            `Curse of the File System! Failed to snatch ${file.name}: ${err}`,
          ),
        );
      } else {
        console.error(chalk.red(`Failed to move ${file.name}: ${err}`));
      }
    }
  }
  if (errorCount > 0) {
    spinner.warn(
      `Some errors occurred. Moved: ${successCount}, Failed: ${errorCount}`,
    );
  } else {
    if (isSpooky) {
      spinner.succeed(
        spooky.toxic(
          `The spirits are pleased. Successfully banished ${successCount} files into the shadows!`,
        ),
      );
    } else {
      spinner.succeed(`Successfully organized all ${successCount} files`);
    }
  }
};

const organize = async (targetDir: string, options: any) => {
  const resolvedPath = path.resolve(process.cwd(), targetDir);
  const config = await loadConfig(resolvedPath);
  const isSpooky = !!options.spooky;

  /**
   * Watch mode
   */
  if (options.watch) {
    if (isSpooky) {
      console.log(
        spooky.accent.bold(
          `3AM HAUNTED WATCH ACTIVE: Monitoring "${resolvedPath}"`,
        ),
      );
      console.log(
        spooky.dim(
          "The all-seeing eye is watching for fresh sacrifices... Press Ctrl+C to flee.\n",
        ),
      );
    } else {
      console.log(
        chalk.cyan.bold(`Watch mode active! Monitoring: ${resolvedPath}`),
      );
      console.log(
        chalk.gray(
          "New files will be organized automatically. Press Ctrl+C to exit.\n",
        ),
      );
    }

    chokidar
      .watch(resolvedPath, {
        ignored: /(^|[/\\])\../,
        depth: 0,
        ignoreInitial: true,
      })
      .on("add", async (filePath) => {
        const fileName = path.basename(filePath);
        const ext = path.extname(fileName).toLowerCase();

        if (
          config.ignore.includes(fileName) ||
          fileName === ".clutterrc.json"
        ) {
          return;
        }

        setTimeout(async () => {
          try {
            const category = getCategory(ext, config.categories);
            const categoryFolderPath = path.join(resolvedPath, category);
            const destinationPath = path.join(categoryFolderPath, fileName);

            await mkdir(categoryFolderPath, { recursive: true });
            await rename(filePath, destinationPath);

            if (isSpooky) {
              console.log(
                spooky.toxic(`Spirit summoned: ${fileName}`) +
                  spooky.dim(` -> ${category}/`),
              );
            } else {
              console.log(
                chalk.green(`Auto-organized: ${fileName}`) +
                  chalk.gray(` -> ${category}/`),
              );
            }
          } catch (err) {
            console.error(chalk.red(`Failed to organize ${fileName}:`, err));
          }
        }, 500);
      });
    return;
  }

  const allFiles = await listFiles(resolvedPath);

  const files = allFiles.filter(
    (file) =>
      !config.ignore.includes(file.name) &&
      !file.name.startsWith(".") &&
      file.name !== ".clutterrc.json",
  );

  if (files.length === 0) {
    console.log(
      isSpooky
        ? spooky.ghost("The crypt is empty. No files found to organize.")
        : "No files found to organize.",
    );
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
      message: isSpooky
        ? "Select your ritual sacrifices:"
        : "Select the files you want to organize:",
      choices,
    });
    const filesToOrganize = files.filter((file) =>
      selectedFiles.includes(file.name),
    );

    if (filesToOrganize.length === 0) {
      console.log("No files selected to organize.");
      return;
    }

    await organizeFiles(
      filesToOrganize,
      resolvedPath,
      config.categories,
      isSpooky,
    );
    return;
  }

  /**
   * Dry run
   */
  if (options.dryRun) {
    await dryRun(files, resolvedPath, config.categories, isSpooky);
    return;
  }

  // Confirm before organizing
  const { proceed } = await inquirer.prompt([
    {
      type: "confirm",
      name: "proceed",
      message: isSpooky
        ? spooky.accent(
            `Do you dare to unleash the ritual on "${resolvedPath}"?`,
          )
        : `Are you sure you want to organize all the files in "${chalk.cyan.bold(resolvedPath)}"`,
    },
  ]);

  if (!proceed) {
    console.log(
      isSpooky
        ? spooky.dim("Ritual aborted. The files remain undisturbed.")
        : "Cancelled organizing files",
    );
    return;
  }

  if (!isSpooky) {
    console.log(chalk.cyan.bold("Organizing: ", resolvedPath));
  }

  await organizeFiles(files, resolvedPath, config.categories, isSpooky);
};

export default organize;