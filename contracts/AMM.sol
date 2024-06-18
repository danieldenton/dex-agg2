//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract AMM {
    Token public token1;
    Token public token2;

    uint256 public token1Balance;
    uint256 public token2Balance;
    uint256 public K;

    uint256 public totalShares;
    mapping(address => uint) public shares;
    uint256 constant PRECISION = 10 ** 18;

    event Swap(
        address user,
        address tokenGive,
        uint256 tokenGiveAmount,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 token1Balance,
        uint256 token2Balance,
        uint256 timestamp
    );

    constructor(Token _token1, Token _token2) {
        token1 = _token1;
        token2 = _token2;
    }

    function addLiquidity(
        uint256 _token1Amount,
        uint256 _token2Amount
    ) external {
        // Deposit tokens
        require(
            token1.transferFrom(msg.sender, address(this), _token1Amount),
            "failed transfer from token 1"
        );
        require(
            token2.transferFrom(msg.sender, address(this), _token2Amount),
            "failed transfer from token 2"
        );

        // Issue shares
        uint256 share;
        if (totalShares == 0) {
            share = 100 * PRECISION;
        } else {
            uint256 share1 = (totalShares * _token1Amount) / token1Balance;
            uint256 share2 = (totalShares * _token2Amount) / token2Balance;
            require(
                (share1 / 10 ** 3) == (share2 / 10 ** 3),
                "must provide equal token amounts"
            );
            share = share1;
        }

        // Manage pool
        token1Balance += _token1Amount;
        token2Balance += _token2Amount;
        K = token1Balance * token2Balance;

        // Update shares
        totalShares += share;
        shares[msg.sender] += share;
    }

    function calculateToken2Deposit(
        uint256 _token1Amount
    ) public view returns (uint256 token2Amount) {
        token2Amount = (token2Balance * _token1Amount) / token1Balance;
    }

    function calculateToken1Deposit(
        uint256 _token2Amount
    ) public view returns (uint256 token1Amount) {
        token1Amount = (token1Balance * _token2Amount) / token2Balance;
    }

    function calculateTokenSwap(
        address _tokeGiveAddress, address _tokenGetAddress, uint256 _amount
    ) public view returns (uint256 tokenGetAmount) {
        uint256 tokenGiveContractBalance = _tokeGiveAddress.balanceOf(address(this));
        uint256 tokenGetContractBalance = _tokenGetAddress.balanceOf(address(this));


        uint256 tokenGiveContractAfter = tokenGetContractBalance + _amount;
        uint tokenGetContractAfter = K / tokenGiveContractAfter;
        tokenGetAmount = tokenGetContractBalance - tokenGetContractAfter;

        if (tokenGetAmount == tokenGetContractBalance) {
            tokenGetAmount--;
        }

        require(tokenGetAmount < tokenGetContractBalance, "cannot exceed pool balance");
    }

    function swapToken(
       address _tokeGiveAddress, address _tokenGetAddress, uint256 _amount
    ) external returns (uint256 tokenGetAmount) {
        uint256 tokenGiveContractBalance = _tokeGiveAddress.balanceOf(address(this));
        uint256 tokenGetContractBalance = _tokenGetAddress.balanceOf(address(this));

        // Token _tokenGive;
        // if (_tokenGiveAddress == address(token1)) {
        //     _tokenGive = token1;
        // } else {
        //     _tokenGive = token2;
        // }

        // Token _tokenGet;
        // if (_tokenGetAddress == address(token1)) {
        //     _tokenGet = token1;
        // } else {
        //     _tokenGet = token2;
        // }

        tokenGetAmount = calculateTokenSwap(address _tokeGiveAddress, address _tokenGetAddress uint256, _amount);
        _tokenGiveAddress.transferFrom(msg.sender, address(this), _token1Amount);
        tokenGiveContractBalance += _amount;
        tokenGetContractBalance -= tokenGetAmount;
        _tokenGetAddress.transfer(msg.sender, tokenGetAmount);

        emit Swap(
            msg.sender,
            _tokeGiveAddress,
            _amount,
            _tokenGetAddress,
            tokenGetAmount,
            tokenGiveContractBalance,
            tokenGetContractBalance,
            block.timestamp
        );
    }

    // function calculateToken2Swap(
    //     uint256 _token2Amount
    // ) public view returns (uint256 token1Amount) {
    //     uint256 token2After = token2Balance + _token2Amount;
    //     uint token1After = K / token2After;
    //     token1Amount = token1Balance - token1After;

    //     if (token1Amount == token1Balance) {
    //         token1Amount--;
    //     }

    //     require(token1Amount < token1Balance, "cannot exceed pool balance");
    // }

    // function swapToken2(
    //     uint256 _token2Amount
    // ) external returns (uint256 token1Amount) {
    //     token1Amount = calculateToken2Swap(_token2Amount);
    //     token2.transferFrom(msg.sender, address(this), _token2Amount);
    //     token2Balance += _token2Amount;
    //     token1Balance -= token1Amount;
    //     token1.transfer(msg.sender, token1Amount);

    //     emit Swap(
    //         msg.sender,
    //         address(token2),
    //         _token2Amount,
    //         address(token1),
    //         token1Amount,
    //         token1Balance,
    //         token2Balance,
    //         block.timestamp
    //     );
    // }

    function calculateWithdrawAmount(
        uint256 _share
    ) public view returns (uint256 token1Amount, uint256 token2Amount) {
        require(_share <= totalShares, "must be less than total shares");
        token1Amount = (_share * token1Balance) / totalShares;
        token2Amount = (_share * token2Balance) / totalShares;
    }

    function removeLiquidity(
        uint256 _share
    ) external returns (uint256 token1Amount, uint256 token2Amount) {
        require(
            _share <= shares[msg.sender],
            "cannot withdraw more shares than you have"
        );

        (token1Amount, token2Amount) = calculateWithdrawAmount(_share);

        shares[msg.sender] -= _share;
        totalShares -= _share;

        token1Balance -= token1Amount;
        token2Balance -= token2Amount;
        K = token1Balance * token2Balance;

        token1.transfer(msg.sender, token1Amount);
        token2.transfer(msg.sender, token2Amount);
    }
}
