import { 
          useState, 
          useEffect,
          useCallback, 
        } from 'react'
import {  useChainId, 
          useAccount,
          useReadContract, 
          useWriteContract,
          useWatchContractEvent,
          useSignTypedData
        } from 'wagmi'

let greeterABI = [
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
  // Sepolia
    11155111: '0xC87506C66c7896366b9E988FE0aA5B6dDE77CFfA'
}

const useSponsoredGreeting = ({ contractAddr, chainId }) => {
  const { address: account } = useAccount()

  const { signTypedDataAsync } = useSignTypedData()

  const signGreeting = useCallback(
    async (greeting) => {
      if (!account) throw new Error("Wallet not connected")

      const domain = {
        name: "Greeter",
        version: "1",
        chainId,
        verifyingContract: contractAddr,
      }

      const types = {
        GreetingRequest: [
          { name: "greeting", type: "string" },
        ],
      }

      const message = { greeting }

      const signature = await signTypedDataAsync({
        domain,
        types,
        primaryType: "GreetingRequest",
        message,
      })

      const r = `0x${signature.slice(2, 66)}`
      const s = `0x${signature.slice(66, 130)}`
      const v = parseInt(signature.slice(130, 132), 16)

      return {
        req: { greeting },
        v,
        r,
        s,
      }
    },
    [account, chainId, contractAddr, signTypedDataAsync],
  )

  return { signGreeting }
}


const Greeter = () => {  
  const chainId = useChainId()
  const account = useAccount()

  const greeterAddr = chainId && contractAddrs[chainId] 

  const { signGreeting } = useSponsoredGreeting({
    contractAddr: greeterAddr,
    chainId,
  })


  const readResults = useReadContract({
    address: greeterAddr,
    abi: greeterABI,
    functionName: "greet", // No arguments
    watch: true,
    chainId
  })

  const [ currentGreeting, setCurrentGreeting ] = 
    useState("Loading...")
  const [ newGreeting, setNewGreeting ] = useState("")
  const [ lastSetterAddress, setLastSetterAddress ] = useState("")

  useEffect(() => {
    if (readResults.data) {
      setCurrentGreeting(readResults.data)
    }
  }, [readResults.data])

  if (greeterAddr) {
    useWatchContractEvent({
      address: greeterAddr,
      abi: greeterABI,
      eventName: 'SetGreeting',
      chainId,
      onLogs(logs) {
        const greetingFromContract = logs[0].args.greeting
        setCurrentGreeting(greetingFromContract)
        setLastSetterAddress(logs[0].args.sender)
      },
    })
  }

  const greetingChange = (evt) =>
    setNewGreeting(evt.target.value)

  const canUpdateGreeting =
    greeterAddr &&
    account &&
    newGreeting.trim().length > 0
  
  const { writeContract } = useWriteContract()

  const sponsoredGreeting = async () => {
    try {
      const signedMessage = await signGreeting(newGreeting)
      const response = await fetch("/server/sponsor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signedMessage),
      })
      const data = await response.json()
      console.log("Server response:", data)
    } catch (err) {
      console.error("Error:", err)
    }
  }  

  return (
    <>
      <h2>Greeter</h2>
      {readResults.isLoading ? "Loading..." : currentGreeting}
      {lastSetterAddress && (
        <p>Last updated by: {lastSetterAddress}</p>
      )}
      <hr />      
      <input type="text"
        value={newGreeting}
        onChange={greetingChange}      
      />
      <br />
      <button disabled={!canUpdateGreeting}
              onClick={() => writeContract({
                address: greeterAddr,
                abi: greeterABI,
                functionName: "setGreeting",
                args: [newGreeting],
                account: account.address
              })}
      >
        Update greeting directly
      </button>
      <br />
      <button disabled={!canUpdateGreeting}      
              onClick={sponsoredGreeting}
      >
        Update greeting via sponsor
      </button>
    </>
  )
}



export {Greeter}