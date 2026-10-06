import listFiles from "../utils/listFiles.js";
import fileTypes from "../data/fileTypes.json" with { type: "json" };
import path from "path";
import { mkdir, rename } from "fs/promises";
import chalk from "chalk";
import ora from "ora";
import inquirer from "inquirer";
import treeify from "treeify";

interface FileTypes {
  [category: string]: string[];
}

const getCategory = (ext: string): string => {
  for (const [category, extensions] of Object.entries(fileTypes as FileTypes)) {
    if (extensions.includes(ext)) {
      return category;
    }
  }
  return "others";
};

const dryRun = async (
  files: { name: string; path: string; ext: string }[],
  resolvedPath: string,
) => {
  const rootFolder = path.basename(resolvedPath);
  // console.log(files);
  // console.log("resultant folder structure: \n\n\n");
  const folderStructure: Record<string, any> = {
    [chalk.blue.bold(rootFolder)]: {},
  };
  files.forEach((file) => {
    const category = getCategory(file.ext);
    const rootKey = Object.keys(folderStructure)[0];

    if (!folderStructure[rootKey][chalk.magenta(category)]) {
      folderStructure[rootKey][chalk.magenta(category)] = {};
    }
    folderStructure[rootKey][chalk.magenta(category)][file.name] = "";
  });

  console.log(treeify.asTree(folderStructure, false, false));
};

const organize = async (targetDir: string, options: any) => {
  const resolvedPath = path.resolve(process.cwd(), targetDir);

  //   console.log(options);
  const files = await listFiles(resolvedPath);
  if (files.length === 0) {
    console.log("No files found to organize.");
    return;
  }

  if (options.dryRun) {
    dryRun(files, resolvedPath);
    return;
  }

  // confirm from the user before organizing files into different categories
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

  const spinner = ora({
    text: "Organizing files...",
    spinner: "aesthetic",
    color: "magenta",
  }).start();
  let successCount = 0;
  let errorCount = 0;

  for (const file of files) {
    const category = getCategory(file.ext);
    const categoryFolderPath = path.join(resolvedPath, category);
    const fileDestinationPath = path.join(categoryFolderPath, file.name);

    try {
      await mkdir(categoryFolderPath, { recursive: true });
      // cut file and paste it in the folder of its category
      await rename(file.path, fileDestinationPath);
      successCount++;
    } catch (err) {
      errorCount++;
      console.error(chalk.red(`Failed to move ${file.name}: ${err}`));
    }
  }
  if (errorCount > 0) {
    spinner.warn(
      `Some errors occured. Moved: ${successCount}, Failed: ${errorCount}`,
    );
  } else {
    spinner.succeed(`Successfully organized all ${successCount} files`);
  }
};

export default organize;
