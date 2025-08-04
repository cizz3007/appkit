// -- Networks ---------------------------------------------------------------
export * from 'viem/chains'
export * from './solana/index.js'
export * from './bitcoin.js'

// -- Utils ------------------------------------------------------------------
export * from './utils.js'

// -- Types ---------------------------------------------------------------
export type { AppKitNetwork, ChainNamespace } from '@reown/appkit-common'
export { AVAILABLE_NAMESPACES } from '@reown/appkit-common'

// -- Henesys Networks ------------------------------------------------------------------
export { henesys } from './henesys.js'
export { henesysDev } from './henesys_dev.js'
export { henesysQa } from './henesys_qa.js'
export { henesysStage } from './henesys_stage.js'
export { henesysTest } from './henesys_test.js'
