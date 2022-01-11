import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ContractFactory } from "ethers";

export async function deploy<Factory extends ContractFactory = ContractFactory>(
  hre: HardhatRuntimeEnvironment,
  name: string,
  args: Parameters<Factory["deploy"]>
): Promise<ReturnType<Factory["deploy"]>> {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account address:", await deployer.getAddress());
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const ContractFactory = (await hre.ethers.getContractFactory(
    name
  )) as Factory;
  const instace = await ContractFactory.deploy(...(args || []));

  console.log(`Deploy ${name} at address: ${instace.address}`);

  return instace;
}
