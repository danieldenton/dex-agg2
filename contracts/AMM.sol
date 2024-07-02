//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
// import "./Token.sol";

interface IERC20 {
    function transfer(
        address recipient,
        uint256 amount
    ) external returns (bool);

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);
}

contract AMM {
    IERC20 public token1;
    IERC20 public token2;

    uint256 public token1Balance;
    uint256 public token2Balance;

    uint256 public K;

    uint256 public totalShares;
    mapping(address => uint) public shares;
    uint256 constant PRECISION = 10 ** 18;

    event Swap(
        address swapCaller,
        address tokenGive,
        uint256 tokenGiveAmount,
        address tokenGet,
        uint256 tokenGetAmount,
        uint256 token1Balance,
        uint256 token2Balance,
        uint256 timestamp
    );

    constructor(IERC20 _token1, IERC20 _token2) {
        token1 = _token1;
        token2 = _token2;
    }

    //What does the original liquididty base it's price on?
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

    function calculateTokenDeposit(
        address _token1Address,
        uint256 _token1Amount,
        address _token2Address
    ) public view returns (uint256 token2Amount) {
        IERC20 _token1Contract = IERC20(_token1Address);
        IERC20 _token2Contract = IERC20(_token2Address);
        uint256 _token1Balance = _token1Contract.balanceOf(address(this));
        uint256 _token2Balance = _token2Contract.balanceOf(address(this));
        token2Amount = (_token2Balance * _token1Amount) / _token1Balance;
    }

    function calculateFee(
        uint256 _amount
    ) public pure returns (uint256 fee) {
        fee = (_amount * 3) / 10000; // 0.03% fee
    }

    function calculateTokenSwap(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public view returns (uint256 tokenGetAmount, uint256 fee) {
        IERC20 _tokenGiveContract = IERC20(_tokenGiveAddress);
        IERC20 _tokenGetContract = IERC20(_tokenGetAddress);

        uint256 tokenGiveContractBalance = _tokenGiveContract.balanceOf(
            address(this)
        );
        uint256 tokenGetContractBalance = _tokenGetContract.balanceOf(
            address(this)
        );

        require(
            tokenGiveContractBalance > 0 && tokenGetContractBalance > 0,
            "Insufficient liquidity to trade this pair"
        );

        fee = calculateFee(_amount);
        uint256 _amountAfterFee = _amount - fee;

        uint256 tokenGiveContractBalanceAfter = tokenGiveContractBalance +
            _amountAfterFee;
        uint tokenGetContractBalanceAfter = K / tokenGiveContractBalanceAfter;
        tokenGetAmount = tokenGetContractBalance - tokenGetContractBalanceAfter;

        if (tokenGetAmount == tokenGetContractBalance) {
            tokenGetAmount--;
        }

        require(
            tokenGetAmount < tokenGetContractBalance,
            "Cannot exceed pool balance"
        );
    }

    function swapToken(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) external {
        IERC20 _tokenGiveContract = IERC20(_tokenGiveAddress);
        IERC20 _tokenGetContract = IERC20(_tokenGetAddress);

        (uint256 _tokenGetAmount, ) = calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amount
        );
        _tokenGiveContract.transferFrom(msg.sender, address(this), _amount);

        if (address(token1) == _tokenGiveAddress) {
            token1Balance += _amount;
            token2Balance -= _tokenGetAmount;
        } else {
            token2Balance += _amount;
            token1Balance -= _tokenGetAmount;
        }

        _tokenGetContract.transfer(msg.sender, _tokenGetAmount);

        emit Swap(
            msg.sender,
            _tokenGiveAddress,
            _amount,
            _tokenGetAddress,
            _tokenGetAmount,
            token1Balance,
            token2Balance,
            block.timestamp
        );
    }

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
