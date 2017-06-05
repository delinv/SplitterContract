#!/bin/bash

BASEDIR=$(dirname "$0")

# Run this once, but it does not hurt to run it every time
geth --datadir ~/.ethereum/net42 init $BASEDIR//genesis42.json

#geth --datadir ~/.ethereum/net42 account list

# Run this every time you start your Geth "42", and add flags here as you need
# unlock the first 5 accounts
geth --datadir ~/.ethereum/net42 --networkid 42 --rpc --rpcport 8545 --rpcaddr 0.0.0.0 --rpccorsdomain "*" --rpcapi "eth,web3,net,miner,debug" --unlock "0,1,2,3,4" --password $BASEDIR/password.txt console


OUT=$?
# It probably failed to start because there were not enough accounts. Create them.
if [ $OUT -eq 0 ];then
	echo ""
else
	for i in 0 1 2 3 4
	do
		geth --datadir ~/.ethereum/net42 --password $BASEDIR/password.txt account new 
	done
fi
