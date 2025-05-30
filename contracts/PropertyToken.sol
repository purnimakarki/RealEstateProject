// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract PropertyToken is ERC20 {
    address public admin;

    constructor( string memory name, string memory symbol, uint256 totalSupply, address originalOwner) ERC20(name, symbol) {
        admin = msg.sender;
        uint256 ownerShare = (totalSupply * 60) / 100;
        uint256 saleShare = totalSupply - ownerShare;

        _mint(originalOwner, ownerShare);
        _mint(admin, saleShare); // Sale tokens held by platform/admin
    }

    function transferFromSale(address to, uint256 amount) external {
        require(msg.sender == admin, "Only admin can call this");
        _transfer(admin, to, amount);
    }
}
