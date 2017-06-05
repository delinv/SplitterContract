require("file-loader?name=../index.html!../index.html");

const Web3 = require("web3");
const Promise = require("bluebird");
const truffleContract = require("truffle-contract");
const $ = require("jquery");
// Not to forget our built contract
const splitterJson = require("../../build/contracts/Splitter.json");

// Supports Mist, and other wallets that provide 'web3'.
if (typeof web3 !== 'undefined') {
    // Use the Mist/wallet/Metamask provider.
    window.web3 = new Web3(web3.currentProvider);
} else {
    // Your preferred fallback.
    window.web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); 
}

Promise.promisifyAll(web3.eth, { suffix: "Promise" });

const Splitter = truffleContract(splitterJson);
Splitter.setProvider(web3.currentProvider);

window.addEventListener('load', function() {
    return Splitter.deployed()
        // Get the first split address from the contract (Bob)
        // and display it with its current balance
        .then(deployed => { return deployed.getSplitAddress1.call() })
        .then(addr => {
            window.address1 = addr;
            $("#addr1").html(window.address1);
            return addr;})
        .then(addr => {
            console.log(addr);
            return web3.eth.getBalancePromise(addr)})
        .then(balance => {
            $("#balance1").html(web3.fromWei(balance.toString(10), 'ether'));
            return Splitter.deployed()})
        // Get the second split address from the contract (Carol)
        // and display it with its current balance
        .then(deployed => { 
            return deployed.getSplitAddress2.call() })
        .then(addr => {
            window.address2 = addr;
            $("#addr2").html(window.address2);
            return addr;})
        .then(addr => {
            console.log(addr);
            return web3.eth.getBalancePromise(addr)})
        .then(balance => {
            $("#balance2").html(web3.fromWei(balance.toString(10), 'ether'));
            return Splitter.deployed()})
        // Get the address of the contract
        // and display its current balance
        .then(deployed => { 
            return deployed.contract.address })
        .then(addr => {
            window.contractAddress = addr;
            $("#splitAddress").html(addr);
            console.log(addr);
            return web3.eth.getBalancePromise(addr)})
        .then(balance => {
            $("#balance0").html(web3.fromWei(balance.toString(10), 'ether'));
            $("#send").click(split);})
        .catch(console.error); 
});


const split = function() {
    let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
            var amount = web3.toWei($("input[name='amount']").val(),"ether");
            var fromAddr = $("input[name='fromAddr']").val();
            // .sendTransaction so that we get the txHash immediately.
            return _deployed.split.sendTransaction(
                { from: fromAddr, value: amount });
        })
        .then(txHash => {
            console.error("output",txHash);
            $("#status").html("Transaction on the way " + txHash);
            // Now we wait for the tx to be mined.
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(500).then(tryAgain));
            return tryAgain();
        })
        .then(receipt => {
            if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution");
            } else {
                // Format the event nicely.
                console.log(deployed.SplitEvent().formatter(receipt.logs[0]).args);
                $("#status").html("Transfer executed");
            }
            // Make sure we update the UI.
            //return deployed.getBalance.call(window.account);
        })
        //.then(balance => $("#balance").html(balance.toString(10)))
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};
