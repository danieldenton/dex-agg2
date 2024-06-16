//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";
import "./AMM.sol";

contract DexAggrregator {
    Token public token1;
    Token public token2;
    AMM public amm1;
    AMM public amm2;

   
    uint256 constant PRECISION = 10 ** 18;

    constructor(Token _token1, Token _token2 AMM _amm1, AMM _amm2) {
        token1 = _token1;
        token2 = _token2;
        amm1 = _amm1;
        amm2 = _amm2;
    }

}
