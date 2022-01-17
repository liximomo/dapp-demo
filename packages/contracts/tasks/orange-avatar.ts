import { task } from "hardhat/config";
import { OrangeAvatar__factory } from "../types";
import { deploy, getDeployed } from "../libs/deploy";

task("OrangeAvatar:list-nft")
  .addParam("address", "target address")
  .setAction(async ({ address }, hre) => {
    const avatar = await getDeployed<OrangeAvatar__factory>(
      hre,
      "OrangeAvatar",
      "0x2A2fD0B99bB970A9846308d8F0F6119b5b3b2C99"
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
