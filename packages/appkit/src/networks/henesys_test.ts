import { defineChain } from 'viem'

export const henesysTest = /*#__PURE__*/ defineChain({
  id: 595581,
  name: 'Henesys TEST',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexpace',
    symbol: 'NXPC'
  },
  rpcUrls: {
    default: { http: ['https://test-testnet-rpc.msu.io'] },
    public: { http: ['https://test-testnet-rpc.msu.io'] }
  },
  blockExplorers: {
    default: {
      name: 'MSU Explorer',
      url: 'https://msu-testnet-explorer.xangle.io'
    }
  }
})
