import { readdir } from "fs/promises";
import path from "path";

const listFiles = async () => {
  const files = await readdir(process.cwd(), {
    withFileTypes: true,
  });
  const formatted = files.map((file) => ({
    name: file.name,
    path: path.join(file.parentPath || process.cwd(), file.name),
  }));
  return formatted;
};

export default listFiles;
