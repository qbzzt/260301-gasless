import './App.css'

import { useAccount, useConnect, useDisconnect } from 'wagmi'

function WalletButton() {
  const { address, isConnected } = useAccount()
  const { connectors, connect } = useConnect()
  const { disconnect } = useDisconnect()

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
    </>
  )
}

export default App
