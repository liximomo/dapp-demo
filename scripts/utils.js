const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const fsReaddir = promisify(fs.readdir);
const fsStat = promisify(fs.stat);

const ROOT_DIR = path.resolve(__dirname, "..");

function runTest(test, v) {
  if (typeof test === "function") {
    return test(v);
  }

  return test.test(v);
}

function resolveRoot(...paths) {
  return path.resolve(ROOT_DIR, ...paths);
}

async function recursiveReadDir(dir, { filter, ignore, rootDir = dir } = {}) {
  async function recursiveReadDirImpl(
    dir,
    { filter, ignore, rootDir, arr = [] } = {}
  ) {
    const result = await fsReaddir(dir);

    await Promise.all(
      result.map(async part => {
        const absolutePath = path.join(dir, part);
        const pp = absolutePath.replace(rootDir, "");
        if (ignore && ignore.test(pp)) {
          return;
        }

        const pathStat = await fsStat(absolutePath);
        if (pathStat.isDirectory()) {
          await recursiveReadDirImpl(absolutePath, {
            filter,
            ignore,
            arr,
            rootDir
          });
          return;
        }

        if (filter && !runTest(filter, part)) {
          return;
        }
        arr.push({
          id: pp,
          filepath: absolutePath
        });
      })
    );

    return arr.sort();
  }

  return await recursiveReadDirImpl(dir, { filter, ignore, rootDir });
}

module.exports = {
  resolveRoot,
  recursiveReadDir
};
