import { task } from "hardhat/config";
import { OrangeAvatar__factory } from "../types";
import { deploy, getDeployed } from "../libs/deploy";

task("OrangeAvatar:deploy").setAction(async (_, hre) => {
  const admin = "0x6dE7BaF2060f2091Ec03C28f00205F46935A856c";
  await deploy<OrangeAvatar__factory>(hre, "OrangeAvatar", [admin]);
});

task("OrangeAvatar:mint")
  .addVariadicPositionalParam("to", "list of address")
  .setAction(async ({ to }, hre) => {
    const avatar = await getDeployed(
      hre,
      "OrangeAvatar",
      "0x405Da0de4f7395f590eC58cf1b4f35BDa1D7144b"
    );

    for (let index = 0; index < to.length; index++) {
      const address = to[index];
      await avatar.mint(address);
    }
  });
