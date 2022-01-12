import { ethers } from "hardhat";
import chai from "chai";
import { ECDSAMock__factory, ECDSAMock } from "../types";
import { beforeEach } from "mocha";
import { getSignature, privateToAddress } from "../libs/sign";

const { expect } = chai;

const message = "0xc13018A528e4498ee6Fa28D0F519a034972ad1e8";
const privateKey = Buffer.from(
  "dce6f2b2a6b3ff9ad7644d7571b8606883b711516de3ca30d90f3f6994c680e9",
  "hex"
);

describe("ECDSA", function () {
  let ecdsa: ECDSAMock;

  beforeEach(async () => {
    const ECDSAMock = (await ethers.getContractFactory(
      "ECDSAMock"
    )) as ECDSAMock__factory;
    ecdsa = await ECDSAMock.deploy();
    await ecdsa.deployed();
  });

  it("should work", async function () {
    const address = privateToAddress(privateKey);
    const signature = getSignature(privateKey, message);
    expect(await ecdsa.source(message, signature)).to.equal(address);
  });
});
