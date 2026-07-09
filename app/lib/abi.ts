export const alrightBetAbi = [
  {
    "type": "function",
    "name": "claimWinnings",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "createMarket",
    "inputs": [
      {
        "name": "question",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "resolveBy",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "resolver",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "getMarket",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "outputs": [
      {
        "name": "question",
        "type": "string",
        "internalType": "string"
      },
      {
        "name": "resolveBy",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "resolver",
        "type": "address",
        "internalType": "address"
      },
      {
        "name": "resolved",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "outcome",
        "type": "bool",
        "internalType": "bool"
      },
      {
        "name": "poolYes",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "poolNo",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "getStake",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "stakeYes",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "stakeNo",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "hasClaimed",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "user",
        "type": "address",
        "internalType": "address"
      }
    ],
    "outputs": [
      {
        "name": "",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "marketCount",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "uint256",
        "internalType": "uint256"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "placeBet",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "outcome",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "payable"
  },
  {
    "type": "function",
    "name": "resolveMarket",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "internalType": "uint256"
      },
      {
        "name": "outcome",
        "type": "bool",
        "internalType": "bool"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "BetPlaced",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "bettor",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "outcome",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketCreated",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "creator",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "question",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      },
      {
        "name": "resolveBy",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      },
      {
        "name": "resolver",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "MarketResolved",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "outcome",
        "type": "bool",
        "indexed": false,
        "internalType": "bool"
      }
    ],
    "anonymous": false
  },
  {
    "type": "event",
    "name": "WinningsClaimed",
    "inputs": [
      {
        "name": "marketId",
        "type": "uint256",
        "indexed": true,
        "internalType": "uint256"
      },
      {
        "name": "winner",
        "type": "address",
        "indexed": true,
        "internalType": "address"
      },
      {
        "name": "amount",
        "type": "uint256",
        "indexed": false,
        "internalType": "uint256"
      }
    ],
    "anonymous": false
  },
  {
    "type": "error",
    "name": "ReentrancyGuardReentrantCall",
    "inputs": []
  }
] as const;
