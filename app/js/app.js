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
    let deployed;
    checkAddress();
    return Splitter.deployed()
        // Get the first split address from the contract (Bob)
        .then(_deployed => { 
            deployed = _deployed;
            return deployed.splitAddress1.call() })
        .then(addr => {           
            window.address1 = addr;
            $("#addr1").html(addr);
            console.log(addr);
            return deployed.splitAddress2.call() })
        // Get the second split address from the contract (Carol)
        .then(addr => {           
            window.address2 = addr;
            $("#addr2").html(addr);
            console.log(addr);
            return deployed.contract.address})  // test deployed.contract.address
        // Get the address of the contract
        .then(addr => {
            window.contractAddress = addr;
            $("#splitAddress").html(addr);
            console.log(addr);})
        // Display the balance of the 3 accounts
        .then( () => showBalance(window.address1, '#balance1') )
        .then( () => showBalance(window.address2, '#balance2') )
        .then( () => showBalance(window.contractAddress, '#balance0') )
        .then( () => {
            $("#send").click(split);
            $("#utilSend").click(utilSplit);
            $("#activate").click(activateSplit);
            $("#disable").click(disableSplit) })
        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
});


// Manage the split to Bob and Carol
//----------------------------------
const split = function() {
    let deployed;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;
            // amount = $("input[name='amount']");
            //if (amount <= 0)
            //    throw "Wrong amount";
            var amount = web3.toWei($("input[name='amount']").val(),"ether");
            fromAddr = $("input[name='fromAddr']").val();
            if (!web3.isAddress(fromAddr))
                throw "Not a valid address";
            return _deployed.split.sendTransaction(
                { from: fromAddr, value: amount });})
        .then(txHash => {
            console.log("output",txHash);
            $("#status").html("Transaction on the way " + txHash);
            // Now we wait for the tx to be mined.
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(500).then(tryAgain));
            return tryAgain();})
        .then(receipt => {
            if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#status").html("There was an error in the tx execution");
            } else {
                // Format the event nicely.
                console.log(deployed.LogSplit().formatter(receipt.logs[0]).args);
                $("#status").html("Transfer executed");
            }
        })
        // Update the 3 balances
       .then(() => {
            return Promise.all([
                showBalance(window.address1, '#balance1'),
                showBalance(window.address2, '#balance2'),
                showBalance(window.contractAddress, '#balance0'),
                showBalance(fromAddr, '#balanceFromAddr')]);
        })

        .catch(e => {
            $("#status").html(e.toString());
            console.error(e);
        });
};



// Manage the utility split function
//----------------------------------
const utilSplit = function() {
    let deployed;
    var utilAmount;
    var utilAddr1, utilAddr2, utilFromAddr;
    return Splitter.deployed()
        .then(_deployed => {
            deployed = _deployed;

            utilAmount = web3.toWei($("input[name='utilAmount']").val(),"ether");
            //if (utilAmount <= 0)
            //    throw "Wrong amount";

            utilAddr1 = $("input[name='utilAddr1']").val();
            if (!web3.isAddress(utilAddr1))
                throw "Not a valid split 1 address"

            utilAddr2 = $("input[name='utilAddr2']").val();
            if (!web3.isAddress(utilAddr2))
                throw "Not a valid split 2 address"

            utilFromAddr = $("input[name='utilFromAddr']").val();
            if (!web3.isAddress(utilFromAddr))
                throw "Not a valid funding address"

            // .sendTransaction so that we get the txHash immediately.
            return _deployed.splitUtil.sendTransaction( utilAddr1, utilAddr2,
                { from: utilFromAddr, value: utilAmount }); })
        .then(txHash => {
            console.log("output",txHash);
            $("#status").html("Transaction on the way " + txHash);
            // Now we wait for the tx to be mined.
            const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                .then(receipt => receipt !== null ?
                    receipt :
                    // Let's hope we don't hit the max call stack depth
                    Promise.delay(500).then(tryAgain));
            return tryAgain();})
        .then(receipt => {
            if (receipt.logs.length == 0) {
                console.error("Empty logs");
                console.error(receipt);
                $("#utilStatus").html("There was an error in the tx execution");
            } else {
                // Format the event nicely.
                console.log(deployed.LogSplitUtil().formatter(receipt.logs[0]).args);
                $("#utilStatus").html("Transfer executed");
            }
        })
        // Update the 3 balances
       .then(() => {
            return Promise.all([
                showBalance(utilAddr1, '#utilBalance1'),
                showBalance(utilAddr2, '#utilBalance2'),
                showBalance(utilFromAddr, '#utilBalanceFromAddr'),
                showBalance(window.contractAddress, '#balance0')]);
        })

        .catch(e => {
            $("#utilStatus").html(e.toString());
            console.log(e);
        });
};




// Get balance and display it 
function showBalance(address, elemId) {
    return web3.eth.getBalancePromise(address).then(balance => {
        $(elemId).html(web3.fromWei(balance.toString(10), 'ether')+" eth");
    });
}



// Test validity of typed address
function checkAddress() {
$("input[name='fromAddr']").change(function() {
    if (web3.isAddress($(this).val())) {
        showBalance($(this).val(), '#balanceFromAddr');
        $("input[name='fromAddr']").css("background-color", "lightgreen");}
    else {
        $("input[name='fromAddr']").css("background-color", "red");
        $('#balanceFromAddr').html(" ... eth")}
});
}


// Disable/activate the split functionnality
//------------------------------------------
const activateSplit = function() {activate(true)};
const disableSplit = function() {activate(false)};

const activate = function(state) {
    let deployed;
    let isActive;
    return getActivationStatus()
        .then( _isActive => { 
            isActive = _isActive;
            // if change is really required
            if (isActive != state) {
                fromAddr = $("input[name='activationAddr']").val();
                if (!web3.isAddress(fromAddr))
                    throw "Not a valid address";

                return Splitter.deployed()
                .then(_deployed => {
                    deployed = _deployed;
                    return deployed.activate.sendTransaction(state,{ from: fromAddr}) })
                .then(txHash => {
                    console.log("output",txHash);
                    $("#status").html("Change on the way " + txHash);
                    // Now we wait for the tx to be mined.
                    const tryAgain = () => web3.eth.getTransactionReceiptPromise(txHash)
                    .then(receipt => receipt !== null ?
                        receipt :
                    // Let's hope we don't hit the max call stack depth
                        Promise.delay(500).then(tryAgain));
                    return tryAgain();})
                .then(receipt => {
                    if (receipt.logs.length == 0) {
                        console.error("Empty logs");
                        console.error(receipt);
                        $("#activationStatus").html("There was an error in the tx execution");
                    } else {
                        // Format the event nicely.
                        console.log(deployed.LogActivationStateChange().formatter(receipt.logs[0]).args);
                        getActivationStatus();
                    }})
            }
        })
        .catch(e => {
            $("#activationStatus").html(e.toString());
            console.log(e);
        });
};


// Get and display the activation status 
function getActivationStatus() {
    return Splitter.deployed()
        .then(deployed => { 
            return deployed.isActive.call() })
        .then(isActive => {
            if (isActive) {
                $("#activationStatus").html(" spliter active");
            } else  {
                $("#activationStatus").html(" spliter disabled");
            }
            return isActive
        });
};