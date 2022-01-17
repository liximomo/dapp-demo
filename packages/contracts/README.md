## Tasks

run a task:

```
npx hardhat --network <netowrk> <taskName> [taskArgs]
```

example:

```
npx hardhat --network bscTestnet OrangeAvatar:deploy
```

### OrangeAvatar

#### list

list all NFTs of an address

```
npx hardhat --network bscTestnet OrangeAvatar:list-nft --address <address>
```

### OrangeLauncher

#### deploy test

```
npx hardhat --network bscTestnet OrangeLauncher:deploy:test
```

#### mint

mint nft to a specific account

```
npx hardhat --network bscTestnet OrangeLauncher:mint --type <type> --to <address>
```
