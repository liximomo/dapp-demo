const fs = require("fs");
const path = require("path");
const inquirer = require("inquirer");

const I18_PAIR_REG1 = /i18n\([\n\s]*["']([\S ]*?)["']\s*,\s*["]([\S\s ]*?)["][\n\s]*\)/gm;
const I18_PAIR_REG2 = /i18n\([\n\s]*["']([\S ]*?)["']\s*,\s*[']([\S\s ]*?)['][\n\s]*\)/gm;
const I18_PAIR_REGS = [I18_PAIR_REG1, I18_PAIR_REG2];

const SRC_DIR = path.join(__dirname, "../src/");
const I18N_DIR = path.join(__dirname, "../locales");

function resolveI18nfile(name) {
  if (!name.endsWith(".json")) {
    name += `.json`;
  }
  return path.join(I18N_DIR, name);
}

function readdirRecursive(dir, filesList = []) {
  const files = fs.readdirSync(dir);
  files.forEach((item, index) => {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      readdirRecursive(fullPath, filesList);
    } else {
      filesList.push(fullPath);
    }
  });
  return filesList;
}

function scanI18nPair() {
  const filesList = readdirRecursive(SRC_DIR);

  let i18nPair = [];
  filesList
    // .filter(item => !item.includes("ui/pages/login"))
    .forEach(filePath => {
      const fileText = fs.readFileSync(filePath, { encoding: "utf8" });
      const regExec = () => {
        let result;
        for (reg of I18_PAIR_REGS) {
          result = reg.exec(fileText);
          if (result) {
            break;
          }
        }

        if (result) {
          const [, key, value] = result;
          i18nPair.push([key, value]);
          regExec();
        }
      };
      regExec();
    });

  const valueSet = new Set();
  i18nPair = i18nPair
    .filter(([key, value]) => {
      if (valueSet.has(key)) return false;
      valueSet.add(key);
      return true;
    })
    .sort((a, b) => a[0].localeCompare(b[0]));

  return i18nPair;
}

function readPairs(file) {
  let res;
  try {
    res = require(file);
  } catch (error) {
    res = {};
  }

  return res;
}

function printPairs(label, pairs) {
  console.log(`${label}:`);
  pairs.forEach(([key, value]) => {
    console.log(`${key}: ${value}`);
  });
}

function genDiff(currentPairs, newPairs) {
  const diff = {
    add: [],
    remove: [],
    update: []
  };

  const newPairKeys = {};
  for (let [key, value] of newPairs) {
    newPairKeys[key] = true;
  }
  for (let [key, value] of Object.entries(currentPairs)) {
    if (!newPairKeys[key]) {
      diff.remove.push([key, value]);
    }
  }

  for (let [key, value] of newPairs) {
    if (!currentPairs[key]) {
      diff.add.push([key, value]);
    } else if (currentPairs[key] !== value) {
      diff.update.push([key, value]);
    }
  }

  return diff;
}

function applyDiff(currentPairs, diff, output) {
  const copy = { ...currentPairs };
  for (let [key] of diff.remove) {
    delete copy[key];
  }

  const add = [...diff.update, ...diff.add];
  for (let [key, value] of add) {
    copy[key] = value;
  }

  const res = {};
  const sortedEntries = Object.entries(copy).sort((a, b) =>
    a[0].localeCompare(b[0])
  );
  for (let [key, value] of sortedEntries) {
    res[key] = value;
  }

  fs.writeFileSync(output, JSON.stringify(res, null, 2));
}

async function main() {
  const locales = ["en", "zh-CN"];
  let shouldApplyUpdate = false;

  const i18nfileAll = resolveI18nfile("en");
  const currentPairs = readPairs(i18nfileAll);
  const newPairs = scanI18nPair();
  const diff = genDiff(currentPairs, newPairs);

  if (diff.add.length > 0) {
    printPairs("Added", diff.add);
    console.log();
  }

  if (diff.remove.length > 0) {
    printPairs("Removed", diff.remove);
    console.log();
  }

  if (diff.update.length > 0) {
    printPairs("Updated", diff.update);
    console.log();
  }

  if (diff.update.length > 0) {
    const prompt = inquirer.createPromptModule();
    const anwser = await prompt({
      name: "applyUpdate",
      type: "confirm",
      message: "Should apply updated keys？"
    });
    shouldApplyUpdate = anwser.applyUpdate;
  }

  locales.forEach(locale => {
    applyDiff(
      currentPairs,
      {
        add: diff.add,
        remove: diff.remove,
        update: shouldApplyUpdate ? diff.update : []
      },
      resolveI18nfile(locale)
    );
  });
}

main();
