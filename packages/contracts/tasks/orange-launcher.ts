import { task } from "hardhat/config";
import {
  ERC20Mock__factory,
  OrangeLauncher__factory,
  OrangeAvatar__factory
} from "../types";
import { deploy, getDeployed } from "../libs/deploy";
import { getSignature } from "../libs/sign";

const AvatarAddress = "0x0e97d33590353F7A41Ee5B806Aa63CFd162bE4AD";
const LauncherAddress = "0xE037a037592191756586FC50Dbf49954Bfe31011";

task("OrangeLauncher:deploy:test").setAction(async (_, hre) => {
  // config
  const ssrNum = 3;
  const srNum = 5;
  const rNum = 10;
  const nNum = 152;
  const rarityRatio = 100;

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
      rarityRatio,
      [ssrNum, srNum, rNum, nNum]
    ]
  );
  await avatar.setMinter(launcher.address);
  console.log("set mint to launcer done");
  await launcher.prepareRewards();
  console.log("prepare rewards");
  await token.transfer(launcher.address, hre.ethers.utils.parseEther("3000"));
  console.log("send fund to launcer done");
  await launcher.startDraw();
  console.log("enable draw done");
});

task("OrangeLauncher:deploy").setAction(async (_, hre) => {
  // config
  const ssrNum = 3;
  const srNum = 5;
  const rNum = 10;
  const nNum = 152;
  const rarityRatio = 11;
  const BUSD = "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56";
  const trustHolder = "0xec4f67f785938dB2076C07b834e800dFd7FFc713";

  const avatar = await deploy<OrangeAvatar__factory>(hre, "OrangeAvatar", [""]);
  const launcher = await deploy<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    [
      avatar.address,
      BUSD,
      trustHolder,
      rarityRatio,
      [ssrNum, srNum, rNum, nNum]
    ]
  );
  await avatar.setMinter(launcher.address, {
    gasLimit: "1000000"
  });
  console.log("set mint to launcer done");
  await launcher.prepareRewards({
    gasLimit: "1000000"
  });
  console.log("prepare rewards");
  // await token.transfer(launcher.address, hre.ethers.utils.parseEther("3000"));
  // console.log("send fund to launcer done");
  // await launcher.startDraw();
  // console.log("enable draw done");
});

task("OrangeLauncher:mint")
  .addParam("type")
  .addParam("to")
  .addParam("id")
  .setAction(async ({ to, id, type }, hre) => {
    const launcher = await getDeployed<OrangeLauncher__factory>(
      hre,
      "OrangeLauncher",
      LauncherAddress
    );

    let tx;
    try {
      tx = await launcher.mint(to, type.toUpperCase(), id, {
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

task("OrangeLauncher:setDrawDistributions").setAction(async ({}, hre) => {
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
    // tx = await launcher.setDrawDistributions(
    //   [6000, 4500, 3000],
    //   [
    //     [1000, 2],
    //     [1100, 9],
    //     [1200, 20],
    //     [1300, 18],
    //     [1400, 6],
    //     [1500, 18],
    //     [1600, 12],
    //     [1700, 15],
    //     [1800, 16],
    //     [1900, 12],
    //     [2000, 1]
    //   ],
    //   {
    //     gasLimit: "1000000"
    //   }
    // );
    await tx.wait();
    console.log(`setDrawDistributions success. (tx: ${tx.hash})`);
  } catch (error) {
    console.error(`setDrawDistributions fail. (tx: ${tx?.hash})`);
    console.error(error);
  }
});

task("OrangeLauncher:startDraw").setAction(async ({}, hre) => {
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );
  let tx;
  try {
    // tx = await launcher.prepareRewards({
    //   gasLimit: "1000000"
    // });
    tx = await launcher.startDraw({
      gasLimit: "1000000"
    });
    await tx.wait();
    console.log(`startDraw success. (tx: ${tx.hash})`);
  } catch (error) {
    console.error(`startDraw fail. (tx: ${tx?.hash})`);
    console.error(error);
  }
});

task("OrangeLauncher:stopDraw").setAction(async ({}, hre) => {
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );
  let tx;
  try {
    tx = await launcher.stopDraw({
      gasLimit: "1000000"
    });
    await tx.wait();
    console.log(`stopDraw success. (tx: ${tx.hash})`);
  } catch (error) {
    console.error(`stopDraw fail. (tx: ${tx?.hash})`);
    console.error(error);
  }
});

task("OrangeLauncher:reward").setAction(async ({}, hre) => {
  const users: string[] = [];
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );

  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    let tx;
    try {
      tx = await launcher.reward(user, index, {
        gasLimit: "1000000"
      });
      await tx.wait();
      console.log(`reward to ${user} NFT#${index} success. (tx: ${tx.hash})`);
    } catch (error) {
      console.error(`reward to ${user} NFT#${index} fail. (tx: ${tx?.hash})`);
      console.error(error);
    }
  }
});

task("OrangeLauncher:recoverToken").setAction(async ({}, hre) => {
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );
  const busd = await getDeployed<ERC20Mock__factory>(
    hre,
    "ERC20Mock",
    "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"
  );

  let tx;
  try {
    const balance = await busd.balanceOf(LauncherAddress);
    tx = await launcher.recoverToken(busd.address, balance, {
      gasLimit: "1000000"
    });
    await tx.wait();
    console.log(`recoverToken success. (tx: ${tx.hash})`);
  } catch (error) {
    console.error(`recoverToken fail. (tx: ${tx?.hash})`);
    console.error(error);
  }
});

task("OrangeLauncher:info").setAction(async ({}, hre) => {
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );
  try {
    const ssrNum = await launcher.categorySupply("SSR", {
      gasLimit: "1000000"
    });
    const srNum = await launcher.categorySupply("SR", {
      gasLimit: "1000000"
    });
    const rNum = await launcher.categorySupply("R", {
      gasLimit: "1000000"
    });
    const nNum = await launcher.categorySupply("N", {
      gasLimit: "1000000"
    });
    const rarity = await launcher.rarityRatio();
    console.log("ssrNum", ssrNum.toString());
    console.log("srNum", srNum.toString());
    console.log("rNum", rNum.toString());
    console.log("nNum", nNum.toString());
    console.log("rarity", rarity.toString());
  } catch (error) {
    console.error(error);
  }
});

task("OrangeLauncher:claim-logs").setAction(async ({}, hre) => {
  const launcher = await getDeployed<OrangeLauncher__factory>(
    hre,
    "OrangeLauncher",
    LauncherAddress
  );

  const ClaimedEvent = launcher.filters.Claimed(null, null);
  try {
    const logs = await launcher.provider.getLogs({
      fromBlock: 14753710,
      toBlock: "latest",
      address: launcher.address,
      topics: ClaimedEvent.topics
    });
    console.log("logs", logs);
  } catch (error) {
    console.error(error);
  }
});
