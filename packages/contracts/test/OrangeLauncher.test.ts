import { ethers } from "hardhat";
import ethWallet from "ethereumjs-wallet";
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
const ssrNum = 3;
const srNum = 5;
const rNum = 10;
const nNum = 152;
const rarityRatio = 11;
const totalClaimableRareNum = srNum + rNum + nNum;
const souvenirIdBase = totalClaimableRareNum + ssrNum;

describe("OrangeLauncher", function () {
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let carol: SignerWithAddress;
  let david: SignerWithAddress;
  let deployer: SignerWithAddress;

  let busd: ERC20Mock;
  let avatar: OrangeAvatar;
  let launcher: OrangeLauncher;

  before(async () => {
    [alice, bob, carol, david, deployer] = await ethers.getSigners();
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
      rarityRatio,
      [ssrNum, srNum, rNum, nNum]
    );
    await avatar.setMinter(launcher.address);
  });

  describe("mint", () => {
    it("should consume supply", async function () {
      const before = await launcher.categorySupply("SSR");
      await expect(launcher.mint(alice.address, 0, "SSR"))
        .to.emit(launcher, "Minted")
        .withArgs(alice.address, 0);
      const after = await launcher.categorySupply("SSR");
      expect(before.sub(after)).to.eq(1);
    });

    it("should revert: unknown category", async function () {
      await expect(
        launcher.mint(alice.address, 0, "UNKNOWN_CATEGORY")
      ).to.be.revertedWith("no avaliable nft");
    });

    it("should revert: no supply", async function () {
      for (let index = 0; index < ssrNum; index++) {
        await launcher.mint(alice.address, index, "SSR");
      }
      await expect(
        launcher.mint(alice.address, ssrNum, "SSR")
      ).to.be.revertedWith("no avaliable nft");
    });
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

    it("should revert before calling prepareRewards", async function () {
      const signature = getSignature(privateKey, alice.address);
      expect(await avatar.balanceOf(alice.address)).to.eq(0);
      const aLauncher = launcher.connect(alice);
      await expect(
        aLauncher.claim(alice.address, signature)
      ).to.be.revertedWith(
        "OrangeLauncher::claim::SSR should not be claimable"
      );
    });

    it("should work", async function () {
      await launcher.prepareRewards();
      const signature = getSignature(privateKey, alice.address);
      expect(await avatar.balanceOf(alice.address)).to.eq(0);
      const aLauncher = launcher.connect(alice);
      const bLauncher = launcher.connect(bob);
      await launcher.setRarityRatio(100);
      await expect(aLauncher.claim(alice.address, signature))
        .to.emit(launcher, "Claimed")
        .withArgs(alice.address, ssrNum);
      expect(await avatar.balanceOf(alice.address)).to.eq(1);

      await launcher.setRarityRatio(0);
      await expect(
        bLauncher.claim(bob.address, getSignature(privateKey, bob.address))
      )
        .to.emit(launcher, "Claimed")
        .withArgs(bob.address, souvenirIdBase);
      expect(await avatar.balanceOf(bob.address)).to.eq(1);
    });

    it("should only allow claim once", async function () {
      await launcher.prepareRewards();
      const signature = getSignature(privateKey, alice.address);
      expect(await avatar.balanceOf(alice.address)).to.eq(0);
      await launcher.claim(alice.address, signature);
      expect(await avatar.balanceOf(alice.address)).to.eq(1);
      await expect(launcher.claim(alice.address, signature)).to.be.revertedWith(
        "can't claim repeatedly"
      );
    });

    it.skip("should distribute nft as expected (real case)", async function () {
      this.timeout(30 * 60 * 1000);
      const count = {
        SSR: 0,
        SR: 0,
        R: 0,
        N: 0,
        SOUVENIR: 0
      };

      await launcher.prepareRewards();
      const rarity = await launcher.rarityRatio();
      const total = Math.ceil(
        (1 / rarity.toNumber()) * totalClaimableRareNum * 2 * 100
      );
      const addressList = [];
      for (let index = 0; index < total; index++) {
        const address = ethWallet.generate().getAddressString();
        addressList.push(address);
        const signature = getSignature(privateKey, address);
        await launcher.claim(address, signature);
      }
      for (let index = 0; index < total; index++) {
        const tokenId = await avatar.tokenOfOwnerByIndex(addressList[index], 0);
        const ctg = await avatar.categoryName(tokenId);
        count[ctg]++;
      }

      // 1. claim sr, r, n first
      expect(count.SSR).to.eq(0);
      expect(count.SR).to.closeTo(srNum, 1);
      expect(count.R).to.closeTo(rNum, 1);
      expect(count.N).to.closeTo(nNum, 1);
      expect(count.SOUVENIR).to.closeTo(total - totalClaimableRareNum, 1);

      addressList.length = 0;
      for (let index = 0; index < 100; index++) {
        const address = ethWallet.generate().getAddressString();
        addressList.push(address);
        const signature = getSignature(privateKey, address);
        await launcher.claim(address, signature);
      }
      count.SOUVENIR = 0;
      for (let index = 0; index < 100; index++) {
        const tokenId = await avatar.tokenOfOwnerByIndex(addressList[index], 0);
        const ctg = await avatar.categoryName(tokenId);
        count[ctg]++;
      }
      // 2. then claim souvenir
      expect(count.SOUVENIR).to.eq(100);

      // 3. reward ssr
      expect(await avatar.balanceOf(launcher.address)).to.eq(ssrNum);
      for (let index = 0; index < ssrNum; index++) {
        const beforeBalance = await avatar.balanceOf(alice.address);
        await expect(launcher.reward(alice.address, index))
          .to.emit(launcher, "Rewarded")
          .withArgs(alice.address, index);
        const afterBalance = await avatar.balanceOf(alice.address);
        expect(await avatar.ownerOf(index)).to.eq(alice.address);
        expect(await avatar.categoryName(index)).to.eq("SSR");
        expect(afterBalance.sub(beforeBalance)).to.eq(1);
      }
      expect(await avatar.balanceOf(launcher.address)).to.eq(0);

      // 5. no more reward
      await expect(launcher.reward(alice.address, ssrNum)).to.be.revertedWith(
        "invalid nft id"
      );
    });
  });

  describe("draw", () => {
    it("should revert: draw is not started", async function () {
      await expect(launcher.draw(0)).to.be.revertedWith("not avaliable");
    });

    it("should revert: no avaliable nft", async function () {
      const aliceLauncher = launcher.connect(alice);
      const bobLauncher = launcher.connect(bob);
      await launcher.startDraw();
      await launcher.mint(alice.address, 0, "SR");
      await launcher.mint(bob.address, 1, "SR");
      const aid = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      const bid = await avatar.tokenOfOwnerByIndex(bob.address, 0);
      await expect(aliceLauncher.draw(bid)).to.be.revertedWith("unauthorized");
      await expect(bobLauncher.draw(aid)).to.be.revertedWith("unauthorized");
    });

    it("should revert", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.mint(alice.address, 0, "N");
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await expect(aliceLauncher.draw(tokenId)).to.be.revertedWith(
        "insufficient_funds"
      );
    });

    it("should draw once", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.mint(alice.address, 0, "N");
      await launcher.setDrawDistributions([0, 0, 0], [[10, 4]]);
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await busd.transfer(launcher.address, parseEther("100"));
      await expect(aliceLauncher.draw(tokenId))
        .to.emit(launcher, "Drawed")
        .withArgs(alice.address, busd.address, parseEther("0.1"));
      const balance = await busd.balanceOf(alice.address);
      expect(balance).to.eq(parseEther("0.1"));
      await expect(aliceLauncher.draw(tokenId)).to.be.revertedWith(
        "can't draw repeatedly"
      );
    });

    it("[Noraml NFT] should distribute award randomly case 1", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.setDrawDistributions(
        [0, 0, 0],
        [
          [1000, 2],
          [2000, 1]
        ]
      );
      await launcher.mint(alice.address, 0, "N");
      await launcher.mint(alice.address, 1, "N");
      await launcher.mint(alice.address, 2, "N");
      await launcher.mint(alice.address, 3, "N");
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
      await expect(aliceLauncher.draw(3)).to.be.revertedWith(
        "all rewards have been drawed"
      );
    });

    it("[Noraml NFT] should distribute award randomly case 2", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.setDrawDistributions(
        [0, 0, 0],
        [
          [1000, 2],
          [1500, 1],
          [2000, 1]
        ]
      );
      await launcher.mint(alice.address, 0, "N");
      await launcher.mint(alice.address, 1, "N");
      await launcher.mint(alice.address, 2, "N");
      await launcher.mint(alice.address, 3, "N");
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
      await aliceLauncher.draw(3);
      const forthBalance = await busd.balanceOf(alice.address);
      drawReward.push(forthBalance.sub(thirdBalance));
      expect(
        drawReward.map(a => +ethers.utils.formatEther(a)).sort((a, b) => a - b)
      ).to.eql([10, 10, 15, 20]);
    });

    it("[Rare NFT] should distribute award randomly", async function () {
      const aliceLauncher = launcher.connect(alice);
      const bobLauncher = launcher.connect(bob);
      await launcher.startDraw();
      await launcher.setDrawDistributions([6000, 3000, 1000], []);
      await launcher.mint(alice.address, 0, "SSR");
      await launcher.mint(alice.address, 1, "SR");
      await launcher.mint(alice.address, 2, "R");
      await busd.transfer(launcher.address, parseEther("100"));

      await expect(() => aliceLauncher.draw(0)).to.changeTokenBalance(
        busd,
        alice,
        parseEther("60")
      );
      await expect(() => aliceLauncher.draw(1)).to.changeTokenBalance(
        busd,
        alice,
        parseEther("30")
      );
      await expect(() => aliceLauncher.draw(2)).to.changeTokenBalance(
        busd,
        alice,
        parseEther("10")
      );

      await launcher.mint(bob.address, 3, "SR");
      await launcher.mint(bob.address, 4, "R");
      await expect(bobLauncher.draw(3)).to.be.revertedWith(
        "insufficient_funds"
      );
      await busd.transfer(launcher.address, parseEther("40"));
      await expect(() => bobLauncher.draw(3)).to.changeTokenBalance(
        busd,
        bob,
        parseEther("30")
      );
      await expect(() => bobLauncher.draw(4)).to.changeTokenBalance(
        busd,
        bob,
        parseEther("10")
      );
    });

    it("[SOUVENIR NFT] should not able to draw", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      await launcher.mint(alice.address, 0, "SOUVENIR");
      await busd.transfer(launcher.address, parseEther("100"));
      await expect(aliceLauncher.draw(0)).to.be.revertedWith(
        "amouont must be greater than 0"
      );
    });

    it("should distribute award properly (real case)", async function () {
      this.timeout(30 * 60 * 1000);
      const aliceLauncher = launcher.connect(alice);
      const bobLauncher = launcher.connect(bob);
      const carolLauncher = launcher.connect(carol);
      const davidLauncher = launcher.connect(david);
      const rewards: [number, number][] = [
        [1000, 6],
        [1100, 19],
        [1200, 13],
        [1300, 13],
        [1400, 18],
        [1500, 13],
        [1600, 12],
        [1700, 17],
        [1800, 15],
        [1900, 17],
        [2000, 9]
      ];
      await launcher.startDraw();
      await launcher.setDrawDistributions([6000, 4500, 3000], rewards);
      const totalNoralRewards = rewards.reduce(
        (acc, i) => acc + (i[0] * i[1]) / 100,
        0
      );
      const totalReward = 3000;
      const ssrReward = 60 * ssrNum;
      const srReward = 45 * srNum;
      const rReward = 30 * rNum;
      const nReward = totalReward - ssrReward - srReward - rReward;
      expect(nReward).to.eq(totalNoralRewards);
      await busd.transfer(launcher.address, parseEther(String(totalReward)));
      for (let i = 0; i < ssrNum; i++) {
        await launcher.mint(alice.address, i, "SSR");
      }
      for (let i = 0; i < srNum; i++) {
        await launcher.mint(bob.address, ssrNum + i, "SR");
      }
      for (let i = 0; i < rNum; i++) {
        await launcher.mint(carol.address, ssrNum + srNum + i, "R");
      }
      for (let i = 0; i < nNum; i++) {
        await launcher.mint(david.address, ssrNum + srNum + rNum + i, "N");
      }
      await expect(launcher.mint(alice.address, 9999, "SSR")).be.revertedWith(
        "no avaliable nft"
      );
      await expect(launcher.mint(alice.address, 9999, "SR")).be.revertedWith(
        "no avaliable nft"
      );
      await expect(launcher.mint(alice.address, 9999, "R")).be.revertedWith(
        "no avaliable nft"
      );
      await expect(launcher.mint(alice.address, 9999, "N")).be.revertedWith(
        "no avaliable nft"
      );

      for (let i = 0; i < ssrNum; i++) {
        await aliceLauncher.draw(i);
      }
      expect(await busd.balanceOf(launcher.address)).to.eq(
        parseEther(String(totalReward - ssrReward))
      );
      expect(await busd.balanceOf(alice.address)).to.eq(
        parseEther(String(ssrReward))
      );
      for (let i = 0; i < srNum; i++) {
        await bobLauncher.draw(ssrNum + i);
      }
      expect(await busd.balanceOf(launcher.address)).to.eq(
        parseEther(String(totalReward - ssrReward - srReward))
      );
      expect(await busd.balanceOf(bob.address)).to.eq(
        parseEther(String(srReward))
      );
      for (let i = 0; i < rNum; i++) {
        await carolLauncher.draw(ssrNum + srNum + i);
      }
      expect(await busd.balanceOf(launcher.address)).to.eq(
        parseEther(String(totalReward - ssrReward - srReward - rReward))
      );
      expect(await busd.balanceOf(carol.address)).to.eq(
        parseEther(String(rReward))
      );
      for (let i = 0; i < nNum; i++) {
        await davidLauncher.draw(ssrNum + srNum + rNum + i);
      }
      expect(await busd.balanceOf(launcher.address)).to.eq(parseEther("0"));
      expect(await busd.balanceOf(david.address)).to.eq(
        parseEther(String(nReward))
      );
    });
  });

  describe("governance", () => {
    it("should revert", async () => {
      const aliceLauncher = launcher.connect(alice);
      await expect(
        aliceLauncher.setTruthHolder(ethers.constants.AddressZero)
      ).to.be.revertedWith("only GOVERNANCE role");
      await expect(aliceLauncher.pause()).to.be.revertedWith(
        "only GOVERNANCE role"
      );
      await expect(aliceLauncher.startDraw()).to.be.revertedWith(
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
