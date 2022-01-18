import { task } from "hardhat/config";
import {
  ERC20Mock__factory,
  OrangeLauncher__factory,
  OrangeAvatar__factory
} from "../types";
import { deploy, getDeployed } from "../libs/deploy";
import { getSignature } from "../libs/sign";

const LauncherAddress = "0xA6B7a0F2134CcC467751016Fc3B1c7d62E935219";

task("OrangeLauncher:deploy:test").setAction(async (_, hre) => {
  // config
  const ssrNum = 3;
  const srNum = 5;
  const rNum = 10;
  const nNum = 152;
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
      LauncherAddress
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

task("OrangeLauncher:claim")
  .addParam("user")
  .setAction(async ({ user, type }, hre) => {
    const launcher = await getDeployed<OrangeLauncher__factory>(
      hre,
      "OrangeLauncher",
      LauncherAddress
    );

    const privateKey = Buffer.from(
      "444447150fb4002cd752221516c7a8d85d65a533b320875b74c4e582b4d335a6",
      "hex"
    );
    const sig = getSignature(privateKey, user);
    let tx;
    try {
      tx = await launcher.claim(user, sig, {
        gasLimit: "1000000"
      });
      await tx.wait();
      console.log(`${user} claim success. (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`${user} claim fail. (tx: ${tx?.hash})`);
      console.error(error);
    }
  });

task("OrangeLauncher:setDrawDistributions").setAction(
  async ({ user, type }, hre) => {
    const launcher = await getDeployed<OrangeLauncher__factory>(
      hre,
      "OrangeLauncher",
      LauncherAddress
    );
    let tx;
    try {
      tx = await launcher.setDrawDistributions(
        [60, 45, 30],
        [
          [10, 2],
          [11, 9],
          [12, 20],
          [13, 18],
          [14, 6],
          [15, 18],
          [16, 12],
          [17, 15],
          [18, 16],
          [19, 12],
          [20, 1]
        ],
        {
          gasLimit: "1000000"
        }
      );
      await tx.wait();
      console.log(`setDrawDistributions success. (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`setDrawDistributions fail. (tx: ${tx?.hash})`);
      console.error(error);
    }
  }
);
