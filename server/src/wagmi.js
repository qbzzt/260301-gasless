import { http, createConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'

export const config = createConfig({
  chains: [sepolia],
  connectors: [
    injected(), // MetaMask, Brave, Coinbase extension, etc.
  ],
  transports: {
    [sepolia.id]: http(),
  },
  multiInjectedProviderDiscovery: false,
  pollingInterval: 1000,    // Necessary for HTTP polling
})