import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(), // MetaMask, Brave, Coinbase extension, etc.
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})