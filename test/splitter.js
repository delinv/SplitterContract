
var Splitter = artifacts.require("./Splitter.sol");

contract('Splitter', function(accounts) {
  var deployed;
  var acc0BalInit,acc1BalInit,acc2BalInit;
  var acc0BalFin,acc1BalFin,acc2BalFin;
  var totalInit, totalFin;
  var amount;

  amount = web3.toWei(10,"ether");
  acc0BalInit = web3.eth.getBalance(accounts[0]);
  console.log("    acc0 "+web3.fromWei(acc0BalInit,"ether").toString(10)+" eth");
  acc1BalInit = web3.eth.getBalance(accounts[1]);
  console.log("    acc1 "+web3.fromWei(acc1BalInit,"ether").toString(10)+" eth");
  acc2BalInit = web3.eth.getBalance(accounts[2]);
  console.log("    acc2 "+web3.fromWei(acc2BalInit,"ether").toString(10)+" eth");
  totalInit = acc0BalInit.plus(acc1BalInit).plus(acc2BalInit);

  it("should split correctly between Bob and Carol ", function() {
    return Splitter.deployed()
    .then(function(instance) {
      deployed = instance;
      return deployed.split( {from: accounts[0], value: amount}) })
    .then(function() {
        acc0BalFin = web3.eth.getBalance(accounts[0]);
        console.log("    acc0 "+web3.fromWei(acc0BalFin,"ether").toString(10)+" eth");
        acc1BalFin = web3.eth.getBalance(accounts[1]);
        console.log("    acc1 "+web3.fromWei(acc1BalFin,"ether").toString(10)+" eth");
        acc2BalFin = web3.eth.getBalance(accounts[2]);
        console.log("    acc2 "+web3.fromWei(acc2BalFin,"ether").toString(10)+" eth");
        totalFin = acc0BalFin.plus(acc1BalFin).plus(acc2BalFin);

        var fee = acc0BalInit.minus(acc0BalFin).minus(amount);
        console.log("    fee = "+fee.toString(10)+" wei");
        var totalVariation = totalFin.minus(totalInit).plus(fee);
        //console.log("    total var = "+totalVariation.toString(10)+" wei");
        var acc1Variation = acc1BalFin.minus(acc1BalInit);
        //console.log("    account1 var = "+acc1Variation.toString(10)+" wei");
        //console.log("    amount = "+(amount/2).toString(10)+" wei");

        assert.equal(totalVariation, 0, "No conservation of ether");

        assert.equal(acc1Variation, amount/2, "Incorrect split amount");
    })
  });
});


