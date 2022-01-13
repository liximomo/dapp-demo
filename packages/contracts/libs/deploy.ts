import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ContractFactory } from "ethers";

let printed = false;

export async function getDeployed<
  Factory extends ContractFactory = ContractFactory
>(
  hre: HardhatRuntimeEnvironment,
  name: string,
  address: string
): Promise<ReturnType<Factory["deploy"]>> {
  const ContractFactory = (await hre.ethers.getContractFactory(
    name
  )) as Factory;
  const instance = ContractFactory.attach(address);
  return instance;
}

export async function deploy<Factory extends ContractFactory = ContractFactory>(
  hre: HardhatRuntimeEnvironment,
  name: string,
  args: Parameters<Factory["deploy"]>
): Promise<ReturnType<Factory["deploy"]>> {
  if (!printed) {
    printed = true;
    const [deployer] = await hre.ethers.getSigners();
    console.log("Account address:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    console.log("");
  }

  const ContractFactory = (await hre.ethers.getContractFactory(
    name
  )) as Factory;
  const instance = await ContractFactory.deploy(...(args || []));
  await instance.deployed();

  console.log(`Deploy ${name} at address: ${instance.address}`);

  return instance;
}
