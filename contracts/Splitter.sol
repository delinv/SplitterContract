pragma solidity ^0.4.8;

// Splitter contract

contract Splitter {
	address public splitAddress1;
	address public splitAddress2;
	bool public isActive = true;
	address owner;

	event LogSplit(address indexed from, uint amount1, uint amount2);

	event LogSplitUtil(address indexed from, uint amount1, uint amount2);

	event LogActivationStateChange(bool state);

	modifier ifActive () {
        if (!isActive) {
            throw;
        }
        _;
    }

	function Splitter(address addr1, address addr2) {
		owner = msg.sender;
		splitAddress1 = addr1;
		splitAddress2 = addr2;
	}

 	function split()  payable ifActive() returns (bool) {		
 		uint splitAmount1 = msg.value / 2;
 		uint splitAmount2 = msg.value - splitAmount1;
 		if (splitAmount1 > 0) {
 			splitAddress1.transfer(splitAmount1);
 			splitAddress2.transfer(splitAmount2);
			LogSplit(msg.sender, splitAmount1, splitAmount2);
 			return true;
 		} else {
 			return false;
 		}	
 	}

 	function splitUtil(address addr1, address addr2)  payable ifActive() returns (bool) {
 		uint splitAmount1 = msg.value / 2;
 		uint splitAmount2 = msg.value - splitAmount1;
 		if (splitAmount1 > 0) {
 			addr1.transfer(splitAmount1);
 			addr2.transfer(splitAmount2);
			LogSplit(msg.sender, splitAmount1, splitAmount2);
 			return true;
 		} else {
 			return false;
 		}	
 	}
	
	// fallback function
	// in case ether is send to the contrat, it will be split to Bob and Carol
	function() payable ifActive() {		
		split();
	}

	// activate/disable the split functionality
	function activate(bool activeState) {
		if (msg.sender == owner) {
			isActive=activeState;
			LogActivationStateChange(activeState);
		}
	}
}
