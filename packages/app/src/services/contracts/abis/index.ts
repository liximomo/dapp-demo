const ABI = Object.create(null);

// @ts-ignore
const requireAbi = require.context(
  // Look for files in the current directory
  "./",
  // look in subdirectories
  false,
  // Only include "_base-" prefixed .vue files
  /.json$/
);

// For each matching file name...
requireAbi.keys().forEach((fileName: string) => {
  // Get the component config
  const abi = requireAbi(fileName);
  // Get the PascalCase version of the component name
  const abiName = fileName
    // Remove the "./" from the beginning
    .replace(/^\.\//, "")
    // Remove the file extension from the end
    .replace(/\.\w+$/, "");
  // Globally register the abi
  ABI[abiName] = abi;
});

export function getAbi(name: string): any[] {
  if (!ABI[name]) {
    throw new Error(`ABI not Found. (${name})`);
  }

  return ABI[name];
}
