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
const truthHolder = privateToAddress(privateKey);
const ssrNum = 1;
const srNum = 3;
const rNum = 5;
const nNum = 10;
const totalNum = ssrNum + srNum + rNum + nNum;

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
      [ssrNum, srNum, rNum, nNum]
    );
    await avatar.grantRole(ethers.utils.id("MINTER_ROLE"), launcher.address);
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
      await launcher.claim(alice.address, signature);
      expect(await avatar.balanceOf(alice.address)).to.eq(1);
    });

    it("should distribute nft random", async function () {
      const signature = getSignature(privateKey, alice.address);
      for (let index = 0; index < totalNum; index++) {
        await launcher.claim(alice.address, signature);
      }
      const count = {
        SSR: 0,
        SR: 0,
        R: 0,
        N: 0
      };

      for (let index = 0; index < totalNum; index++) {
        const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, index);
        const rarity = await avatar.getRarity(tokenId);
        count[rarity]++;
      }

      await expect(launcher.claim(alice.address, signature)).to.be.revertedWith(
        "no NFT"
      );
      expect(count.SSR).to.eq(ssrNum);
      expect(count.SR).to.eq(srNum);
      expect(count.R).to.eq(rNum);
      expect(count.N).to.eq(nNum);
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
      const signature = getSignature(privateKey, alice.address);
      await launcher.claim(alice.address, signature);
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await expect(aliceLauncher.draw(tokenId)).to.be.revertedWith(
        "insufficient_funds"
      );
    });

    it("should work", async function () {
      const aliceLauncher = launcher.connect(alice);
      await launcher.startDraw();
      const signature = getSignature(privateKey, alice.address);
      await launcher.claim(alice.address, signature);
      const tokenId = await avatar.tokenOfOwnerByIndex(alice.address, 0);
      await busd.transfer(launcher.address, parseEther("100"));
      await aliceLauncher.draw(tokenId);
      const balance = await busd.balanceOf(alice.address);
      expect(balance).to.gte(parseEther("10"));
      expect(balance).to.lte(parseEther("20"));
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
