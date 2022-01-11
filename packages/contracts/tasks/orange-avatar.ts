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
    const avatar = await getDeployed<OrangeAvatar__factory>(
      hre,
      "OrangeAvatar",
      "0x2614E2C8e46AC07C8dbdD8045F8f12b66F9dc564"
    );

    for (let index = 0; index < to.length; index++) {
      const address = to[index];
      let tx;
      try {
        tx = await avatar.mint(address, {
          gasLimit: "1000000"
        });
        await tx.wait();
        console.log(`mint avatar to ${address} success. (tx: ${tx.hash})`);
      } catch (error) {
        console.error(`mint avatar to ${address} fail. (tx: ${tx?.hash})`);
        console.error(error);
      }
    }
  });

task("OrangeAvatar:list-nft")
  .addParam("address", "target address")
  .setAction(async ({ address }, hre) => {
    const avatar = await getDeployed<OrangeAvatar__factory>(
      hre,
      "OrangeAvatar",
      "0x2614E2C8e46AC07C8dbdD8045F8f12b66F9dc564"
    );

    const totalNFTNum = await avatar.balanceOf(address);
    const num = totalNFTNum.toNumber();
    console.log("Total NFT:", num);
    for (let index = 0; index < num; index++) {
      const nft = await avatar.tokenOfOwnerByIndex(address, index);
      console.log(`No.${index + 1}: ${nft.toNumber()}`);
    }
  });
