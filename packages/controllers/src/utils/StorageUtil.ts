/* eslint-disable no-console */
import {
  type CaipNetworkId,
  type ChainNamespace,
  ConstantsUtil as CommonConstantsUtil,
  SafeLocalStorage,
  SafeLocalStorageKeys,
  getSafeConnectorIdKey
} from '@reown/appkit-common'
import type { Connection } from '@reown/appkit-common'

import type {
  BlockchainApiBalanceResponse,
  BlockchainApiIdentityResponse,
  BlockchainApiLookupEnsName,
  BlockchainApiTokenPriceResponse,
  BlockchainApiTransactionsResponse,
  ConnectionStatus,
  PreferredAccountTypes,
  SocialProvider,
  WcWallet
} from './TypeUtil.js'

// -- Types -------------------------------------------------------------------
interface DeleteAddressFromConnectionParams {
  address: string
  connectorId: string
  namespace: ChainNamespace
}

// -- Utility -----------------------------------------------------------------
export const StorageUtil = {
  // Cache expiry in milliseconds
  cacheExpiry: {
    portfolio: 30000,
    nativeBalance: 30000,
    ens: 300000,
    identity: 300000,
    transactionsHistory: 15000,
    tokenPrice: 15000
  },
  isCacheExpired(timestamp: number, cacheExpiry: number) {
    return Date.now() - timestamp > cacheExpiry
  },
  getActiveNetworkProps() {
    const namespace = StorageUtil.getActiveNamespace()
    const caipNetworkId = StorageUtil.getActiveCaipNetworkId() as CaipNetworkId | undefined
    const stringChainId = caipNetworkId ? caipNetworkId.split(':')[1] : undefined

    // eslint-disable-next-line no-nested-ternary
    const chainId = stringChainId
      ? isNaN(Number(stringChainId))
        ? stringChainId
        : Number(stringChainId)
      : undefined

    return {
      namespace,
      caipNetworkId,
      chainId
    }
  },

  setWalletConnectDeepLink({ name, href }: { href: string; name: string }) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.DEEPLINK_CHOICE, JSON.stringify({ href, name }))
    } catch {
      console.info('Unable to set WalletConnect deep link')
    }
  },

  getWalletConnectDeepLink() {
    try {
      const deepLink = SafeLocalStorage.getItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
      if (deepLink) {
        return JSON.parse(deepLink)
      }
    } catch {
      console.info('Unable to get WalletConnect deep link')
    }

    return undefined
  },

  deleteWalletConnectDeepLink() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.DEEPLINK_CHOICE)
    } catch {
      console.info('Unable to delete WalletConnect deep link')
    }
  },

  setActiveNamespace(namespace: ChainNamespace) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_NAMESPACE, namespace)
    } catch {
      console.info('Unable to set active namespace')
    }
  },

  setActiveCaipNetworkId(caipNetworkId: CaipNetworkId) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID, caipNetworkId)
      StorageUtil.setActiveNamespace(caipNetworkId.split(':')[0] as ChainNamespace)
    } catch {
      console.info('Unable to set active caip network id')
    }
  },

  getActiveCaipNetworkId() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID) as
        | CaipNetworkId
        | undefined
    } catch {
      console.info('Unable to get active caip network id')

      return undefined
    }
  },

  deleteActiveCaipNetworkId() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID)
    } catch {
      console.info('Unable to delete active caip network id')
    }
  },

  deleteConnectedConnectorId(namespace: ChainNamespace) {
    try {
      const key = getSafeConnectorIdKey(namespace)
      SafeLocalStorage.removeItem(key)
    } catch {
      console.info('Unable to delete connected connector id')
    }
  },

  setAppKitRecent(wallet: WcWallet) {
    try {
      const recentWallets = StorageUtil.getRecentWallets()
      const exists = recentWallets.find(w => w.id === wallet.id)
      if (!exists) {
        recentWallets.unshift(wallet)
        if (recentWallets.length > 2) {
          recentWallets.pop()
        }
        SafeLocalStorage.setItem(SafeLocalStorageKeys.RECENT_WALLETS, JSON.stringify(recentWallets))
      }
    } catch {
      console.info('Unable to set AppKit recent')
    }
  },

  getRecentWallets(): WcWallet[] {
    try {
      const recent = SafeLocalStorage.getItem(SafeLocalStorageKeys.RECENT_WALLETS)

      return recent ? JSON.parse(recent) : []
    } catch {
      console.info('Unable to get AppKit recent')
    }

    return []
  },

  setConnectedConnectorId(namespace: ChainNamespace, connectorId: string) {
    try {
      const key = getSafeConnectorIdKey(namespace)
      SafeLocalStorage.setItem(key, connectorId)
    } catch {
      console.info('Unable to set Connected Connector Id')
    }
  },

  getActiveNamespace() {
    try {
      const activeNamespace = SafeLocalStorage.getItem(SafeLocalStorageKeys.ACTIVE_NAMESPACE)

      return activeNamespace as ChainNamespace | undefined
    } catch {
      console.info('Unable to get active namespace')
    }

    return undefined
  },

  getConnectedConnectorId(namespace: ChainNamespace | undefined) {
    if (!namespace) {
      return undefined
    }

    try {
      const key = getSafeConnectorIdKey(namespace)

      return SafeLocalStorage.getItem(key)
    } catch (e) {
      console.info('Unable to get connected connector id in namespace', namespace)
    }

    return undefined
  },

  setConnectedSocialProvider(socialProvider: SocialProvider) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTED_SOCIAL, socialProvider)
    } catch {
      console.info('Unable to set connected social provider')
    }
  },

  getConnectedSocialProvider() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL)
    } catch {
      console.info('Unable to get connected social provider')
    }

    return undefined
  },

  deleteConnectedSocialProvider() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.CONNECTED_SOCIAL)
    } catch {
      console.info('Unable to delete connected social provider')
    }
  },

  getConnectedSocialUsername() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_SOCIAL_USERNAME)
    } catch {
      console.info('Unable to get connected social username')
    }

    return undefined
  },

  getStoredActiveCaipNetworkId() {
    const storedCaipNetworkId = SafeLocalStorage.getItem(
      SafeLocalStorageKeys.ACTIVE_CAIP_NETWORK_ID
    )
    const networkId = storedCaipNetworkId?.split(':')?.[1]

    return networkId
  },

  setConnectionStatus(status: ConnectionStatus) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTION_STATUS, status)
    } catch {
      console.info('Unable to set connection status')
    }
  },

  getConnectionStatus() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTION_STATUS) as ConnectionStatus
    } catch {
      return undefined
    }
  },

  getConnectedNamespaces() {
    try {
      const namespaces = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTED_NAMESPACES)

      if (!namespaces?.length) {
        return []
      }

      return namespaces.split(',') as ChainNamespace[]
    } catch {
      return []
    }
  },

  setConnectedNamespaces(namespaces: ChainNamespace[]) {
    try {
      const uniqueNamespaces = Array.from(new Set(namespaces))
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.CONNECTED_NAMESPACES,
        uniqueNamespaces.join(',')
      )
    } catch {
      console.info('Unable to set namespaces in storage')
    }
  },

  addConnectedNamespace(namespace: ChainNamespace) {
    try {
      const namespaces = StorageUtil.getConnectedNamespaces()
      if (!namespaces.includes(namespace)) {
        namespaces.push(namespace)
        StorageUtil.setConnectedNamespaces(namespaces)
      }
    } catch {
      console.info('Unable to add connected namespace')
    }
  },

  removeConnectedNamespace(namespace: ChainNamespace) {
    try {
      const namespaces = StorageUtil.getConnectedNamespaces()
      const index = namespaces.indexOf(namespace)
      if (index > -1) {
        namespaces.splice(index, 1)
        StorageUtil.setConnectedNamespaces(namespaces)
      }
    } catch {
      console.info('Unable to remove connected namespace')
    }
  },
  getTelegramSocialProvider() {
    try {
      return SafeLocalStorage.getItem(SafeLocalStorageKeys.TELEGRAM_SOCIAL_PROVIDER) as
        | SocialProvider
        | undefined
    } catch {
      console.info('Unable to get telegram social provider')

      return null
    }
  },
  setTelegramSocialProvider(socialProvider: SocialProvider) {
    try {
      SafeLocalStorage.setItem(SafeLocalStorageKeys.TELEGRAM_SOCIAL_PROVIDER, socialProvider)
    } catch {
      console.info('Unable to set telegram social provider')
    }
  },
  removeTelegramSocialProvider() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.TELEGRAM_SOCIAL_PROVIDER)
    } catch {
      console.info('Unable to remove telegram social provider')
    }
  },
  getBalanceCache() {
    let cache: Record<string, { timestamp: number; balance: BlockchainApiBalanceResponse }> = {}
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.PORTFOLIO_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get balance cache')
    }

    return cache
  },
  removeAddressFromBalanceCache(caipAddress: string) {
    try {
      const cache = StorageUtil.getBalanceCache()
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.PORTFOLIO_CACHE,
        JSON.stringify({ ...cache, [caipAddress]: undefined })
      )
    } catch {
      console.info('Unable to remove address from balance cache', caipAddress)
    }
  },
  getBalanceCacheForCaipAddress(caipAddress: string) {
    try {
      const cache = StorageUtil.getBalanceCache()
      const balanceCache = cache[caipAddress]
      // We want to discard cache if it's older than the cache expiry
      if (
        balanceCache &&
        !this.isCacheExpired(balanceCache.timestamp, this.cacheExpiry.portfolio)
      ) {
        return balanceCache.balance
      }

      StorageUtil.removeAddressFromBalanceCache(caipAddress)
    } catch {
      console.info('Unable to get balance cache for address', caipAddress)
    }

    return undefined
  },
  updateBalanceCache(params: {
    caipAddress: string
    balance: BlockchainApiBalanceResponse
    timestamp: number
  }) {
    try {
      const cache = StorageUtil.getBalanceCache()
      cache[params.caipAddress] = params
      SafeLocalStorage.setItem(SafeLocalStorageKeys.PORTFOLIO_CACHE, JSON.stringify(cache))
    } catch {
      console.info('Unable to update balance cache', params)
    }
  },

  getNativeBalanceCache() {
    let cache: Record<
      string,
      { caipAddress: string; balance: string; symbol: string; timestamp: number }
    > = {}
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.NATIVE_BALANCE_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get balance cache')
    }

    return cache
  },
  removeAddressFromNativeBalanceCache(caipAddress: string) {
    try {
      const cache = StorageUtil.getBalanceCache()
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.NATIVE_BALANCE_CACHE,
        JSON.stringify({ ...cache, [caipAddress]: undefined })
      )
    } catch {
      console.info('Unable to remove address from balance cache', caipAddress)
    }
  },
  getNativeBalanceCacheForCaipAddress(caipAddress: string) {
    try {
      const cache = StorageUtil.getNativeBalanceCache()
      const nativeBalanceCache = cache[caipAddress]
      // We want to discard cache if it's older than the cache expiry
      if (
        nativeBalanceCache &&
        !this.isCacheExpired(nativeBalanceCache.timestamp, this.cacheExpiry.nativeBalance)
      ) {
        return nativeBalanceCache
      }

      console.info('Discarding cache for address', caipAddress)
      StorageUtil.removeAddressFromBalanceCache(caipAddress)
    } catch {
      console.info('Unable to get balance cache for address', caipAddress)
    }

    return undefined
  },
  updateNativeBalanceCache(params: {
    caipAddress: string
    balance: string
    symbol: string
    timestamp: number
  }) {
    try {
      const cache = StorageUtil.getNativeBalanceCache()
      cache[params.caipAddress] = params
      SafeLocalStorage.setItem(SafeLocalStorageKeys.NATIVE_BALANCE_CACHE, JSON.stringify(cache))
    } catch {
      console.info('Unable to update balance cache', params)
    }
  },

  getEnsCache() {
    let cache: Record<string, { ens: BlockchainApiLookupEnsName[]; timestamp: number }> = {}
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.ENS_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get ens name cache')
    }

    return cache
  },
  getEnsFromCacheForAddress(address: string) {
    try {
      const cache = StorageUtil.getEnsCache()
      const ensCache = cache[address]
      // We want to discard cache if it's older than the cache expiry
      if (ensCache && !this.isCacheExpired(ensCache.timestamp, this.cacheExpiry.ens)) {
        return ensCache.ens
      }
      StorageUtil.removeEnsFromCache(address)
    } catch {
      console.info('Unable to get ens name from cache', address)
    }

    return undefined
  },
  updateEnsCache(params: {
    address: string
    timestamp: number
    ens: BlockchainApiLookupEnsName[]
  }) {
    try {
      const cache = StorageUtil.getEnsCache()
      cache[params.address] = params
      SafeLocalStorage.setItem(SafeLocalStorageKeys.ENS_CACHE, JSON.stringify(cache))
    } catch {
      console.info('Unable to update ens name cache', params)
    }
  },
  removeEnsFromCache(address: string) {
    try {
      const cache = StorageUtil.getEnsCache()
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.ENS_CACHE,
        JSON.stringify({ ...cache, [address]: undefined })
      )
    } catch {
      console.info('Unable to remove ens name from cache', address)
    }
  },
  getIdentityCache() {
    let cache: Record<
      string,
      {
        identity: BlockchainApiIdentityResponse
        timestamp: number
      }
    > = {}
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.IDENTITY_CACHE)
      cache = result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get identity cache')
    }

    return cache
  },
  getIdentityFromCacheForAddress(address: string) {
    try {
      const cache = StorageUtil.getIdentityCache()
      const identityCache = cache[address]
      // We want to discard cache if it's older than the cache expiry
      if (
        identityCache &&
        !this.isCacheExpired(identityCache.timestamp, this.cacheExpiry.identity)
      ) {
        return identityCache.identity
      }
      StorageUtil.removeIdentityFromCache(address)
    } catch {
      console.info('Unable to get identity from cache', address)
    }

    return undefined
  },
  updateIdentityCache(params: {
    address: string
    timestamp: number
    identity: BlockchainApiIdentityResponse
  }) {
    try {
      const cache = StorageUtil.getIdentityCache()
      cache[params.address] = {
        identity: params.identity,
        timestamp: params.timestamp
      }
      SafeLocalStorage.setItem(SafeLocalStorageKeys.IDENTITY_CACHE, JSON.stringify(cache))
    } catch {
      console.info('Unable to update identity cache', params)
    }
  },
  removeIdentityFromCache(address: string) {
    try {
      const cache = StorageUtil.getIdentityCache()
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.IDENTITY_CACHE,
        JSON.stringify({ ...cache, [address]: undefined })
      )
    } catch {
      console.info('Unable to remove identity from cache', address)
    }
  },

  clearAddressCache() {
    try {
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.PORTFOLIO_CACHE)
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.NATIVE_BALANCE_CACHE)
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.ENS_CACHE)
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.IDENTITY_CACHE)
      SafeLocalStorage.removeItem(SafeLocalStorageKeys.HISTORY_TRANSACTIONS_CACHE)
    } catch {
      console.info('Unable to clear address cache')
    }
  },
  setPreferredAccountTypes(accountTypes: PreferredAccountTypes) {
    try {
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.PREFERRED_ACCOUNT_TYPES,
        JSON.stringify(accountTypes)
      )
    } catch {
      console.info('Unable to set preferred account types', accountTypes)
    }
  },
  getPreferredAccountTypes() {
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.PREFERRED_ACCOUNT_TYPES)
      if (!result) {
        return {}
      }

      return JSON.parse(result) as PreferredAccountTypes
    } catch {
      console.info('Unable to get preferred account types')
    }

    return {}
  },
  setConnections(connections: Connection[], chainNamespace: ChainNamespace) {
    try {
      const existingConnections = StorageUtil.getConnections()
      const existing = existingConnections[chainNamespace] ?? []

      const connectorConnectionMap = new Map<string, Connection>()

      for (const conn of existing) {
        connectorConnectionMap.set(conn.connectorId, { ...conn })
      }

      for (const conn of connections) {
        const existingConn = connectorConnectionMap.get(conn.connectorId)
        const isAuth = conn.connectorId === CommonConstantsUtil.CONNECTOR_ID.AUTH

        if (existingConn && !isAuth) {
          const existingAddrs = new Set(existingConn.accounts.map(a => a.address.toLowerCase()))
          const newAccounts = conn.accounts.filter(a => !existingAddrs.has(a.address.toLowerCase()))
          existingConn.accounts.push(...newAccounts)
        } else {
          connectorConnectionMap.set(conn.connectorId, { ...conn })
        }
      }

      const dedupedConnections = {
        ...existingConnections,
        [chainNamespace]: Array.from(connectorConnectionMap.values())
      }

      SafeLocalStorage.setItem(SafeLocalStorageKeys.CONNECTIONS, JSON.stringify(dedupedConnections))
    } catch (error) {
      console.error('Unable to sync connections to storage', error)
    }
  },
  getConnections() {
    try {
      const connectionsStorage = SafeLocalStorage.getItem(SafeLocalStorageKeys.CONNECTIONS)

      if (!connectionsStorage) {
        return {} as { [key in ChainNamespace]: Connection[] }
      }

      return JSON.parse(connectionsStorage) as { [key in ChainNamespace]: Connection[] }
    } catch (error) {
      console.error('Unable to get connections from storage', error)

      return {} as { [key in ChainNamespace]: Connection[] }
    }
  },
  deleteAddressFromConnection({
    connectorId,
    address,
    namespace
  }: DeleteAddressFromConnectionParams) {
    try {
      const connections = StorageUtil.getConnections()
      const namespaceConnections = connections[namespace] ?? []

      const connectionMap = new Map(namespaceConnections.map(conn => [conn.connectorId, conn]))

      const connector = connectionMap.get(connectorId)

      if (connector) {
        const updatedAccounts = connector.accounts.filter(
          acc => acc.address.toLowerCase() !== address.toLowerCase()
        )

        if (updatedAccounts.length === 0) {
          connectionMap.delete(connectorId)
        } else {
          connectionMap.set(connectorId, {
            ...connector,
            accounts: connector.accounts.filter(
              acc => acc.address.toLowerCase() !== address.toLowerCase()
            )
          })
        }
      }

      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.CONNECTIONS,
        JSON.stringify({
          ...connections,
          [namespace]: Array.from(connectionMap.values())
        })
      )
    } catch {
      console.error(
        `Unable to remove address "${address}" from connector "${connectorId}" in namespace "${namespace}"`
      )
    }
  },
  getDisconnectedConnectorIds() {
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.DISCONNECTED_CONNECTOR_IDS)

      if (!result) {
        return {} as { [key in ChainNamespace]: string[] }
      }

      return JSON.parse(result) as { [key in ChainNamespace]: string[] }
    } catch {
      console.info('Unable to get disconnected connector ids')
    }

    return {} as { [key in ChainNamespace]: string[] }
  },
  addDisconnectedConnectorId(connectorId: string, chainNamespace: ChainNamespace) {
    try {
      const currentDisconnectedConnectorIds = StorageUtil.getDisconnectedConnectorIds()

      const disconnectedConnectorIdsByNamespace =
        currentDisconnectedConnectorIds[chainNamespace] ?? []

      disconnectedConnectorIdsByNamespace.push(connectorId)

      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.DISCONNECTED_CONNECTOR_IDS,
        JSON.stringify({
          ...currentDisconnectedConnectorIds,
          [chainNamespace]: Array.from(new Set(disconnectedConnectorIdsByNamespace))
        })
      )
    } catch {
      console.error(
        `Unable to set disconnected connector id "${connectorId}" for namespace "${chainNamespace}"`
      )
    }
  },
  removeDisconnectedConnectorId(connectorId: string, chainNamespace: ChainNamespace) {
    try {
      const currentDisconnectedConnectorIds = StorageUtil.getDisconnectedConnectorIds()

      let disconnectedConnectorIdsByNamespace =
        currentDisconnectedConnectorIds[chainNamespace] ?? []

      disconnectedConnectorIdsByNamespace = disconnectedConnectorIdsByNamespace.filter(
        id => id.toLowerCase() !== connectorId.toLowerCase()
      )

      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.DISCONNECTED_CONNECTOR_IDS,
        JSON.stringify({
          ...currentDisconnectedConnectorIds,
          [chainNamespace]: Array.from(new Set(disconnectedConnectorIdsByNamespace))
        })
      )
    } catch {
      console.error(
        `Unable to remove disconnected connector id "${connectorId}" for namespace "${chainNamespace}"`
      )
    }
  },
  isConnectorDisconnected(connectorId: string, chainNamespace: ChainNamespace) {
    try {
      const currentDisconnectedConnectorIds = StorageUtil.getDisconnectedConnectorIds()

      const disconnectedConnectorIdsByNamespace =
        currentDisconnectedConnectorIds[chainNamespace] ?? []

      return disconnectedConnectorIdsByNamespace.some(
        id => id.toLowerCase() === connectorId.toLowerCase()
      )
    } catch {
      console.info(
        `Unable to get disconnected connector id "${connectorId}" for namespace "${chainNamespace}"`
      )
    }

    return false
  },
  getTransactionsCache() {
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.HISTORY_TRANSACTIONS_CACHE)

      return result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get transactions cache')
    }

    return {}
  },

  getTransactionsCacheForAddress({ address, chainId = '' }: { address: string; chainId?: string }) {
    try {
      const cache = StorageUtil.getTransactionsCache()
      const transactionsCache = cache[address]?.[chainId]

      // We want to discard cache if it's older than the cache expiry
      if (
        transactionsCache &&
        !this.isCacheExpired(transactionsCache.timestamp, this.cacheExpiry.transactionsHistory)
      ) {
        return transactionsCache.transactions
      }
      StorageUtil.removeTransactionsCache({ address, chainId })
    } catch {
      console.info('Unable to get transactions cache')
    }

    return undefined
  },
  updateTransactionsCache({
    address,
    chainId = '',
    timestamp,
    transactions
  }: {
    address: string
    chainId?: string
    timestamp: number
    transactions: BlockchainApiTransactionsResponse
  }) {
    try {
      const cache = StorageUtil.getTransactionsCache()
      cache[address] = {
        ...cache[address],
        [chainId]: {
          timestamp,
          transactions
        }
      }
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.HISTORY_TRANSACTIONS_CACHE,
        JSON.stringify(cache)
      )
    } catch {
      console.info('Unable to update transactions cache', {
        address,
        chainId,
        timestamp,
        transactions
      })
    }
  },
  removeTransactionsCache({ address, chainId }: { address: string; chainId: string }) {
    try {
      const cache = StorageUtil.getTransactionsCache()
      const addressCache = cache?.[address] || {}

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [chainId]: _removed, ...updatedChainData } = addressCache

      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.HISTORY_TRANSACTIONS_CACHE,
        JSON.stringify({
          ...cache,
          [address]: updatedChainData
        })
      )
    } catch {
      console.info('Unable to remove transactions cache', { address, chainId })
    }
  },
  getTokenPriceCache() {
    try {
      const result = SafeLocalStorage.getItem(SafeLocalStorageKeys.TOKEN_PRICE_CACHE)

      return result ? JSON.parse(result) : {}
    } catch {
      console.info('Unable to get token price cache')
    }

    return {}
  },
  getTokenPriceCacheForAddresses(addresses: string[]) {
    try {
      const cache = StorageUtil.getTokenPriceCache()
      const tokenPriceCache = cache[addresses.join(',')]
      if (
        tokenPriceCache &&
        !this.isCacheExpired(tokenPriceCache.timestamp, this.cacheExpiry.tokenPrice)
      ) {
        return tokenPriceCache.tokenPrice
      }
      StorageUtil.removeTokenPriceCache(addresses)
    } catch {
      console.info('Unable to get token price cache for addresses', addresses)
    }

    return undefined
  },
  updateTokenPriceCache(params: {
    addresses: string[]
    timestamp: number
    tokenPrice: BlockchainApiTokenPriceResponse
  }) {
    try {
      const cache = StorageUtil.getTokenPriceCache()
      cache[params.addresses.join(',')] = {
        timestamp: params.timestamp,
        tokenPrice: params.tokenPrice
      }
      SafeLocalStorage.setItem(SafeLocalStorageKeys.TOKEN_PRICE_CACHE, JSON.stringify(cache))
    } catch {
      console.info('Unable to update token price cache', params)
    }
  },
  removeTokenPriceCache(addresses: string[]) {
    try {
      const cache = StorageUtil.getTokenPriceCache()
      SafeLocalStorage.setItem(
        SafeLocalStorageKeys.TOKEN_PRICE_CACHE,
        JSON.stringify({ ...cache, [addresses.join(',')]: undefined })
      )
    } catch {
      console.info('Unable to remove token price cache', addresses)
    }
  }
}
