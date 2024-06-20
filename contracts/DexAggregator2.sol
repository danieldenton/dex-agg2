//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

interface IUniswapV2Router {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface ISushiswapRouter {
    function getAmountsOut(uint amountIn, address[] calldata path) external view returns (uint[] memory amounts);
    function swapExactTokensForTokens(
        uint amountIn,
        uint amountOutMin,
        address[] calldata path,
        address to,
        uint deadline
    ) external returns (uint[] memory amounts);
}

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function approve(address spender, uint256 amount) external returns (bool);
}

contract DexAggregator2 {
    IUniswapV2Router public uniswapRouter;
    ISushiswapRouter public sushiswapRouter;

    constructor(address _uniswapRouter, address _sushiswapRouter) {
        uniswapRouter = IUniswapV2Router(_uniswapRouter);
        sushiswapRouter = ISushiswapRouter(_sushiswapRouter);
    }

    function getBestPrice(address tokenIn, address tokenOut, uint amountIn) public view returns (uint uniswapAmountOut, uint sushiswapAmountOut) {
        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        uint[] memory uniswapAmountsOut = uniswapRouter.getAmountsOut(amountIn, path);
        uint[] memory sushiswapAmountsOut = sushiswapRouter.getAmountsOut(amountIn, path);

        uniswapAmountOut = uniswapAmountsOut[1];
        sushiswapAmountOut = sushiswapAmountsOut[1];
    }

    function swap(address tokenIn, address tokenOut, uint amountIn, uint minAmountOut) public {
        (uint uniswapAmountOut, uint sushiswapAmountOut) = getBestPrice(tokenIn, tokenOut, amountIn);

        address[] memory path = new address[](2);
        path[0] = tokenIn;
        path[1] = tokenOut;

        IERC20(tokenIn).transferFrom(msg.sender, address(this), amountIn);

        if (uniswapAmountOut >= sushiswapAmountOut && uniswapAmountOut >= minAmountOut) {
            IERC20(tokenIn).approve(address(uniswapRouter), amountIn);
            uniswapRouter.swapExactTokensForTokens(amountIn, minAmountOut, path, msg.sender, block.timestamp);
        } else if (sushiswapAmountOut >= minAmountOut) {
            IERC20(tokenIn).approve(address(sushiswapRouter), amountIn);
            sushiswapRouter.swapExactTokensForTokens(amountIn, minAmountOut, path, msg.sender, block.timestamp);
        } else {
            revert("No DEX offers the minimum amount out");
        }
    }
}
