var Splitter = artifacts.require("./Splitter.sol");

module.exports = function(deployer, network, accounts) {
	addr1 = accounts[1];
	addr2 = accounts[2];
	console.log(`addr1 = ${addr1}, addr2 = ${addr2}`);	
  	deployer.deploy(Splitter, addr1, addr2);
};


//module.exports = function(deployer, network, accounts) {
//console.log(`account1 = ${accounts[1]}, account2 = ${accounts[2]}`);
//deployer.deploy(Splitter, accounts[1], accounts[2]);
