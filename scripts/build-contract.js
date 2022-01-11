const spawn = require("cross-spawn");
const path = require("path");
const fs = require("fs-extra");
const { recursiveReadDir, resolveRoot } = require("./utils");

const artifactsDir = resolveRoot("packages/contracts/artifacts/src");
const abiDir = resolveRoot("packages/contracts/abis");

function compile() {
  const cwd = resolveRoot("packages/contracts");
  spawn.sync("yarn", ["types"], {
    stdio: "inherit",
    cwd
  });
  spawn.sync("yarn", ["compile"], {
    stdio: "inherit",
    cwd
  });
}

async function buildAbi() {
  const files = await recursiveReadDir(artifactsDir, {
    filter(file) {
      return !file.endsWith(".dbg.json") && file.endsWith(".json");
    }
  });

  const knonwsFiles = new Map();
  const conflictFiles = new Set();

  fs.ensureDirSync(abiDir);

  const tasks = files.map(file => {
    const mod = require(file.filepath);
    const name = path.basename(file.filepath);

    if (knonwsFiles.has(name)) {
      conflictFiles.add(file.id);
      console.warn(`file "${file.id}" conflict on the name "${name}"`);
      return;
    }

    knonwsFiles.set(name, true);

    if (mod.abi && mod.abi.length) {
      return fs.writeFile(
        path.join(abiDir, name),
        JSON.stringify(mod.abi),
        "utf8"
      );
    }
  });

  await Promise.all(tasks);
}

async function main() {
  await compile();
  await buildAbi();
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
