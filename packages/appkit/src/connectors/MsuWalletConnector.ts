import { WalletProviderApp } from '@nexon-wallet/dapp-sdk-dev'
import {
  ProviderRpcError,
  SwitchChainError,
  UserRejectedRequestError,
  type WalletClient,
  createWalletClient,
  custom,
  getAddress,
  numberToHex
} from 'viem'

import { type CaipNetwork, type ChainNamespace } from '@reown/appkit-common'
import { ChainController } from '@reown/appkit-controllers'
import { PresetsUtil } from '@reown/appkit-utils'

import type { ChainAdapterConnector } from '../adapters/ChainAdapterConnector.js'

// 기존 viem Connector 관련 타입들을 정의
type ConnectorIds = 'msuWallet'

// 누락된 클래스들을 any로 대체
const Connector: any = class {
  protected storage?: any
  protected shimDisconnectKey: string = ''

  constructor(config: any = {}) {
    // 기본 생성자
  }

  emit(event: string, data: any): void {
    // 이벤트 발생 로직
  }
}

const ConnectorNotFoundError: any = class extends Error {
  constructor() {
    super('Connector not found')
  }
}

const ChainNotConfiguredForConnectorError: any = class extends Error {
  constructor() {
    super('Chain not configured for connector')
  }
}

function normalizeChainId(chainId: string | number): number {
  if (typeof chainId === 'string') {
    return parseInt(chainId, chainId.startsWith('0x') ? 16 : 10)
  }

  return chainId
}

export class MsuWalletConnector extends Connector implements ChainAdapterConnector {
  readonly id: ConnectorIds = 'msuWallet'
  readonly name = 'MsuWallet'
  readonly type = 'ANNOUNCED'
  readonly imageId = PresetsUtil.ConnectorImageIds['msuWallet'] || 'msu-wallet'
  readonly chain: ChainNamespace = 'eip155'
  public provider?: any
  ready = true

  #initProviderPromise?: Promise<void>
  #email?: string

  protected shimDisconnectKey = `${this.id}.shimDisconnect`
  protected caipNetworks: CaipNetwork[]
  private getCaipNetworks = ChainController.getCaipNetworks.bind(ChainController)

  constructor({ config }: any = {}) {
    super({
      ...config
    })
    this.caipNetworks = this.getCaipNetworks()
  }

  get chains() {
    return this.getCaipNetworks()
  }

  async #createProvider() {
    if (!this.#initProviderPromise && typeof window !== 'undefined') {
      this.#initProviderPromise = this.#initProvider()
    }

