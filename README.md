# SplitterContract
Ethereum contract that splits incoming funds in two accounts

split() will split the amount between Bob and Carol
splitUtil(addr1,addr2)  will split the amount between the given addresses

The 2 split functions can be activated/disabled by the owner

A fallback function is set so that amount send directly to the contract's address will be split to Bob and Carol

## Todo
- more tests

## Last changes
- Added a parametrable split function
- Suppressed selfdestruct and added a flag to activate/disable the splitter
- Added a fallback function
- Added validity test for address imputs