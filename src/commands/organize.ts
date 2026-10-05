import listFiles from "../utils/listFiles.js";
import fileTypes from "../data/fileTypes.json" with { type: "json" };
import path from "path";
import { mkdir, rename } from "fs/promises";

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

const organize = async (targetDir: string, options: any) => {
  const resolvedPath = path.resolve(process.cwd(), targetDir);
  console.log("organizing path: ", resolvedPath);
  //   console.log(options);
  //   fileTypes;
  const files = await listFiles(resolvedPath);
  if (files.length === 0) {
    console.log("No files found to organize.");
    return;
  }

  for (const file of files) {
    const category = getCategory(file.ext);
    const categoryFolderPath = path.join(resolvedPath, category);
    const fileDestinationPath = path.join(categoryFolderPath, file.name);

    try {
      await mkdir(categoryFolderPath, { recursive: true });
      // cut file and paste it in the folder of its category
      await rename(file.path, fileDestinationPath);
    } catch (err) {
      console.error("Error: ", err);
    }
  }
};

export default organize;
