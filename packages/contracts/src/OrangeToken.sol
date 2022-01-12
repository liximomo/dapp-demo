// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract OrangeToken is ERC20("Orange Token", "ORANGE") {
  constructor(uint256 initialSupply) {
    _mint(msg.sender, initialSupply);
  }
}
