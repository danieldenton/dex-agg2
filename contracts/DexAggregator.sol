// SPDX-License-Identifier: GPL-2.0-or-later
pragma solidity =0.7.6;
pragma abicoder v2;

import "@uniswap/v3-periphery/contracts/interfaces/ISwapRouter.sol";
import "@uniswap/v3-periphery/contracts/libraries/TransferHelper.sol";

contract DexAggregator {
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address public constant WETH9 = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address public constant USDC = 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48;
    uint24 public constant poolFee = 3000;
    address public owner;

    constructor(address[] memory _routers, uint16 _defaultSlippagePercent) {
        routers = _routers;
        owner = msg.sender;
        defaultSlippagePercent = _defaultSlippagePercent;
    }

    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    // path is going to be 2 token addresses in an array
    // router is the dex address
    function dexSelector(
        address[] memory _path,
        uint256 _amount
    ) public view returns (address chosenDex, uint256 highestReturnAmount) {
        // ExactInputSingleParams(_path[0], _path[1], poolFee, msg.sender, block.timestamp + 1 minute, _amount, amountOutMinimum, sqrtPriceLimitX96)

        // not sure how this works below. The use of IswapRouter
        for (uint256 i = 0; i < routers.length; i++) {
            uint256 returnAmount = ISwapRouter(routers[i]).getAmountsOut(
                _amount,
                _path
            );
            if (returnAmount > highestReturnAmount) {
                highestReturnAmount = returnAmount;
                chosenDex = routers[i];
            }
        }
    }

    function swapWETHForDAI(
        uint256 amountIn
    ) external returns (uint256 amountOut) {
        // Transfer the specified amount of WETH9 to this contract.
        TransferHelper.safeTransferFrom(
            WETH9,
            msg.sender,
            address(this),
            amountIn
        );
        // Approve the router to spend WETH9.
        TransferHelper.safeApprove(WETH9, address(swapRouter), amountIn);
        // Note: To use this example, you should explicitly set slippage limits, omitting for simplicity
        uint256 minOut = /* Calculate min output */ 0;
        uint160 priceLimit = /* Calculate price limit */ 0;
        // Create the params that will be used to execute the swap
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: WETH9,
                tokenOut: DAI,
                fee: feeTier,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: minOut,
                sqrtPriceLimitX96: priceLimit
            });
        // The call to `exactInputSingle` executes the swap.
        amountOut = swapRouter.exactInputSingle(params);
    }
}
