import { task } from "hardhat/config";
import { OrangeAvatar__factory } from "../types";
import { deploy, getDeployed } from "../libs/deploy";

task("OrangeAvatar:list-nft")
  .addParam("address", "target address")
  .setAction(async ({ address }, hre) => {
    const avatar = await getDeployed<OrangeAvatar__factory>(
      hre,
      "OrangeAvatar",
      "0xD50c6b1f82fA418066e50CF2a715a5A29add674B"
    );

    const totalNFTNum = await avatar.balanceOf(address);
    const num = totalNFTNum.toNumber();
    console.log("Total NFT:", num);
    for (let index = 0; index < num; index++) {
      const nft = await avatar.tokenOfOwnerByIndex(address, index);
      const category = await avatar.categoryName(nft);
      console.log(`No.${index + 1}: ${nft.toNumber()} (${category})`);
    }
  });
