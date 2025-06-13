// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MintableERC20 is ERC20 {
    // Variables
    mapping(address => uint) public lastMintTime;
    uint private interval;
    address public owner;

    constructor(
        string memory _name,
        string memory _symbol
    ) ERC20(_name, _symbol) {
        _mint(msg.sender, 100000000000000000000000);

        owner = msg.sender;
        interval = 3600;
    }

    function mintToken() public {
        require(
            lastMintTime[msg.sender] == 0 ||
                block.timestamp > lastMintTime[msg.sender] + interval,
            "You need to wait an hour between mints"
        );
        _mint(msg.sender, 100000000000000000000);
        lastMintTime[msg.sender] = block.timestamp;
    }

    function ownerMint(address _target, uint256 _amount) public onlyOwner {
        _mint(_target, _amount);
    }

    function canMint(address _address) public view returns (bool) {
        return
            lastMintTime[_address] == 0 ||
            block.timestamp > lastMintTime[_address] + interval;
    }

    function setInterval(uint _newInterval) public onlyOwner {
        interval = _newInterval;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
}
