//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./AMM.sol";

contract DexAggregator {
    address owner;
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
        address to,
        address amm,
        address tokenGive,
        uint256 tokenGiveAmount,
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

    function calculateFee(uint256 _amount) public pure returns (uint256 fee) {
        fee = (_amount * 15) / 1000;
        // 1.5% fee
    }

    function ammSelector(
        address _tokenGiveAddress,
        address _tokenGetAddress,
        uint256 _amount
    ) public view returns (address chosenAMM, uint256 returnAmount) {
        uint256 amm1Return;
        uint256 amm2Return;

        uint256 _fee = calculateFee(_amount);
        uint256 _amountAfterFee = _amount - _fee;

        amm1Return = amm1.calculateTokenSwap(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amountAfterFee
        );
        amm2Return = amm2.calculateTokenSwap(
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
    ) public returns (uint256 tokenGetAmount) {
        AMM _amm;
        IERC20 _tokenGiveContract = IERC20(_tokenGiveAddress);
        IERC20 _tokenGetContract = IERC20(_tokenGetAddress);

        require(
            _amount <= _tokenGiveContract.balanceOf(msg.sender),
            "Insufficient funds"
        );

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

        uint256 _fee = calculateFee(_amount);
        uint256 _amountAfterFee = _amount - _fee;
        tokenBalances[_tokenGiveAddress] += _fee;

        _tokenGiveContract.approve(address(_amm), _amountAfterFee);

        tokenGetAmount = _amm.swapToken(
            _tokenGiveAddress,
            _tokenGetAddress,
            _amountAfterFee
        );

        _tokenGetContract.transfer(msg.sender, tokenGetAmount);

        emit Swap(
            msg.sender,
            address(this),
            address(_amm),
            _tokenGiveAddress,
            _amount,
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
