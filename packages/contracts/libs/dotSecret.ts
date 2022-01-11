import fs from "fs";
import path from "path";

export function getPrivateKeys() {
  const exist = fs.existsSync(".secret");
  if (!exist) {
    return {};
  }

  const lines = fs.readFileSync(path.resolve(".secret")).toString().split("\n");

  const privates = lines.reduce((keys, line) => {
    let [label, key] = line.split(":");
    if (!label || !key) {
      return keys;
    }

    label = label.trim();
    key = key.trim();
    keys[label] = key;
    return keys;
  }, {} as { [k: string]: string });

  return privates;
}
