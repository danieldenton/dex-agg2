//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AMM.sol";

contract DexAggregator {
    address public owner;
    AMM public amm1;
    AMM public amm2;
    mapping(address => uint) public tokenBalances;

    constructor(AMM _amm1, AMM _amm2) {
        owner = msg.sender;
        amm1 = _amm1;
        amm2 = _amm2;
    }

    event Swap(
        address from,
        address amm,
        address tokenGive,
        uint256 tokenGiveAmount,
        uint256 fee,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 timestamp
    );

    event Withdrawal(
        address to,
        address tokenWithdrawn,
        uint256 amount,
        uint256 timestamp
    );

    function separateFee(
        uint256 _amount
    ) public pure returns (uint256 amountAfterFee, uint256 fee) {
        fee = (_amount * 3) / 10000; // .03% fee
        amountAfterFee = _amount - fee;
    }

    function ammSelector(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public view returns (address chosenAMM, uint256 returnAmount) {
        (uint256 _amountAfterFee, ) = separateFee(_amount);

        (uint256 amm1Return, ) = amm1.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amountAfterFee
        );
        (uint256 amm2Return, ) = amm2.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amountAfterFee
        );

        if (amm1Return > amm2Return) {
            chosenAMM = address(amm1);
            returnAmount = amm1Return;
        } else {
            chosenAMM = address(amm2);
            returnAmount = amm2Return;
        }
    }

    function swap(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public returns (bool success) {
        AMM _amm;
        IERC20 _tokenGiveContract = IERC20(_tokenGiveAddress);
        IERC20 _tokenGetContract = IERC20(_tokenGetAddress);

        (address chosenAMM, uint256 tokenGetAmount) = ammSelector(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );

        if (chosenAMM == address(amm1)) {
            _amm = amm1;
        } else {
            _amm = amm2;
        }

        _tokenGiveContract.transferFrom(msg.sender, address(this), _amount);

        (uint256 _amountAfterFee, uint256 _fee) = separateFee(_amount);

        tokenBalances[_tokenGiveAddress] += _fee;

        _tokenGiveContract.approve(address(_amm), _amountAfterFee);

        _amm.swapToken(_tokenGiveAddress, _tokenGetAddress, _amountAfterFee);

        _tokenGetContract.transfer(msg.sender, tokenGetAmount);

        success = true;

        emit Swap(
            msg.sender,
            address(_amm),
            _tokenGiveAddress,
            _amount,
            _fee,
            _tokenGetAddress,
            tokenGetAmount,
            block.timestamp
        );
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    function withdrawTokenBalance(
        address _tokenToWithdraw
    ) public onlyOwner returns (bool success) {
        IERC20 _tokenContract = IERC20(_tokenToWithdraw);
        uint256 amountToWithdraw = tokenBalances[_tokenToWithdraw];

        _tokenContract.transfer(owner, amountToWithdraw);
        tokenBalances[_tokenToWithdraw] = 0;
        success = true;

        emit Withdrawal(
            msg.sender,
            _tokenToWithdraw,
            amountToWithdraw,
            block.timestamp
        );
    }
}
