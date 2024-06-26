//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AMM.sol";

contract DexAggregator {
    AMM public amm1;
    AMM public amm2;
    uint256 public constant feePercentage = 3;
    uint256 public constant feeDenominator = 10000;

    constructor(AMM _amm1, AMM _amm2) {
        amm1 = _amm1;
        amm2 = _amm2;
    }

    event Swap(
        address from,
        address to,
        address amm,
        address tokenGive,
        uint256 tokenGiveAmount,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 timestamp
    );

    function ammSelector(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public view returns (address chosenAMM, uint256 returnAmount) {
        uint256 amm1Return;
        uint256 amm2Return;

        amm1Return = amm1.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );
        amm2Return = amm2.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
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
    ) public returns (uint256 tokenGetAmount) {
        AMM _amm;
        IERC20 _tokenGiveContract = IERC20(_tokenGiveAddress);
        IERC20 _tokenGetContract = IERC20(_tokenGetAddress);

        (address chosenAMM, ) = ammSelector(
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

        uint256 fee = (_amount * feePercentage) / feeDenominator;
        uint256 amountAfterFee = _amount - fee;

        _tokenGetContract.approve(address(_amm), amountAfterFee);

        tokenGetAmount = _amm.swapToken(
            _tokenGiveAddress,
            _tokenGetAddress,
            amountAfterFee
        );

        _tokenGetContract.transfer(msg.sender, tokenGetAmount);
    }
}
