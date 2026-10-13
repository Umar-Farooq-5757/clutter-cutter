import path from "path";
import defaultFileTypes from "../data/fileTypes.json" with { type: "json" };
import { readFile } from "fs/promises";

interface Config {
  categories: Record<string, string[]>;
  ignore: string[];
}

const loadConfig = async (targetDir: string): Promise<Config> => {
  const configPath = path.join(targetDir, ".clutterrc.json");

  try {
    const rawData = await readFile(configPath, "utf-8");
    const userConfig = JSON.parse(rawData);

    return {
      categories: userConfig.categories || defaultFileTypes,
      ignore: userConfig.ignore || [".DS_Store", "Thumbs.db"],
    };
  } catch {
    return {
      categories: defaultFileTypes as Record<string, string[]>,
      ignore: [".DS_Store", "Thumbs.db"],
    };
  }
};

export default loadConfig;
