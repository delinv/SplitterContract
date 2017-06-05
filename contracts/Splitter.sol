pragma solidity ^0.4.8;

// Splitter contract

contract Splitter {
	address splitAddress1;
	address splitAddress2;
	address owner;

	event SplitEvent(address indexed from, uint amount);

	function Splitter(address addr1, address addr2) {
		owner = msg.sender;
		splitAddress1 = addr1;
		splitAddress2 = addr2;
		//splitAddress[1] = addr2;
	}

 	function split()  payable returns (bool) {
 		uint splitAmount = msg.value / 2;
 		if (splitAmount > 0) {
 			splitAddress1.transfer(splitAmount);
 			splitAddress2.transfer(splitAmount);
			SplitEvent(msg.sender, splitAmount);
 			return true;
 		} else {
 			return false;
 		}	
 	}

	function getSplitAddress1() returns (address) {
		return splitAddress1;
	}
	function getSplitAddress2() returns (address) {
		return splitAddress2;
	}

	function kill() {
		if (msg.sender == owner) {
			selfdestruct(owner);
		}
	}
}