    return this.#initProviderPromise
  }

  async #initProvider() {
    if (!this.provider) {
      // WalletProviderApp 인스턴스 생성 (실제 구현에서는 import된 클래스 사용)
      this.provider = new WalletProviderApp()
    }
  }

  async getProvider() {
    if (!this.provider) {
      await this.#createProvider()
    }

    return this.provider
  }

  async connect() {
    await this.#createProvider()
    try {
      const provider = await this.getProvider()
      if (!provider) {
        throw new Error('provider not found')
      }

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged)
        provider.on('chainChanged', this.onChainChanged)
        provider.on('disconnect', this.onDisconnect)
      }

      const res = await provider.connect()
      const account = res?.walletAddress
      const email = res?.email
      this.#email = email

      if (!account) {
        throw new Error('연결 실패: 계정을 찾을 수 없습니다')
      }

      this['storage']?.setItem(this.shimDisconnectKey, 'true')

      this['emit']('connect', {})

      const chainId = await this.getChainId()

      return {
        account: getAddress(account),
        chain: { id: chainId, unsupported: false },
        provider,
        email
      }
    } catch (error) {
      if (this.isUserRejectedRequestError(error)) {
        throw new Error('User rejected request')
      }
      if ((error as ProviderRpcError).code === -32002) {
        throw new Error('Resource not found')
      }
      throw error
    }
  }

  async disconnect() {
    const provider = await this.getProvider()
    if (!provider?.removeListener) {
      return
    }
    provider.removeListener('accountsChanged', this.onAccountsChanged)
    provider.removeListener('chainChanged', this.onChainChanged)
    provider.removeListener('disconnect', this.onDisconnect)
    // Remove shim signalling wallet is disconnected
    this['storage']?.removeItem(this.shimDisconnectKey)

    await this.provider?.disconnect()
  }

  async getAccount() {
    const provider = this.provider
    if (!provider) {
      throw new ConnectorNotFoundError()
    }

    const accounts = await provider?.request({
      method: 'eth_accounts'
    })

    if (!accounts?.[0]) {
      throw new ConnectorNotFoundError()
    }

    const result = getAddress(accounts[0] as string)

    return result
  }

  async getChainId() {
    const provider = await this.getProvider()
    if (!provider) {
      throw new ConnectorNotFoundError()
    }

    return provider.request({ method: 'eth_chainId' }).then(normalizeChainId)
  }

  async switchChain(chainId: number) {
    const provider = await this.getProvider()
    if (!provider) {
      throw new ConnectorNotFoundError()
    }
    const id = numberToHex(chainId)

    try {
      await Promise.all([
        provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: id }]
        }),
        new Promise<void>(res => {
          this.on('change', ({ chain }) => {
            if (chain?.id === chainId) {
              res()
            }
          })
        })
      ])

      return (
        this.chains.find(x => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: id,
          nativeCurrency: { name: 'Ether', decimals: 18, symbol: 'ETH' },
          rpcUrls: { default: { http: [''] }, public: { http: [''] } },
          iconUrls: [
            'https://qa.msu.io/marketplace/images/neso_token_symbol.png',
            'https://qa.msu.io/marketplace/images/neso_token_symbol.png'
          ]
        }
      )
    } catch (error) {
      const chain = this.chains.find(x => x.id === chainId)
      if (!chain) {
        throw new ChainNotConfiguredForConnectorError()
      }

      // Indicates chain is not added to provider
      if (
        (error as ProviderRpcError).code === 4902 ||
        /* Unwrapping for MetaMask Mobile
         * https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719 */
        (error as ProviderRpcError<{ originalError?: { code: number } }>)?.data?.originalError
          ?.code === 4902
      ) {
        try {
          await provider.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: id,
                chainName: chain.name,
                nativeCurrency: chain.nativeCurrency,
                rpcUrls: [chain.rpcUrls['public']?.http[0] ?? ''],
                blockExplorerUrls: this.getBlockExplorerUrls(chain)
              }
            ]
          })

          const currentChainId = await this.getChainId()
          if (currentChainId !== chainId) {
            throw new UserRejectedRequestError(
              new Error('User rejected switch after adding network.')
            )
          }

          return chain
        } catch (error) {
          throw new UserRejectedRequestError(error as Error)
        }
      }

      if (this.isUserRejectedRequestError(error)) {
        throw new UserRejectedRequestError(error as Error)
      }
      throw new SwitchChainError(error as Error)
    }
  }

  async getWalletClient({ chainId }: { chainId?: number } = {}): Promise<WalletClient> {
    const [provider, account] = await Promise.all([this.getProvider(), this.getAccount()])
    const chain = this.chains.find(x => x.id === chainId) as any
    if (!provider) {
      throw new Error('provider is required.')
    }

    return createWalletClient({
      account,
      chain,
      transport: custom(provider)
    })
  }

  async isAuthorized() {
    try {
      if (!this['storage']?.getItem(this.shimDisconnectKey)) {
        return false
      }

      await this.#createProvider()
      const provider = await this.getProvider()
      if (!provider) {
        throw new ConnectorNotFoundError()
      }
      const account = await this.getAccount()

      return Boolean(account)
    } catch {
      return false
    }
  }

  protected isUserRejectedRequestError(error: unknown) {
    return (error as ProviderRpcError).code === 4001
  }

  protected isChainUnsupported(chainId: number): boolean {
    return !this.chains.find(chain => chain.id === chainId)
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      this['emit']('disconnect', {})
    } else {
      this['emit']('change', {
        account: getAddress(accounts[0] as string)
      })
    }
  }

  protected onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId)
    const unsupported = this.isChainUnsupported(id)
    this['emit']('change', { chain: { id, unsupported } })
  }

  protected onDisconnect = async (error: Error) => {
    /* If MetaMask emits a `code: 1013` error, wait for reconnection before disconnecting
     * https://github.com/MetaMask/providers/pull/120 */
    if ((error as ProviderRpcError).code === 1013) {
      const provider = await this.getProvider()
      if (provider) {
        const isAuthorized = await this.getAccount()
        if (isAuthorized) {
          return
        }
      }
    }

    this['emit']('disconnect', {})
    // Remove shim signalling wallet is disconnected
    this['storage']?.removeItem(this.shimDisconnectKey)
  }

  getConnectedAccountEmail = () => this.#email

  private getBlockExplorerUrls(chain: any) {
    return chain.blockExplorers?.default?.url ? [chain.blockExplorers.default.url] : undefined
  }

  private on(_event: string, _callback: (data: any) => void) {
    // 이벤트 리스너 등록 로직
  }
}
