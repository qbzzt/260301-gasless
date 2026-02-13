import './App.css'

import { useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Greeter } from './Greeter'

function WalletButton() {
  const { address, chainId, isConnected } = useAccount()

  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

  const addHardhatChain = async () => {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: "0x7A69", // 31337
          chainName: "Hardhat Local",
          rpcUrls: ["http://127.0.0.1:8545"],
          nativeCurrency: {
            name: "ETH",
            symbol: "ETH",
            decimals: 18,
          },
        },
      ],
    })
  }

  const switchToHardhat = async () => {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0x7A69" }], // 31337
      })
    } catch (err) {
      // If the chain is not added, MetaMask throws error 4902
      if (err.code === 4902) {
        await addHardhatChain()
      } else {
        console.error(err)
      }
    }
  }

  console

  useEffect(() => {
    if (isConnected && chainId !== 31337) {
      switchToHardhat()
    }
  }, [isConnected, chainId])

  if (isConnected)
    return <button onClick={() => disconnect()}>Disconnect {address}</button>

  return connectors.map((c) => (
    <button key={c.uid} onClick={() => connect({ connector: c })}>
      Connect with {c.name}
    </button>
  ))
}



function App() {

  return (
    <>
      <WalletButton />
      <Greeter />
    </>
  )
}

export default App
