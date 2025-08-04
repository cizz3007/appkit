import { defineChain } from 'viem'

export const henesysQa = /*#__PURE__*/ defineChain({
  id: 807424,
  name: 'Henesys QA',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexpace',
    symbol: 'NXPC'
  },
  rpcUrls: {
    default: { http: ['https://qa-testnet-rpc.msu.io'] },
    public: { http: ['https://qa-testnet-rpc.msu.io'] }
  },
  blockExplorers: {
    default: {
      name: 'MSU Explorer',
      url: 'https://msu-testnet-explorer.xangle.io'
    }
  }
})
