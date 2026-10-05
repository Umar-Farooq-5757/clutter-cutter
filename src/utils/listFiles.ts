import { readdir } from "fs/promises";
import path from "path";

const listFiles = async (directory: string = process.cwd()) => {
  const targetPath = path.resolve(process.cwd(), directory);
  const files = await readdir(targetPath, { withFileTypes: true });

  const onlyFiles = files.filter((file) => file.isFile());

  return onlyFiles.map((file) => ({
    name: file.name,
    path: path.join(targetPath, file.name),
    ext: path.extname(file.name).toLowerCase(),
  }));
};

export default listFiles;
