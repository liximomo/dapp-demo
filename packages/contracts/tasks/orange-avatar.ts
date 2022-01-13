import { task } from "hardhat/config";
import { OrangeAvatar__factory } from "../types";
import { deploy, getDeployed } from "../libs/deploy";

task("OrangeAvatar:list-nft")
  .addParam("address", "target address")
  .setAction(async ({ address }, hre) => {
    const avatar = await getDeployed<OrangeAvatar__factory>(
      hre,
      "OrangeAvatar",
      "0xCd7ec26002D7cD0bD030d285c5f6C5024b7d1b77"
    );

    const totalNFTNum = await avatar.balanceOf(address);
    const num = totalNFTNum.toNumber();
    console.log("Total NFT:", num);
    for (let index = 0; index < num; index++) {
      const nft = await avatar.tokenOfOwnerByIndex(address, index);
      console.log(`No.${index + 1}: ${nft.toNumber()}`);
    }
  });
