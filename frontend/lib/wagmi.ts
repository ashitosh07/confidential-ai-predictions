import { createConfig, http } from 'wagmi'
import { mainnet, hardhat } from 'wagmi/chains'
import { metaMask, coinbaseWallet } from 'wagmi/connectors'

export const config = createConfig({
  chains: [hardhat, mainnet],
  connectors: [
    metaMask(),
    coinbaseWallet({ appName: 'Z-AI Predictor' })
  ],
  transports: {
    [hardhat.id]: http('http://127.0.0.1:8545'),
    [mainnet.id]: http()
  }
})