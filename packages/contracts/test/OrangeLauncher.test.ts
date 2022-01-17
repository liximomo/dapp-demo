import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/dist/src/signer-with-address";
import chai from "chai";
import {
  OrangeLauncher__factory,
  OrangeLauncher,
  OrangeAvatar,
  OrangeAvatar__factory,
  ERC20Mock,
  ERC20Mock__factory
} from "../types";
import { beforeEach } from "mocha";
import { parseEther } from "../libs/utils";
import { getSignature, privateToAddress } from "../libs/sign";

const { expect } = chai;

const privateKey = Buffer.from(
  "444447150fb4002cd752221516c7a8d85d65a533b320875b74c4e582b4d335a6",
  "hex"
);
// 0xF9A2E4B92e3A7356c31862F963634172c12878A5
const truthHolder = privateToAddress(privateKey);
const ssrNum = 1;
const srNum = 2;
const rNum = 3;
const nNum = 4;
const souvenirNum = 5;
const totalRareNum = srNum + rNum + nNum;
const totalClaimableNum = totalRareNum + souvenirNum;
const totalNum = totalClaimableNum + ssrNum;

describe("ChefVender", function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let deployer: SignerWithAddress;

  let busd: ERC20Mock;
  let avatar: OrangeAvatar;
  let launcher: OrangeLauncher;

  before(async () => {
    [alice, bob, carol, deployer] = await ethers.getSigners();
  });

  beforeEach(async () => {
    const ERC20Mock = (await ethers.getContractFactory(
      "ERC20Mock"
    )) as ERC20Mock__factory;
    const OrangeAvatar = (await ethers.getContractFactory(
      "OrangeAvatar"
    )) as OrangeAvatar__factory;
    const OrangeLauncher = (await ethers.getContractFactory(
      "OrangeLauncher"
    )) as OrangeLauncher__factory;

    busd = await ERC20Mock.connect(deployer).deploy(
      "BUSD",
      "BUSD",
      parseEther("10000")
    );
    avatar = await OrangeAvatar.connect(deployer).deploy("");
    launcher = await OrangeLauncher.connect(deployer).deploy(
      avatar.address,
      busd.address,
      truthHolder,
      [ssrNum, srNum, rNum, nNum, souvenirNum]
    );
    await avatar.setMinter(launcher.address);
  });

  describe("claim", () => {
    it("should require truthholder to be setted", async function () {
      await launcher.setTruthHolder(ethers.constants.AddressZero);
      await expect(launcher.claim(alice.address, "0xfa3e")).to.be.revertedWith(
        "truthHolder is not set"
      );
    });

    it("should revert for invalid signature", async function () {
      await expect(launcher.claim(alice.address, "0xfa3e")).to.be.revertedWith(
        "only accept truthHolder signed message"
      );
    });

    it("should work", async function () {
      const signature = getSignature(privateKey, alice.address);
      expect(await avatar.balanceOf(alice.address)).to.eq(0);
      const aLauncher = launcher.connect(alice);
      await aLauncher.claim(alice.address, signature);
      expect(await avatar.balanceOf(alice.address)).to.eq(1);
    });

    it("should only allow claim once", async function () {
      const signature = getSignature(privateKey, alice.address);
      expect(await avatar.balanceOf(alice.address)).to.eq(0);
      await launcher.claim(alice.address, signature);
      expect(await avatar.balanceOf(alice.address)).to.eq(1);
      await expect(launcher.claim(alice.address, signature)).to.be.revertedWith(
        "can't claim repeatedly"
      );
    });

    it("should distribute nft as expected", async function () {
      const count = {
        SSR: 0,
        SR: 0,
        R: 0,
        N: 0,
        SOUVENIR: 0
      };

      const signers = await ethers.getSigners();
      for (let index = 0; index < totalRareNum; index++) {
        const signature = getSignature(privateKey, signers[index].address);
        await launcher.claim(signers[index].address, signature);
      }
      for (let index = 0; index < totalRareNum; index++) {
        const tokenId = await avatar.tokenOfOwnerByIndex(
          signers[index].address,
          0
        );
        const ctg = await avatar.categoryName(tokenId);
        count[ctg]++;
      }

      // 1. claim sr, r, n first
      expect(count.SSR).to.eq(0);
      expect(count.SR).to.eq(srNum);
      expect(count.R).to.eq(rNum);
      expect(count.N).to.eq(nNum);
      expect(count.SOUVENIR).to.eq(0);

      for (let index = totalRareNum; index < totalClaimableNum; index++) {
        const signature = getSignature(privateKey, signers[index].address);
        await launcher.claim(signers[index].address, signature);
      }
      for (let index = totalRareNum; index < totalClaimableNum; index++) {
        const tokenId = await avatar.tokenOfOwnerByIndex(
          signers[index].address,
          0
        );
        const ctg = await avatar.categoryName(tokenId);
        count[ctg]++;
      }
      // 2. then claim souvenir
      expect(count.SOUVENIR).to.eq(souvenirNum);

      // 3, can't claim now
      await expect(
        launcher.claim(
          signers[totalNum].address,
          getSignature(privateKey, signers[totalNum].address)
        )
      ).to.be.revertedWith("no NFT");

      // 4. mint ssr
      for (let index = 0; index < ssrNum; index++) {
        await launcher.mint(alice.address, "SSR");
      }

      // 5. can't mint more
      await expect(launcher.mint(alice.address, "SSR")).to.be.revertedWith(
        "no avaliable nft"
      );
    });
  });

  describe("draw", () => {
    it("should revert", async function () {
      await expect(launcher.draw(0)).to.be.revertedWith("not avaliable");
    });

    it("should revert", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      const signature = getSignature(privateKey, bob.address);
      await launcher.claim(bob.address, signature);
      await expect(aliceLauncher.draw(0)).to.be.revertedWith("unauthorized");
    });

    it("should revert", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.mint(alice.address, "N");
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await expect(aliceLauncher.draw(tokenId)).to.be.revertedWith(
        "insufficient_funds"
      );
    });

    it("should work", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.mint(alice.address, "N");
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await busd.transfer(launcher.address, parseEther("100"));
      await aliceLauncher.draw(tokenId);
      const balance = await busd.balanceOf(alice.address);
      expect(balance).to.gte(parseEther("10"));
      expect(balance).to.lte(parseEther("20"));
    });

    it("should distribute award randomly", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.setDrawDistributions(
        [0, 0, 0],
        [
          [10, 2],
          [20, 1]
        ]
      );
      await launcher.mint(alice.address, "N");
      await launcher.mint(alice.address, "N");
      await launcher.mint(alice.address, "N");
      await launcher.mint(alice.address, "N");
      await busd.transfer(launcher.address, parseEther("100"));
      const drawReward = [];
      const initBalance = await busd.balanceOf(alice.address);
      await aliceLauncher.draw(0);
      const firstBalance = await busd.balanceOf(alice.address);
      drawReward.push(firstBalance.sub(initBalance));
      await aliceLauncher.draw(1);
      const sencondBalance = await busd.balanceOf(alice.address);
      drawReward.push(sencondBalance.sub(firstBalance));
      await aliceLauncher.draw(2);
      const thirdBalance = await busd.balanceOf(alice.address);
      drawReward.push(thirdBalance.sub(sencondBalance));
      expect(
        drawReward.map(a => +ethers.utils.formatEther(a)).sort((a, b) => a - b)
      ).to.eql([10, 10, 20]);
      expect(aliceLauncher.draw(3)).to.be.revertedWith(
        "all rewards have been drawed"
      );
    });
  });

  describe("governance", () => {
    it("should revert", () => {
      const aliceLauncher = launcher.connect(alice);
      expect(
        aliceLauncher.setTruthHolder(ethers.constants.AddressZero)
      ).to.be.revertedWith("only GOVERNANCE role");
      expect(aliceLauncher.pause()).to.be.revertedWith("only GOVERNANCE role");
      expect(aliceLauncher.startDraw()).to.be.revertedWith(
        "only GOVERNANCE role"
      );
    });

    it("should recover token from contract", async () => {
      await busd.transfer(launcher.address, parseEther("100"));
      await expect(() =>
        launcher.recoverToken(busd.address, parseEther("100"))
      ).to.changeTokenBalance(busd, deployer, parseEther("100"));
    });
  });
});
