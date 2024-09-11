// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract ContributionAccountingToken is ERC20, ERC20Permit, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    uint256 public maxSupply;
    uint256 public thresholdSupply;
    uint256 public maxExpansionRate;
    bool public transferRestricted = true;
    
    uint256 public lastMintTimestamp;

    constructor(
        address defaultAdmin,
        uint256 _maxSupply,
        uint256 _thresholdSupply,
        uint256 _maxExpansionRate
    ) ERC20("Contribution Accounting Token", "CAT") ERC20Permit("Contribution Accounting Token") {
        _grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);
        _grantRole(MINTER_ROLE, defaultAdmin);
        
        maxSupply = _maxSupply;
        thresholdSupply = _thresholdSupply;
        maxExpansionRate = _maxExpansionRate;
        lastMintTimestamp = block.timestamp;
    }

    function mint(address to, uint256 amount) public onlyRole(MINTER_ROLE) {
        uint256 currentSupply = totalSupply();
        require(currentSupply + amount <= maxSupply, "Exceeds maximum supply");

        if (currentSupply >= thresholdSupply) {
            uint256 elapsedTime = block.timestamp - lastMintTimestamp;
            uint256 maxMintableAmount = (currentSupply * maxExpansionRate * elapsedTime) / (365 days * 100);
            require(amount <= maxMintableAmount, "Exceeds maximum expansion rate");
        }

        _mint(to, amount);
        lastMintTimestamp = block.timestamp;
    }

    function reduceMaxSupply(uint256 newMaxSupply) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxSupply < maxSupply, "New max supply must be less than current max supply");
        maxSupply = newMaxSupply;
    }

    function reduceThresholdSupply(uint256 newThresholdSupply) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newThresholdSupply < thresholdSupply, "New threshold supply must be less than current threshold supply");
        thresholdSupply = newThresholdSupply;
    }

    function reduceMaxExpansionRate(uint256 newMaxExpansionRate) public onlyRole(DEFAULT_ADMIN_ROLE) {
        require(newMaxExpansionRate < maxExpansionRate, "New max expansion rate must be less than current max expansion rate");
        maxExpansionRate = newMaxExpansionRate;
    }

    function disableTransferRestriction() public onlyRole(DEFAULT_ADMIN_ROLE) {
        transferRestricted = false;
    }

    function _update(address from, address to, uint256 amount) internal override {
        if (transferRestricted) {
            require(from == address(0) || to == address(0) || balanceOf(to) > 0, "Transfer restricted to existing token holders");
        }
        super._update(from, to, amount);
    }

    function grantMinterRole(address account) public onlyRole(DEFAULT_ADMIN_ROLE) {
        grantRole(MINTER_ROLE, account);
    }
}