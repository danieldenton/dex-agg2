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

    function getLowestToken1Cost(
        uint256 _token2Amount
    ) public view returns (uint256 token1Cost) {
        require(token2.balanceOf(msg.sender) >= _token2Amount, "insufficient funds");
        uint256 token1Amm1Cost = amm1.calculateToken2Swap(_token2Amount);
        uint256 token1Amm2Cost = amm2.calculateToken2Swap(_token2Amount);

        if (token1Amm1Cost < token1Amm2Cost) {
            token1Cost = token1Amm1Cost;
        } else {
            token1Cost = token1Amm2Cost;
        }
    }

    function getLowestToken2Cost(
        uint256 _token1Amount
    ) public view returns (uint256 token2Cost) {
        require(token1.balanceOf(msg.sender) >= _token1Amount, "insufficient funds");
        uint256 token2Amm1Cost = amm1.calculateToken1Swap(_token1Amount);
        uint256 token2Amm2Cost = amm2.calculateToken1Swap(_token1Amount);

        if (token2Amm1Cost < token2Amm2Cost) {
            token2Cost = token2Amm1Cost;
        } else {
            token2Cost = token2Amm2Cost;
        }
    }

}
