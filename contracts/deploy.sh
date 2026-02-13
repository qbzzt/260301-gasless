#! /usr/bin/bash

PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

GREETER_CONTRACT=`forge create src/Greeter.sol:Greeter --broadcast --private-key $PRIVATE_KEY --constructor-args "Hello" | awk '/Deployed to:/ {print $3}'`

echo $GREETER_CONTRACT