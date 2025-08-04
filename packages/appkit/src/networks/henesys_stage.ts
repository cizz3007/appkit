import { defineChain } from 'viem'

export const henesysStage = /*#__PURE__*/ defineChain({
  id: 847799,
  name: 'Henesys STAGE',
  nativeCurrency: {
    decimals: 18,
    name: 'Nexpace',
    symbol: 'NXPC'
  },
  rpcUrls: {
    default: { http: ['https://stage-testnet-rpc.msu.io'] },
    public: { http: ['https://stage-testnet-rpc.msu.io'] }
  },
  blockExplorers: {
    default: {
      name: 'MSU Explorer',
      url: 'https://dev-msu-testnet-explorer.xangle.io'
    }
  }
})
