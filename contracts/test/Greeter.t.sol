// SPDX-License-Identifier: MIT
pragma solidity ^0.8.21;

import "forge-std/Test.sol";
import "../src/Greeter.sol";

contract GreeterTest is Test {
    Greeter greeter;

    // Test signer
    uint256 userPrivateKey;
    address user;

    function setUp() public {
        greeter = new Greeter("hello");

        // Use a deterministic private key for signing
        userPrivateKey = 0xA11CE;
        user = vm.addr(userPrivateKey);
    }

    function testSponsoredSetGreeting() public {
        // -----------------------------
        // 1. Prepare request
        // -----------------------------
        Greeter.GreetingRequest memory req =
            Greeter.GreetingRequest({greeting: "gm, world"});

        // -----------------------------
        // 2. Recompute the EIP-712 digest
        // -----------------------------
        bytes32 TYPEHASH =
            keccak256("GreetingRequest(string greeting)");

        bytes32 structHash = keccak256(
            abi.encode(
                TYPEHASH,
                keccak256(bytes(req.greeting))
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked(
                "\x19\x01",
                greeter.DOMAIN_SEPARATOR(),
                structHash
            )
        );

        // -----------------------------
        // 3. Sign digest with test key
        // -----------------------------
        (uint8 v, bytes32 r, bytes32 s) = vm.sign(userPrivateKey, digest);

        // -----------------------------
        // 4. Call sponsoredSetGreeting
        // -----------------------------
        vm.expectEmit(true, true, false, true);
        emit Greeter.SetGreeting(user, req.greeting);

        greeter.sponsoredSetGreeting(req, v, r, s);

        // -----------------------------
        // 5. Verify state change
        // -----------------------------
        assertEq(greeter.greet(), "gm, world");
    }

    function testSetGreeting() public {
        // Arrange
        string memory newGreeting = "hello from setGreeting";

        // Expect the event
        vm.expectEmit(true, true, false, true);
        emit Greeter.SetGreeting(address(this), newGreeting);

        // Act
        greeter.setGreeting(newGreeting);

        // Assert
        assertEq(greeter.greet(), newGreeting);
    }

}

