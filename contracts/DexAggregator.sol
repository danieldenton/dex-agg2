//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./AMM.sol";

contract DexAggregator {
    AMM public amm1;
    AMM public amm2;

    uint256 constant PRECISION = 10 ** 18;

    constructor(AMM _amm1, AMM _amm2) {
        amm1 = _amm1;
        amm2 = _amm2;
    }

    function ammSelector(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public view returns (address chosenAMM, uint256 cost) {
        uint256 amm1Cost;
        uint256 amm2Cost;

        amm1Cost = amm1.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );
        amm2Cost = amm2.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );

        if (amm1Cost < amm2Cost) {
            chosenAMM = address(amm1);
            cost = amm1Cost;
        } else {
            chosenAMM = address(amm2);
            cost = amm2Cost;
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
        _tokenGiveContract.approve(chosenAMM, _amount);

        tokenGetAmount = _amm.swapToken(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );

        _tokenGetContract.transfer(msg.sender, tokenGetAmount);
    }
}
