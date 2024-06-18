//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./AMM.sol";

contract DexAggregator {
    Token public token1;
    Token public token2;
    AMM public amm1;
    AMM public amm2;

    uint256 constant PRECISION = 10 ** 18;

    constructor(Token _token1, Token _token2, AMM _amm1, AMM _amm2) {
        token1 = _token1;
        token2 = _token2;
        amm1 = _amm1;
        amm2 = _amm2;
    }

    function ammSelector(
        address _token,
        uint256 _amount
    ) public view returns (address chosenAMM, uint256 cost) {
        uint256 amm1Cost;
        uint256 amm2Cost;

        if (_token == address(token1)) {
            amm1Cost = amm1.calculateToken1Swap(_amount);
            amm2Cost = amm2.calculateToken1Swap(_amount);
        } else {
            amm1Cost = amm1.calculateToken2Swap(_amount);
            amm2Cost = amm2.calculateToken2Swap(_amount);
        }

        if (amm1Cost < amm2Cost) {
            chosenAMM = address(amm1);
            cost = amm1Cost;
        } else {
            chosenAMM = address(amm2);
            cost = amm2Cost;
        }
    }

    function swap(
        address _token,
        uint256 _amount
    ) public returns (bool success) {
        AMM _amm;
        (address chosenAMM, uint256 cost) = ammSelector(_token, _amount);

        if (chosenAMM == address(amm1)) {
            _amm = amm1;
        } else {
            _amm = amm2;
        }
        
        // if (_token == address(token1)) {
        //     require(
        //         token1.balanceOf(msg.sender) >= _amount,
        //         "insufficient funds"
        //     );
        //     _amm.swapToken1(_amount);
        // } else {
        //     require(
        //         token2.balanceOf(msg.sender) >= _amount,
        //         "insufficient funds"
        //     );
        //     _amm.swapToken2(_amount);
        // }
    }
}
