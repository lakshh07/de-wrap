// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract DewrapPaymentCollector is Ownable, ReentrancyGuard {
    bool public paused;

    struct Invoice {
        bool paid;
        uint256 amount;
        address token; // address(0) = native token
        address payer;
    }

    mapping(string => Invoice) public invoices;

    event PaymentReceived(
        address indexed payer,
        string invoiceId,
        address token,
        uint256 amount
    );

    event NativePaymentReceived(
        address indexed payer,
        string invoiceId,
        uint256 amount
    );

    event TokenWithdrawn(address token, address to, uint256 amount);
    event NativeWithdrawn(address to, uint256 amount);
    event Paused(address indexed by);
    event Unpaused(address indexed by);

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    constructor() Ownable(msg.sender) {}

    function pay(
        string calldata invoiceId,
        address token,
        uint256 amount
    ) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be > 0");
        require(token != address(0), "Invalid token");
        require(!invoices[invoiceId].paid, "Invoice already paid");

        invoices[invoiceId] = Invoice({
            paid: true,
            amount: amount,
            token: token,
            payer: msg.sender
        });

        bool success = IERC20(token).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        require(success, "Token transfer failed");

        emit PaymentReceived(msg.sender, invoiceId, token, amount);
    }

    function payNative(
        string calldata invoiceId
    ) external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "No native token sent");
        require(!invoices[invoiceId].paid, "Invoice already paid");

        invoices[invoiceId] = Invoice({
            paid: true,
            amount: msg.value,
            token: address(0),
            payer: msg.sender
        });

        emit NativePaymentReceived(msg.sender, invoiceId, msg.value);
    }

    function withdraw(
        address token,
        address to,
        uint256 amount
    ) external nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        bool success = IERC20(token).transfer(to, amount);
        require(success, "Withdraw failed");

        emit TokenWithdrawn(token, to, amount);
    }

    function withdrawNative(
        address payable to,
        uint256 amount
    ) external nonReentrant {
        require(to != address(0), "Invalid recipient");
        require(amount > 0, "Amount must be > 0");

        (bool success, ) = to.call{value: amount}("");
        require(success, "Native withdraw failed");

        emit NativeWithdrawn(to, amount);
    }

    function getTokenBalance(address token) external view returns (uint256) {
        return IERC20(token).balanceOf(address(this));
    }

    function pause() external onlyOwner {
        require(!paused, "Already paused");
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() external onlyOwner {
        require(paused, "Not paused");
        paused = false;
        emit Unpaused(msg.sender);
    }

    // fallback to accept ETH directly (optional)
    receive() external payable {}
}
