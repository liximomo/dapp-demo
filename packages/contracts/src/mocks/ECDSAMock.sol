// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "../ECDSA.sol";
import "hardhat/console.sol";

contract ECDSAMock {
  function source(address user, bytes memory signature)
    external
    pure
    returns (address)
  {
    bytes memory message = abi.encodePacked(user);
    bytes32 msgHash = keccak256(message);

    return ECDSA.recover(ECDSA.toEthSignedMessageHash(msgHash), signature);
  }
}
