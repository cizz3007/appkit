import { MsuWalletConnector } from '@reown/appkit-adapter-wagmi'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import {
  AppKitNetwork,
  avalanche,
  avalancheFuji,
  henesys,
  henesysDev,
  henesysQa,
  henesysStage,
  henesysTest
} from '@reown/appkit/networks'
import {
  createAppKit,
  useAppKit,
  useAppKitAccount,
  useAppKitEvents,
  useAppKitNetwork,
  useAppKitState,
  useAppKitTheme,
  useDisconnect,
  useWalletInfo
} from '@reown/appkit/react'

export const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || 'b56e18d47c72ab683b10814fe9495694' // this is a public projectId only to use on localhost

export const networks = [
  henesys,
  henesysDev,
  henesysQa,
  henesysStage,
  henesysTest,
  avalanche,
  avalancheFuji
] as [AppKitNetwork, ...AppKitNetwork[]]

// Setup wagmi adapter
export const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  connectors: [MsuWalletConnector()]
})

// Create modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  networks,
  metadata: {
    name: 'AppKit Next.js Wagmi',
    description: 'AppKit Next.js App Router with Wagmi Adapter',
    url: 'https://reown.com/appkit',
    icons: ['https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png']
  },
  chainImages: {
    [henesys.id]: 'https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png',
    [henesysDev.id]: 'https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png',
    [henesysQa.id]: 'https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png',
    [henesysStage.id]: 'https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png',
    [henesysTest.id]: 'https://d1ghfhy4m942vn.cloudfront.net/token_image/nxpc_token.png'
  },
  projectId,
  themeMode: 'light',
  enableWalletGuide: false,
  features: {
    analytics: true,
    email: false,
    socials: []
  }
})

export {
  modal,
  useAppKit,
  useAppKitState,
  useAppKitTheme,
  useAppKitEvents,
  useAppKitAccount,
  useWalletInfo,
  useAppKitNetwork,
  useDisconnect
}
