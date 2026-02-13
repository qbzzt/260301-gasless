import { useState } from 'react'
import {  useChainId, 
          useAccount,
          useReadContract, 
          useSimulateContract,
          useWriteContract,
          useWaitForTransactionReceipt
        } from 'wagmi'


let greeterABI = [
  {
    "type": "constructor",
    "inputs": [
      {
        "name": "_greeting",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "DOMAIN_SEPARATOR",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "greet",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "greeting",
    "inputs": [],
    "outputs": [
      {
        "name": "",
        "type": "string",
        "internalType": "string"
      }
    ],
    "stateMutability": "view"
  },
  {
    "type": "function",
    "name": "setGreeting",
    "inputs": [
      {
        "name": "_greeting",
        "type": "string",
        "internalType": "string"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "function",
    "name": "sponsoredSetGreeting",
    "inputs": [
      {
        "name": "req",
        "type": "tuple",
        "internalType": "struct Greeter.GreetingRequest",
        "components": [
          {
            "name": "greeting",
            "type": "string",
            "internalType": "string"
          }
        ]
      },
      {
        "name": "v",
        "type": "uint8",
        "internalType": "uint8"
      },
      {
        "name": "r",
        "type": "bytes32",
        "internalType": "bytes32"
      },
      {
        "name": "s",
        "type": "bytes32",
        "internalType": "bytes32"
      }
    ],
    "outputs": [],
    "stateMutability": "nonpayable"
  },
  {
    "type": "event",
    "name": "SetGreeting",
    "inputs": [
      {
        "name": "sender",
        "type": "address",
        "indexed": false,
        "internalType": "address"
      },
      {
        "name": "greeting",
        "type": "string",
        "indexed": false,
        "internalType": "string"
      }
    ],
    "anonymous": false
  }
]  // greeterABI




const contractAddrs = {
  // Anvil
  31337: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
}


const Greeter = () => {  
  const chainId = useChainId()
  const account = useAccount()

  const greeterAddr = chainId && contractAddrs[chainId] 

  const readResults = useReadContract({
    address: greeterAddr,
    abi: greeterABI,
    functionName: "greet", // No arguments
    watch: false,
    chainId
  })

  const [ currentGreeting, setCurrentGreeting ] = 
    useState(readResults.data)

  if (currentGreeting != readResults.data)
    setCurrentGreeting(readResults.data)

  const [ newGreeting, setNewGreeting ] = useState("")

  const greetingChange = (evt) =>
    setNewGreeting(evt.target.value)

  const canSimulate =
    greeterAddr &&
    account &&
    newGreeting.trim().length > 0
  
  const sim = useSimulateContract(
    canSimulate ? {
        address: greeterAddr,
        abi: greeterABI,
        functionName: 'setGreeting',
        args: [newGreeting],
        chainId,
        account: account.address,
      }
      : undefined
    )

  const { writeContract, data: writeHash } = useWriteContract()

  console.log(writeHash)

  return (
    <>
      <h2>Greeter</h2>
      {
        !readResults.isError && !readResults.isLoading &&
          readResults.data
      }
      <hr />      
      <input type="text"
        value={newGreeting}
        onChange={greetingChange}      
      />
      <br />
      <button disabled={!sim || !sim.data || !sim.data.request}
              onClick={() => writeContract(sim.data.request)}
      >
        Update greeting
      </button>      
    </>
  )
}



export {Greeter}