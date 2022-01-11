import fse from "fs-extra";
import path from "path";

export function loadTasks(taskDir: string) {
  const files = fse.readdirSync(taskDir);
  files.forEach(file => {
    const absPath = path.join(taskDir, file);
    require(absPath);
  });
}
