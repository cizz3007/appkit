import { WalletProviderApp } from '@nexon-wallet/dapp-sdk-dev'
import { type CreateConfigParameters, createConnector } from '@wagmi/core'
import { SwitchChainError, getAddress } from 'viem'
import type { Address } from 'viem'

import { ConstantsUtil as CommonConstantsUtil, ConstantsUtil } from '@reown/appkit-common'
import { NetworkUtil } from '@reown/appkit-common'
import { ChainController, ConnectorController } from '@reown/appkit-controllers'

// -- Types ----------------------------------------------------------------------------------------
interface MsuWalletProviderOptions {
  enableAuthLogger?: boolean
}

export type MsuWalletParameters = {
  chains?: CreateConfigParameters['chains']
  options: MsuWalletProviderOptions
}

// -- Connector ------------------------------------------------------------------------------------
export function msuWalletConnector(parameters: MsuWalletParameters) {
  let currentAccounts: Address[] = []
  let msuProvider: WalletProviderApp | undefined = undefined
  let connectPromise:
    | Promise<{
        accounts: Address[]
        account: Address
        chainId: number
        chain: {
          id: number
          unsuported: boolean
        }
      }>
    | undefined = undefined
  type Properties = {
    provider?: WalletProviderApp
  }

  function parseChainId(chainId: string | number) {
    return NetworkUtil.parseEvmChainId(chainId) || 1
  }

  function getProviderInstance() {
    if (!msuProvider) {
      msuProvider = new WalletProviderApp()
    }

    return msuProvider
  }

  async function connectMsuWallet(
    options: {
      chainId?: number
      isReconnecting?: boolean
    } = {}
  ) {
    const provider = getProviderInstance()
    let chainId = options.chainId

    if (options.isReconnecting) {
      // MSU Wallet은 getLastUsedChainId 메서드가 없으므로 기본값 사용
      const defaultChainId = parameters.chains?.[0]?.id
      chainId = defaultChainId || 1

      if (!chainId) {
        throw new Error('ChainId not found in provider')
      }
    }

    try {
      // MSU 지갑 연결
      const response = await provider.connect()

      if (!response) {
        throw new Error('Connection failed')
      }

      // 계정 정보 추출 - NexonLoginResponse에서 적절한 속성 추출
      const responseData = response as unknown as Record<string, unknown>
      const address = responseData['address'] || responseData['account'] || ''

      if (!address) {
        throw new Error('No address found in connection response')
      }

      currentAccounts = [address as Address]

      // 체인 ID 가져오기
      let actualChainId: number = parseChainId(chainId || 1)
      try {
        const chainIdHex = await provider.request({
          method: 'eth_chainId',
          params: []
        })
        actualChainId = parseChainId(chainIdHex)
      } catch {
        // 기본값 사용
      }

      return {
        accounts: currentAccounts,
        account: address as Address,
        chainId: actualChainId,
        chain: {
          id: actualChainId,
          unsuported: false
        }
      }
    } catch (error) {
      throw new Error(
        `Failed to connect to MSU Wallet: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  return createConnector<WalletProviderApp, Properties>(config => {
    // EIP-1193 이벤트 리스너 설정
    function setupEventListeners(provider: WalletProviderApp) {
      provider.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          // 연결 해제 시
          currentAccounts = []
          config.emitter.emit('disconnect')
        } else {
          // 계정 변경 시
          const newAccounts = accounts.map(getAddress)
          currentAccounts = newAccounts
          config.emitter.emit('change', { accounts: newAccounts })
        }
      })

      provider.on('chainChanged', (chainId: string) => {
        const newChainId = parseChainId(chainId)
        config.emitter.emit('change', { chainId: newChainId })
      })

      provider.on('disconnect', () => {
        currentAccounts = []
        config.emitter.emit('disconnect')
      })
    }

    return {
      id: 'msuWallet',
      name: 'MSU Wallet',
      type: 'MSU_WALLET',
      chain: CommonConstantsUtil.CHAIN.EVM,

      async connect(
        options: {
          chainId?: number
          isReconnecting?: boolean
        } = {}
      ) {
        if (connectPromise) {
          return connectPromise
        }

        connectPromise = connectMsuWallet(options)
        try {
          const result = await connectPromise

          return result
        } finally {
          connectPromise = undefined
        }
      },

      async disconnect() {
        try {
          const provider = await this.getProvider()
          await provider.disconnect()
          currentAccounts = []
          config.emitter.emit('disconnect')
        } catch (error) {
          console.warn('Error during disconnect:', error)
        }
      },

      getAccounts() {
        if (!currentAccounts?.length) {
          return Promise.resolve([])
        }

        return Promise.resolve(currentAccounts)
      },

      async getProvider() {
        if (!this.provider) {
          this.provider = getProviderInstance()
          setupEventListeners(this.provider)
        }

        return Promise.resolve(this.provider)
      },

      async getChainId() {
        const provider: WalletProviderApp = await this.getProvider()

        try {
          const chainIdHex = await provider.request({
            method: 'eth_chainId',
            params: []
          })

          return parseChainId(chainIdHex)
        } catch (error) {
          console.warn('Failed to get chainId from provider:', error)

          return 1
        }
      },

      async isAuthorized() {
        const activeChain = ChainController.state.activeChain
        const isActiveChainEvm = activeChain === CommonConstantsUtil.CHAIN.EVM
        const isAnyMsuConnected = ConstantsUtil.AUTH_CONNECTOR_SUPPORTED_CHAINS.some(
          chain => ConnectorController.getConnectorId(chain) === 'msuWallet'
        )

        if (isAnyMsuConnected && !isActiveChainEvm) {
          return false
        }

        try {
          const accounts = await this.getAccounts()

          return accounts.length > 0
        } catch {
          return false
        }
      },

      async switchChain({ chainId }) {
        try {
          const chain = config.chains.find(c => c.id === chainId)
          if (!chain) {
            throw new SwitchChainError(new Error('Chain not found on connector.'))
          }

          const provider = await this.getProvider()

          // 체인 전환 시도
          try {
            await provider.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: `0x${chainId.toString(16)}` }]
            })
          } catch (switchError) {
            // 체인 추가 시도
            const addEthereumChain = {
              chainId: `0x${chainId.toString(16)}`,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: chain.rpcUrls?.default?.http || []
            }

            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [addEthereumChain]
            })
          }

          // 체인 전환 후 계정 정보 업데이트
          try {
            const response = await provider.connect()
            if (response) {
              const responseData = response as unknown as Record<string, unknown>
              const address = responseData['address'] || responseData['account'] || ''
              if (address) {
                currentAccounts = [address as Address]
              }
            }
          } catch (error) {
            console.warn('Failed to reconnect after chain switch:', error)
          }

          config.emitter.emit('change', {
            chainId: Number(chainId),
            accounts: currentAccounts
          })

          return chain
        } catch (error) {
          if (error instanceof Error) {
            throw new SwitchChainError(error)
          }

          throw error
        }
      },

      onAccountsChanged(accounts) {
        if (accounts.length === 0) {
          this.onDisconnect()
        } else {
          const newAccounts = accounts.map(getAddress)
          currentAccounts = newAccounts
          config.emitter.emit('change', { accounts: newAccounts })
        }
      },

      onChainChanged(chain) {
        const chainId = Number(chain)
        config.emitter.emit('change', { chainId })
      },

      async onDisconnect(_error) {
        try {
          const provider = await this.getProvider()
          await provider.disconnect()
          currentAccounts = []
        } catch (error) {
          console.warn('Error during disconnect:', error)
        }
      }
    }
  })
}
