// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract DeWrap is Ownable, ReentrancyGuard {
    error UserNotFound();
    error WalletAlreadyLinked();
    error WalletNotLinked();
    error NotUserWallet();
    error InvalidInput();
    error InvoiceNotFound();
    error Unauthorized();

    event UserRegistered(
        bytes32 indexed userId,
        address indexed wallet,
        string name,
        string profession
    );
    event UserProfileUpdated(
        bytes32 indexed userId,
        string name,
        string profession
    );
    event WalletLinked(bytes32 indexed userId, address indexed wallet);
    event WalletUnlinked(bytes32 indexed userId, address indexed wallet);
    event InvoiceAdded(
        bytes32 indexed userId,
        bytes32 indexed id,
        address payer,
        string details,
        uint256 amount,
        address targetToken,
        string targetChain,
        uint256 createdAt
    );
    event InvoiceUpdated(
        bytes32 indexed userId,
        bytes32 indexed id,
        INVOICE_STATUS status,
        uint256 updatedAt
    );
    event PayoutAdded(
        bytes32 indexed userId,
        bytes32 payoutId,
        uint256 createdAt
    );
    event PayoutUpdated(
        bytes32 indexed userId,
        bytes32 payoutId,
        address sender,
        uint256 amountPaid,
        string sourceChain,
        address sourceToken,
        bytes32 txHash,
        uint256 updatedAt
    );
    event PayoutStatusUpdated(
        bytes32 indexed userId,
        bytes32 payoutId,
        uint256 amountPaid,
        PAYOUT_STATUS status,
        uint256 updatedAt
    );
    event PreferencesUpdated(
        bytes32 indexed userId,
        address preferredToken,
        string preferredChain,
        bool dcaEnabled
    );

    event InvestmentAdded(bytes32 indexed userId, uint256 investmentId);
    event InvestmentUpdated(bytes32 indexed userId, uint256 investmentId);
    event DCAJobAdded(bytes32 indexed userId, uint256 jobId);
    event DCAJobUpdated(bytes32 indexed userId, uint256 jobId);

    enum INVOICE_STATUS {
        PENDING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    enum PAYOUT_STATUS {
        PENDING,
        ONGOING,
        COMPLETED,
        FAILED,
        CANCELLED
    }

    struct Investment {
        bytes32 id;
        address token;
        uint256 amount;
        string chain;
        uint256 createdAt;
    }

    struct Invoice {
        bytes32 id;
        string details;
        address payer;
        string payerName;
        INVOICE_STATUS status;
        uint256 amount;
        address targetToken;
        string targetChain;
        uint256 createdAt;
        uint256 updatedAt;
        bytes32 payoutId;
    }

    struct Payout {
        bytes32 id;
        bytes32 invoiceId;
        address payer;
        address sender;
        uint256 invoiceAmount;
        uint256 amountReceived;
        uint256 amountPaid;
        string targetChain;
        address targetToken;
        string sourceChain;
        address sourceToken;
        string direction;
        bytes32 txHash;
        PAYOUT_STATUS status;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct DCAJob {
        bytes32 id;
        address fromToken;
        address toToken;
        uint256 lastRun;
        uint256 nextRun;
        string status;
        uint256 totalAmount;
        uint256 amountPerRun;
        uint256 interval;
        uint256 runs;
        uint256 createdAt;
        uint256 updatedAt;
    }

    struct Preferences {
        address preferredToken;
        string preferredChain;
        bool dcaEnabled;
    }

    struct UserProfile {
        string name;
        string profession;
        uint256 totalBalance;
        uint256 totalWithdrawn;
        Preferences preferences;
        mapping(bytes32 => Investment) investments;
        bytes32[] investmentIds;
        mapping(bytes32 => Payout) payouts;
        bytes32[] payoutIds;
        mapping(bytes32 => Invoice) invoices;
        bytes32[] invoiceIds;
        mapping(bytes32 => DCAJob) dcaJobs;
        bytes32 dcaJobIds;
        mapping(address => bool) linkedWallets;
    }

    mapping(bytes32 => UserProfile) private userProfiles; // userId => profile
    mapping(address => bytes32) public walletToUserId; // wallet => userId
    mapping(bytes32 => address[]) public userWallets; // userId => wallets

    modifier onlyUser(bytes32 userId) {
        if (walletToUserId[msg.sender] != userId) revert Unauthorized();
        _;
    }

    constructor() Ownable(msg.sender) {}

    function registerUser(
        string calldata name,
        string calldata profession
    ) external nonReentrant {
        if (bytes(name).length == 0) revert InvalidInput();
        if (bytes(profession).length == 0) revert InvalidInput();
        if (walletToUserId[msg.sender] != bytes32(0))
            revert WalletAlreadyLinked();

        bytes32 id = keccak256(
            abi.encodePacked(msg.sender, name, profession, block.timestamp)
        );

        UserProfile storage profile = userProfiles[id];
        profile.name = name;
        profile.profession = profession;
        profile.linkedWallets[msg.sender] = true;
        userWallets[id].push(msg.sender);
        walletToUserId[msg.sender] = id;
        emit UserRegistered(id, msg.sender, name, profession);
    }

    function updateUserProfile(
        bytes32 userId,
        string calldata name,
        string calldata profession
    ) external nonReentrant onlyUser(userId) {
        if (bytes(name).length == 0) revert InvalidInput();
        if (bytes(profession).length == 0) revert InvalidInput();
        if (userId == bytes32(0)) revert InvalidInput();
        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        profile.name = name;
        profile.profession = profession;
        emit UserProfileUpdated(userId, name, profession);
    }

    function getUserProfile(
        bytes32 userId
    )
        external
        view
        returns (
            string memory name,
            string memory profession,
            uint256 totalBalance,
            uint256 totalWithdrawn,
            Preferences memory preferences,
            uint256 investmentsCount,
            uint256 payoutsCount,
            uint256 invoicesCount,
            uint256 dcaJobsCount
        )
    {
        if (userId == bytes32(0)) revert InvalidInput();
        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        name = profile.name;
        profession = profile.profession;
        totalBalance = profile.totalBalance;
        totalWithdrawn = profile.totalWithdrawn;
        preferences = profile.preferences;
        investmentsCount = profile.investmentIds.length;
        payoutsCount = profile.payoutIds.length;
        invoicesCount = profile.invoiceIds.length;
        dcaJobsCount = profile.dcaJobIds.length;
    }

    function getUserWallets(
        bytes32 userId
    ) external view returns (address[] memory) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (bytes(userProfiles[userId].name).length == 0) revert UserNotFound();

        return userWallets[userId];
    }

    function getUserIdByWallet(address wallet) external view returns (bytes32) {
        if (wallet == address(0)) revert InvalidInput();

        return walletToUserId[wallet];
    }

    // --- Wallet Management ---
    function linkWallet(
        bytes32 userId,
        address wallet
    ) external onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (wallet == address(0)) revert InvalidInput();
        if (userProfiles[userId].linkedWallets[wallet])
            revert WalletAlreadyLinked();
        if (walletToUserId[wallet] != bytes32(0)) revert WalletAlreadyLinked();

        userProfiles[userId].linkedWallets[wallet] = true;
        userWallets[userId].push(wallet);
        walletToUserId[wallet] = userId;

        emit WalletLinked(userId, wallet);
    }

    function unlinkWallet(
        bytes32 userId,
        address wallet
    ) external onlyUser(userId) {
        if (!userProfiles[userId].linkedWallets[wallet])
            revert WalletNotLinked();
        if (wallet == msg.sender) revert NotUserWallet();
        userProfiles[userId].linkedWallets[wallet] = false;
        walletToUserId[wallet] = bytes32(0);
        // Remove from userWallets array (gas heavy, but needed for full unlink)
        address[] storage wallets = userWallets[userId];
        for (uint256 i = 0; i < wallets.length; i++) {
            if (wallets[i] == wallet) {
                wallets[i] = wallets[wallets.length - 1];
                wallets.pop();
                break;
            }
        }

        emit WalletUnlinked(userId, wallet);
    }

    // --- Invoice Management ---
    function createInvoice(
        bytes32 userId,
        string calldata details,
        string calldata payerName,
        uint256 amount,
        address targetToken,
        string calldata targetChain
    ) external nonReentrant onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (amount <= 0) revert InvalidInput();
        if (targetToken == address(0)) revert InvalidInput();
        if (bytes(targetChain).length == 0) revert InvalidInput();
        if (bytes(details).length == 0) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bytes32 id = keccak256(
            abi.encodePacked(
                msg.sender,
                profile.invoiceIds.length,
                block.timestamp
            )
        );

        profile.invoiceIds.push(id);

        Invoice storage inv = profile.invoices[id];
        inv.id = id;
        inv.details = details;
        inv.payer = msg.sender;
        inv.payerName = payerName;
        inv.status = INVOICE_STATUS.PENDING;
        inv.amount = amount;
        inv.targetToken = targetToken;
        inv.targetChain = targetChain;
        inv.createdAt = block.timestamp;
        inv.updatedAt = block.timestamp;

        addPayout(userId, id);

        emit InvoiceAdded(
            userId,
            id,
            msg.sender,
            details,
            amount,
            targetToken,
            targetChain,
            inv.createdAt
        );
    }

    function updateInvoice(
        bytes32 userId,
        bytes32 invoiceId,
        INVOICE_STATUS status
    ) external nonReentrant onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (invoiceId == bytes32(0)) revert InvalidInput();
        if (uint8(status) > uint8(type(INVOICE_STATUS).max))
            revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bool found = false;
        for (uint256 i = 0; i < profile.invoiceIds.length; i++) {
            if (profile.invoiceIds[i] == invoiceId) {
                found = true;
                break;
            }
        }

        if (!found) revert InvoiceNotFound();

        Invoice storage inv = profile.invoices[invoiceId];
        inv.status = status;
        inv.updatedAt = block.timestamp;

        emit InvoiceUpdated(userId, invoiceId, status, inv.updatedAt);
    }

    function getInvoice(
        bytes32 userId,
        bytes32 invoiceId
    ) external view returns (Invoice memory, Payout memory) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (invoiceId == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bool found = false;
        for (uint256 i = 0; i < profile.invoiceIds.length; i++) {
            if (profile.invoiceIds[i] == invoiceId) {
                found = true;
                break;
            }
        }
        if (!found) revert InvoiceNotFound();

        Invoice memory inv = profile.invoices[invoiceId];
        Payout memory payout = profile.payouts[inv.payoutId];

        return (inv, payout);
    }

    function getAllInvoices(
        bytes32 userId
    ) external view returns (Invoice[] memory, Payout[] memory) {
        if (userId == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        uint256 invoiceCount = profile.invoiceIds.length;
        uint256 payoutCount = profile.payoutIds.length;

        Invoice[] memory result = new Invoice[](invoiceCount);
        Payout[] memory payoutsArr = new Payout[](payoutCount);

        for (uint256 i = 0; i < invoiceCount; i++) {
            result[i] = profile.invoices[profile.invoiceIds[i]];
            if (result[i].payoutId != bytes32(0)) {
                for (uint256 j = 0; j < payoutCount; j++) {
                    if (
                        profile.payouts[profile.payoutIds[j]].id ==
                        result[i].payoutId
                    ) {
                        payoutsArr[i] = profile.payouts[profile.payoutIds[j]];
                        break;
                    }
                }
            }
        }
        return (result, payoutsArr);
    }

    // --- Payout Management ---
    function addPayout(bytes32 userId, bytes32 invoiceId) internal {
        if (invoiceId == bytes32(0)) revert InvalidInput();
        if (userId == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        Invoice storage inv = profile.invoices[invoiceId];

        bytes32 id = keccak256(
            abi.encodePacked(
                msg.sender,
                profile.payoutIds.length,
                block.timestamp
            )
        );

        profile.payoutIds.push(id);
        inv.payoutId = id;

        Payout storage p = profile.payouts[id];
        p.id = id;
        p.payer = msg.sender;
        p.invoiceId = invoiceId;
        p.invoiceAmount = inv.amount;
        p.status = PAYOUT_STATUS.PENDING;
        p.targetChain = inv.targetChain;
        p.targetToken = inv.targetToken;
        p.createdAt = block.timestamp;
        p.updatedAt = block.timestamp;

        emit PayoutAdded(userId, id, p.createdAt);
    }

    function updatePayout(
        bytes32 userId,
        bytes32 payoutId,
        address sender,
        uint256 amountPaid,
        string calldata sourceChain,
        address sourceToken,
        bytes32 txHash
    ) external nonReentrant onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (payoutId == bytes32(0)) revert InvalidInput();
        if (sender == address(0)) revert InvalidInput();
        if (amountPaid <= 0) revert InvalidInput();
        if (bytes(sourceChain).length == 0) revert InvalidInput();
        if (sourceToken == address(0)) revert InvalidInput();
        if (txHash == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bool found = false;
        for (uint256 i = 0; i < profile.payoutIds.length; i++) {
            if (profile.payoutIds[i] == payoutId) {
                found = true;
                break;
            }
        }

        if (!found) revert InvalidInput();

        Payout storage p = profile.payouts[payoutId];
        p.sender = sender;
        p.amountPaid = amountPaid;
        p.sourceChain = sourceChain;
        p.sourceToken = sourceToken;
        p.status = PAYOUT_STATUS.ONGOING;
        p.updatedAt = block.timestamp;
        p.txHash = txHash;

        emit PayoutUpdated(
            userId,
            payoutId,
            sender,
            amountPaid,
            sourceChain,
            sourceToken,
            txHash,
            p.updatedAt
        );
    }

    function updatePayoutStatus(
        bytes32 userId,
        bytes32 payoutId,
        uint256 amountPaid,
        PAYOUT_STATUS status
    ) external nonReentrant onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (payoutId == bytes32(0)) revert InvalidInput();
        if (amountPaid <= 0) revert InvalidInput();
        if (uint8(status) > uint8(type(PAYOUT_STATUS).max))
            revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bool found = false;
        for (uint256 i = 0; i < profile.payoutIds.length; i++) {
            if (profile.payoutIds[i] == payoutId) {
                found = true;
                break;
            }
        }

        if (!found) revert InvalidInput();

        Payout storage p = profile.payouts[payoutId];
        p.amountPaid = amountPaid;
        p.status = status;
        p.updatedAt = block.timestamp;

        emit PayoutStatusUpdated(
            userId,
            payoutId,
            amountPaid,
            status,
            p.updatedAt
        );
    }

    function getPayout(
        bytes32 userId,
        bytes32 payoutId
    ) external view returns (Payout memory) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (payoutId == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        bool found = false;
        for (uint256 i = 0; i < profile.payoutIds.length; i++) {
            if (profile.payoutIds[i] == payoutId) {
                found = true;
                break;
            }
        }
        if (!found) revert InvalidInput();

        return profile.payouts[payoutId];
    }

    function getAllPayouts(
        bytes32 userId
    ) external view returns (Payout[] memory) {
        if (userId == bytes32(0)) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        uint256 payoutCount = profile.payoutIds.length;

        Payout[] memory result = new Payout[](payoutCount);
        for (uint256 i = 0; i < payoutCount; i++) {
            result[i] = profile.payouts[profile.payoutIds[i]];
        }

        return result;
    }

    // --- Preferences Management ---
    function setPreferences(
        bytes32 userId,
        address preferredToken,
        string calldata preferredChain,
        bool dcaEnabled
    ) external onlyUser(userId) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (preferredToken == address(0)) revert InvalidInput();
        if (bytes(preferredChain).length == 0) revert InvalidInput();

        UserProfile storage profile = userProfiles[userId];
        if (bytes(profile.name).length == 0) revert UserNotFound();

        profile.preferences.preferredToken = preferredToken;
        profile.preferences.preferredChain = preferredChain;
        profile.preferences.dcaEnabled = dcaEnabled;

        emit PreferencesUpdated(
            userId,
            preferredToken,
            preferredChain,
            dcaEnabled
        );
    }

    function getPreferences(
        bytes32 userId
    ) external view returns (Preferences memory) {
        if (userId == bytes32(0)) revert InvalidInput();
        if (bytes(userProfiles[userId].name).length == 0) revert UserNotFound();

        return userProfiles[userId].preferences;
    }
}
