// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./OrangeAvatar.sol";
import "./ECDSA.sol";
import "hardhat/console.sol";

contract OrangeLauncher is
  AccessControlEnumerable,
  Pausable,
  ReentrancyGuard,
  IERC721Receiver
{
  using SafeERC20 for ERC20;
  using Strings for uint256;

  bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
  uint256 public constant REWARD_DENOMINATOR = 100;
  uint256 public rarityRatio = 0; // num%

  struct DrawInfo {
    uint256 amouont;
    address token;
    uint256 time;
  }

  address public truthHolder;
  OrangeAvatar public avatarNFT;
  ERC20 public rewardToken;
  bool public drawEnabled = false;

  mapping(address => bool) public claimRecords;
  mapping(uint256 => DrawInfo) public drawRecords;
  mapping(string => uint256) public categorySupply;
  uint256[3] private _drawDistributionsFixed = [6000, 4500, 3000];
  uint256[2][] private _drawDistributions = [
    [1000, 2],
    [1100, 9],
    [1200, 20],
    [1300, 18],
    [1400, 6],
    [1500, 18],
    [1600, 12],
    [1700, 15],
    [1800, 16],
    [1900, 12],
    [2000, 1]
  ];

  event Claimed(address indexed user, uint256 indexed tokenId);
  event Minted(address indexed user, uint256 indexed tokenId);
  event Rewarded(address indexed user, uint256 indexed tokenId);
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
    uint256 _rarityRatio,
    uint256[4] memory _supply
  ) {
    avatarNFT = OrangeAvatar(_avatarNFT);
    rewardToken = ERC20(_rewardToken);
    truthHolder = _truthHolder;
    rarityRatio = _rarityRatio;

    _setupRole(GOVERNANCE_ROLE, _msgSender());

    categorySupply["SSR"] = _supply[0]; // 1;
    categorySupply["SR"] = _supply[1]; // 10;
    categorySupply["R"] = _supply[2]; // 20;
    categorySupply["N"] = _supply[3]; // 100;
  }

  function totalRareNum() public view returns (uint256) {
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
    require(
      claimRecords[user] == false,
      "OrangeLauncher::claim::can't claim repeatedly"
    );
    require(
      categorySupply["SSR"] == 0,
      "OrangeLauncher::claim::SSR should not be claimable"
    );

    claimRecords[user] = true;
    uint256 id = _mint(user, _getCategory(string(signature)));
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
    require(drawinfo.time == 0, "OrangeLauncher::draw::can't draw repeatedly");

    uint256 amouont = _drawReward(id);
    amouont = (amouont * 10**rewardToken.decimals()) / REWARD_DENOMINATOR;
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

  function _drawReward(uint256 id) internal returns (uint256) {
    uint256 value;
    string memory ctg = avatarNFT.categoryName(id);
    if (keccak256(bytes(ctg)) == keccak256("SSR")) {
      value = _drawDistributionsFixed[0];
    } else if (keccak256(bytes(ctg)) == keccak256("SR")) {
      value = _drawDistributionsFixed[1];
    } else if (keccak256(bytes(ctg)) == keccak256("R")) {
      value = _drawDistributionsFixed[2];
    } else if (keccak256(bytes(ctg)) == keccak256("N")) {
      require(
        _drawDistributions.length > 0,
        "OrangeLauncher::_drawReward::all rewards have been drawed"
      );
      uint256 index = _random(id.toString(), 0, _drawDistributions.length - 1);
      uint256[2] storage info = _drawDistributions[index];
      value = info[0];
      info[1] = info[1] - 1;
      if (info[1] == 0) {
        _removeDrawDistributionsAt(index);
      }
    } else {
      value = 0;
    }

    return value;
  }

  function _getCategory(string memory prefix)
    internal
    view
    returns (string memory)
  {
    uint256 rareleft = totalRareNum();
    string memory category;
    uint256 rand = _random(string(abi.encodePacked(prefix, "rare")), 1, 100);
    bool rare = rand <= rarityRatio;

    if (rare && rareleft > 0) {
      uint256 id = _random(prefix, 1, rareleft);
      uint256 pivot0 = categorySupply["SSR"];
      uint256 pivot1 = pivot0 + categorySupply["SR"];
      uint256 pivot2 = pivot1 + categorySupply["R"];
      uint256 pivot3 = pivot2 + categorySupply["N"];
      if (id >= 1 && id <= pivot0) {
        category = "SSR";
      } else if (id >= pivot0 + 1 && id <= pivot1) {
        category = "SR";
      } else if (id >= pivot1 + 1 && id <= pivot2) {
        category = "R";
      } else if (id >= pivot2 + 1 && id <= pivot3) {
        category = "N";
      } else {
        require(false, "OrangeLauncher::_getCategory::something wrong");
      }
    } else {
      category = "SOUVENIR";
    }

    return category;
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

    uint256 rand =
      uint256(
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

  function _removeDrawDistributionsAt(uint256 index) internal {
    _drawDistributions[index] = _drawDistributions[
      _drawDistributions.length - 1
    ];
    _drawDistributions.pop();
  }

  function _mint(address to, string memory category)
    internal
    returns (uint256 id)
  {
    if (keccak256(bytes(category)) != keccak256("SOUVENIR")) {
      require(
        categorySupply[category] > 0,
        "OrangeLauncher::_mint::no avaliable nft"
      );
      categorySupply[category] = categorySupply[category] - 1;
    }

    uint256 ctdId = avatarNFT.categoryIdByRarity(category);
    id = avatarNFT.mint(to, ctdId);
    emit Minted(to, id);
  }

  function onERC721Received(
    address, /*operator*/
    address, /*from*/
    uint256, /*tokenId*/
    bytes calldata /*data*/
  ) external override returns (bytes4) {
    return IERC721Receiver.onERC721Received.selector;
  }

  function mint(address to, string memory category)
    public
    onlyGovernance
    returns (uint256 id)
  {
    return _mint(to, category);
  }

  function prepareRewards() public onlyGovernance {
    for (uint256 index = 0; index < categorySupply["SSR"]; index++) {
      _mint(address(this), "SSR");
    }
  }

  /// @dev send ssr nft to a account as reward
  function reward(address to, uint256 tokenId) public onlyGovernance {
    require(
      avatarNFT.ownerOf(tokenId) == address(this),
      "OrangeLauncher::reward::invalid nft id"
    );
    avatarNFT.safeTransferFrom(address(this), to, tokenId);
    emit Rewarded(to, tokenId);
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

  function setRarityRatio(uint256 _rarityRatio) external onlyGovernance {
    rarityRatio = _rarityRatio;
  }

  function setDrawDistributions(
    uint256[3] memory drawDistributionsFixed,
    uint256[2][] memory drawDistributions
  ) external onlyGovernance {
    _drawDistributionsFixed[0] = drawDistributionsFixed[0];
    _drawDistributionsFixed[1] = drawDistributionsFixed[1];
    _drawDistributionsFixed[2] = drawDistributionsFixed[2];

    delete _drawDistributions;
    for (uint256 index = 0; index < drawDistributions.length; index++) {
      _drawDistributions.push(drawDistributions[index]);
    }
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
