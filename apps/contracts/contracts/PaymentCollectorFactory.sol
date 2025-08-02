// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {CREATE3} from "solady/src/utils/CREATE3.sol";
import {DewrapPaymentCollector} from "./DewrapPaymentCollector.sol";

contract PaymentCollectorFactory {
    address public immutable implementation;

    constructor() {
        implementation = address(new DewrapPaymentCollector());
    }

    /// @notice Deploy via CREATE3 — only `salt` affects the clone address
    function deploy(bytes32 salt) public returns (address deployed) {
        bytes memory code = abi.encodePacked(
            type(DewrapPaymentCollector).creationCode
        );
        deployed = CREATE3.deployDeterministic(code, salt);
    }

    /// @notice Compute the deterministic address (before deploying)
    function compute(bytes32 salt) public view returns (address) {
        return CREATE3.predictDeterministicAddress(salt, address(this));
    }
}
