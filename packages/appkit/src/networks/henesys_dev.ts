import { defineChain } from 'viem'

export const henesysDev = /*#__PURE__*/ defineChain({
  id: 5668,
  name: 'Henesys DEV',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexpace',
    symbol: 'NXPC'
  },
  rpcUrls: {
    default: { http: ['https://dev-testnet-rpc.msu.io'] },
    public: { http: ['https://dev-testnet-rpc.msu.io'] }
  },
  blockExplorers: {
    default: {
      name: 'MSU Explorer',
      url: 'https://msu-testnet-explorer.xangle.io'
    }
  }
})
