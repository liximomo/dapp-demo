import { task } from "hardhat/config";
import { ERC20, OrangeToken__factory } from "../types";
import { deploy } from "../libs/deploy";
import { parseEther } from "../libs/utils";

task("OrangeToken:deploy").setAction(async (_, hre) => {
  await deploy<OrangeToken__factory>(hre, "OrangeToken", [
    parseEther("10000")
  ]);
});
