import { beforeAll, describe, expect, it, vi } from 'vitest'

import { ChainController, ConnectionController, CoreHelperUtil } from '@reown/appkit-controllers'

import { AppKit } from '../../src/client/appkit.js'
import { mainnet, sepolia } from '../mocks/Networks.js'
import { mockOptions } from '../mocks/Options.js'
import { mockUniversalProvider } from '../mocks/Providers.js'
import {
  mockBlockchainApiController,
  mockRemoteFeatures,
  mockStorageUtil,
  mockWindowAndDocument
} from '../test-utils.js'

describe('WalletConnect Events', () => {
  beforeAll(() => {
    mockWindowAndDocument()
    mockStorageUtil()
    mockBlockchainApiController()
    mockRemoteFeatures()
  })

  describe('chainChanged', () => {
    it('should call setUnsupportedNetwork', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setUnsupportedNetworkSpy = vi.spyOn(appkit as any, 'setUnsupportedNetwork')
      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback('unknown_chain_id')

      expect(setUnsupportedNetworkSpy).toHaveBeenCalledWith('unknown_chain_id')
    })

    it('should call setCaipNetwork', async () => {
      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()
      const setActiveCaipNetwork = vi.spyOn(ChainController, 'setActiveCaipNetwork')

      const chainChangedCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'chainChanged'
      )?.[1]

      if (!chainChangedCallback) {
        throw new Error('chainChanged callback not found')
      }

      chainChangedCallback(sepolia.id)
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(sepolia)

      chainChangedCallback(mainnet.id.toString())
      expect(setActiveCaipNetwork).toHaveBeenCalledWith(mainnet)
    })
  })

  describe('display_uri', () => {
    it('should call openUri', () => {
      new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })

      const setUriSpy = vi.spyOn(ConnectionController, 'setUri')
      const displayUriCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'display_uri'
      )?.[1]

      if (!displayUriCallback) {
        throw new Error('display_uri callback not found')
      }

      displayUriCallback('mock_uri')
      expect(setUriSpy).toHaveBeenCalledWith('mock_uri')
    })
  })

  describe('connect', () => {
    it('should call finalizeWcConnection once connected', async () => {
      vi.spyOn(CoreHelperUtil, 'getAccount').mockReturnValueOnce({
        address: '0x123',
        chainId: '1'
      })
      const finalizeWcConnectionSpy = vi
        .spyOn(ConnectionController, 'finalizeWcConnection')
        .mockReturnValueOnce()
      mockUniversalProvider.on.mockClear()

      const appkit = new AppKit({
        ...mockOptions,
        adapters: [],
        universalProvider: mockUniversalProvider as any
      })
      await appkit.ready()

      const connectCallback = mockUniversalProvider.on.mock.calls.find(
        ([event]) => event === 'connect'
      )?.[1]

      if (!connectCallback) {
        throw new Error('connect callback not found')
      }

      connectCallback()

      expect(finalizeWcConnectionSpy).toHaveBeenCalledWith('0x123')
    })
  })
})
