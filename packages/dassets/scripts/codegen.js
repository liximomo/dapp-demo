const fse = require("fs-extra");
const path = require("path");

const rootDir = path.join(path.dirname(__dirname), "src");
const appsDir = path.join(rootDir, "apps");
const sourceDirs = ["tokens"];

const ChainId = {
  bsc: 56,
  "bsc-test": 97
};

const chains = Object.keys(ChainId);
const configs = chains.reduce((acc, key) => {
  acc[key] = [];
  return acc;
}, {});

async function getConfigFiles(dir) {
  const absDir = path.resolve(rootDir, dir);
  const namespace = path.basename(absDir);
  async function collectConfig(chain) {
    const configFile = path.join(absDir, `config.${chain}.ts`);
    const existed = await fse.exists(configFile);
    if (existed) {
      configs[chain].push({
        namespace,
        configFile
      });
    }
  }

  await Promise.all(chains.map(collectConfig));
}

async function outputFile(chain) {
  const outputFile = path.join(rootDir, `config.${chain}.ts`);
  let imports = `import { setConfig } from "./config";\n`;
  let configCodes = "const config = {\n";
  configs[chain].forEach(({ namespace, configFile }, index) => {
    const modulePath =
      "./" + path.relative(rootDir, configFile).replace(/\.\w+$/, "");
    const varName = `config_${index}`;
    imports += `import ${varName} from "${modulePath}";\n`;
    configCodes += `"${namespace}": ${varName},\n`;
  });
  configCodes += "}\n";

  const source = `
${imports}
${configCodes}
setConfig(config);

export default config;
`;

  await fse.writeFile(outputFile, source, "utf8");
}

async function main() {
  const files = await fse.readdir(appsDir);
  files.forEach(file => {
    sourceDirs.push(path.join("apps", file));
  });

  await Promise.all(sourceDirs.map(getConfigFiles));

  await Promise.all(chains.map(outputFile));
}

main();
