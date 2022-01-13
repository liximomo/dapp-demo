import { task } from "hardhat/config";
import {
  ERC20Mock__factory,
  OrangeLauncher__factory,
  OrangeAvatar__factory
} from "../types";
import { deploy, getDeployed } from "../libs/deploy";

task("OrangeLauncher:deploy:test").setAction(async (_, hre) => {
  // config
  const ssrNum = 3;
  const srNum = 2;
  const rNum = 3;
  const nNum = 172;
  const souvenirNum = 500;

  const token = await deploy<ERC20Mock__factory>(hre, "ERC20Mock", [
    "Test Reward BUSD Token",
    "tBUSD",
    hre.ethers.utils.parseEther("10000")
  ]);
  const avatar = await deploy<OrangeAvatar__factory>(hre, "OrangeAvatar", [""]);
  const launcher = await deploy<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    [
      avatar.address,
      token.address,
      "0xF9A2E4B92e3A7356c31862F963634172c12878A5",
      [ssrNum, srNum, rNum, nNum, souvenirNum]
    ]
  );
  await avatar.setMinter(launcher.address);
  console.log("set mint to launcer done");
  await token.transfer(launcher.address, hre.ethers.utils.parseEther("3000"));
  console.log("send fund to launcer done");
  await launcher.startDraw();
  console.log("enable draw done");
});

task("OrangeLauncher:mint")
  .addParam("type")
  .addParam("to")
  .setAction(async ({ to, type }, hre) => {
    const launcher = await getDeployed<OrangeLauncher__factory>(
      hre,
      "OrangeLauncher",
      "0xd68C9576D2786Ed9ACb98C6736423c730D41fCA7"
    );

    let tx;
    try {
      tx = await launcher.mint(to, type.toUpperCase(), {
        gasLimit: "1000000"
      });
      await tx.wait();
      console.log(`mint avatar to ${to} success. (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`mint avatar to ${to} fail. (tx: ${tx?.hash})`);
      console.error(error);
    }
  });
