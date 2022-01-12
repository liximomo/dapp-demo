// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./OrangeAvatar.sol";
import "./ECDSA.sol";
import "hardhat/console.sol";

contract OrangeLauncher is AccessControlEnumerable, Pausable, ReentrancyGuard {
  using SafeERC20 for ERC20;
  using Strings for uint256;

  bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");

  struct DrawInfo {
    uint256 amouont;
    address token;
    uint256 time;
  }

  address public truthHolder;
  OrangeAvatar public avatarNFT;
  ERC20 public rewardToken;
  bool public drawEnabled = false;

  mapping(uint256 => DrawInfo) public drawRecords;
  mapping(string => uint256) public categorySupply;

  event Claimed(address indexed user, uint256 indexed tokenId);
  event Drawed(address indexed user, address indexed token, uint256 amount);
  event TokenRecovered(address token, uint256 amount);

  /// @dev only the one having a GOVERNANCE_ROLE can continue an execution
  modifier onlyGovernance() {
    require(
      hasRole(GOVERNANCE_ROLE, _msgSender()),
      "OrangeLauncher::onlyGovernance::only GOVERNANCE role"
    );
    _;
  }

  constructor(
    address _avatarNFT,
    address _rewardToken,
    address _truthHolder,
    uint256[4] memory _supply
  ) {
    avatarNFT = OrangeAvatar(_avatarNFT);
    rewardToken = ERC20(_rewardToken);
    truthHolder = _truthHolder;

    _setupRole(DEFAULT_ADMIN_ROLE, _msgSender());
    _setupRole(GOVERNANCE_ROLE, _msgSender());

    categorySupply["SSR"] = _supply[0]; // 1;
    categorySupply["SR"] = _supply[1]; // 10;
    categorySupply["R"] = _supply[2]; // 20;
    categorySupply["N"] = _supply[3]; // 100;
  }

  function totalNum() public view returns (uint256) {
    return
      categorySupply["SSR"] +
      categorySupply["SR"] +
      categorySupply["R"] +
      categorySupply["N"];
  }

  function claim(address user, bytes memory signature)
    external
    whenNotPaused
    nonReentrant
  {
    address addr = _getAddressFromSig(user, signature);
    require(
      truthHolder != address(0),
      "OrangeLauncher::claim::truthHolder is not set"
    );
    require(
      addr == truthHolder,
      "OrangeLauncher::claim::only accept truthHolder signed message"
    );

    uint256 id = _mint(user, _getRarity(string(signature)));
    emit Claimed(user, id);
  }

  function draw(uint256 id) external whenNotPaused nonReentrant {
    require(drawEnabled, "OrangeLauncher::draw::not avaliable");
    require(
      address(rewardToken) != address(0),
      "OrangeLauncher::draw::no reward avaliable"
    );
    require(
      avatarNFT.ownerOf(id) == _msgSender(),
      "OrangeLauncher::draw::unauthorized"
    );

    DrawInfo storage drawinfo = drawRecords[id];
    require(
      drawinfo.amouont == 0,
      "OrangeLauncher::draw::can't draw repeatedly"
    );

    uint256 amouont = _random(id.toString(), 10, 20);
    amouont = amouont * 10**rewardToken.decimals();
    require(
      amouont > 0,
      "OrangeLauncher::draw::amouont must be greater than 0"
    );
    require(
      rewardToken.balanceOf(address(this)) >= amouont,
      "OrangeLauncher::draw::insufficient_funds"
    );

    drawRecords[id].amouont = amouont;
    drawRecords[id].token = address(rewardToken);
    drawRecords[id].time = block.timestamp;
    rewardToken.transfer(_msgSender(), amouont);
    emit Drawed(_msgSender(), address(rewardToken), amouont);
  }

  function _mint(address to, string memory rarity)
    internal
    returns (uint256 id)
  {
    uint256 ctdId = avatarNFT.categoryIdByRarity(rarity);
    id = avatarNFT.mint(to, ctdId);
    categorySupply[rarity] = categorySupply[rarity] - 1;
  }

  function _getRarity(string memory prefix)
    internal
    view
    returns (string memory)
  {
    uint256 left = totalNum();
    require(left > 0, "OrangeLauncher::_getRarity::no NFT");

    uint256 id = _random(prefix, 1, left);

    string memory rarity;
    uint256 pivot0 = categorySupply["SSR"];
    uint256 pivot1 = categorySupply["SSR"] + categorySupply["SR"];
    uint256 pivot2 = pivot1 + categorySupply["R"];
    uint256 pivot3 = pivot2 + categorySupply["N"];
    if (id >= 1 && id <= pivot0) {
      rarity = "SSR";
    } else if (id >= categorySupply["SSR"] + 1 && id <= pivot1) {
      rarity = "SR";
    } else if (id >= pivot1 + 1 && id <= pivot2) {
      rarity = "R";
    } else if (id >= pivot2 + 1 && id <= pivot3) {
      rarity = "N";
    } else {
      require(false, "OrangeLauncher::_getRarity::something wrong");
    }

    return rarity;
  }

  function _random(
    string memory seed,
    uint256 min,
    uint256 max
  ) internal view returns (uint256) {
    require(
      min <= max,
      "OrangeLauncher::_random::min must be less than or equal to max"
    );

    uint256 rand = uint256(
      keccak256(
        abi.encodePacked(
          string(
            abi.encodePacked(
              seed,
              blockhash(block.number - 1),
              _addressToAsciiString(_msgSender())
            )
          )
        )
      )
    );

    // num in [0, max-min] + [min,min] = [min, max]
    uint256 num = (rand % (max - min + 1)) + min;
    return num;
  }

  function _addressToAsciiString(address x)
    internal
    pure
    returns (string memory)
  {
    bytes memory s = new bytes(40);
    for (uint256 i = 0; i < 20; i++) {
      bytes1 b = bytes1(uint8(uint256(uint160(x)) / (2**(8 * (19 - i)))));
      bytes1 hi = bytes1(uint8(b) / 16);
      bytes1 lo = bytes1(uint8(b) - 16 * uint8(hi));
      s[2 * i] = _char(hi);
      s[2 * i + 1] = _char(lo);
    }
    return string(s);
  }

  function _char(bytes1 b) internal pure returns (bytes1 c) {
    if (uint8(b) < 10) return bytes1(uint8(b) + 0x30);
    else return bytes1(uint8(b) + 0x57);
  }

  function _getAddressFromSig(address user, bytes memory signature)
    internal
    pure
    returns (address)
  {
    bytes32 message = keccak256(abi.encodePacked(user));
    return ECDSA.recover(ECDSA.toEthSignedMessageHash(message), signature);
  }

  /**
   * @dev Pauses all token transfers.
   *
   * See {ERC721Pausable} and {Pausable-_pause}.
   *
   */
  function pause() external onlyGovernance {
    _pause();
  }

  /**
   * @dev Unpauses all token transfers.
   *
   * See {ERC721Pausable} and {Pausable-_unpause}.
   *
   */
  function unpause() external onlyGovernance {
    _unpause();
  }

  function startDraw() external onlyGovernance {
    drawEnabled = true;
  }

  function stopDraw() external onlyGovernance {
    drawEnabled = false;
  }

  function setTruthHolder(address _truthHolder) external onlyGovernance {
    truthHolder = _truthHolder;
  }

  function recoverToken(address tokenAddress, uint256 tokenAmount)
    external
    onlyGovernance
  {
    ERC20(tokenAddress).safeTransfer(_msgSender(), tokenAmount);
    emit TokenRecovered(tokenAddress, tokenAmount);
  }
}
