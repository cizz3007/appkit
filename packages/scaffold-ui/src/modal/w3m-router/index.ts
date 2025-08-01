import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'

import type { RouterControllerState } from '@reown/appkit-controllers'
import { RouterController, TooltipController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-ui'

import { ConstantsUtil } from '../../utils/ConstantsUtil.js'
import styles from './styles.js'

@customElement('w3m-router')
export class W3mRouter extends LitElement {
  public static override styles = styles

  // -- Members ------------------------------------------- //
  private resizeObserver?: ResizeObserver = undefined

  private prevHeight = '0px'

  private prevHistoryLength = 1

  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @state() private view = RouterController.state.view

  @state() private viewDirection = ''

  public constructor() {
    super()
    this.unsubscribe.push(RouterController.subscribeKey('view', val => this.onViewChange(val)))
  }

  public override firstUpdated() {
    this.resizeObserver = new ResizeObserver(([content]) => {
      const height = `${content?.contentRect.height}px`
      if (this.prevHeight !== '0px') {
        this.style.setProperty('--prev-height', this.prevHeight)
        this.style.setProperty('--new-height', height)
        this.style.animation = 'w3m-view-height 150ms forwards ease'
        this.style.height = 'auto'
      }
      setTimeout(() => {
        this.prevHeight = height
        this.style.animation = 'unset'
      }, ConstantsUtil.ANIMATION_DURATIONS.ModalHeight)
    })
    this.resizeObserver?.observe(this.getWrapper())
  }

  public override disconnectedCallback() {
    this.resizeObserver?.unobserve(this.getWrapper())
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`<div class="w3m-router-container" view-direction="${this.viewDirection}">
      ${this.viewTemplate()}
    </div>`
  }

  // -- Private ------------------------------------------- //
  private viewTemplate() {
    // - These components are imported from the scaffold exports according to the case. This would render empty if the component is not imported.
    switch (this.view) {
      // Core Views
      case 'AccountSettings':
        return html`<w3m-account-settings-view></w3m-account-settings-view>`
      case 'Account':
        return html`<w3m-account-view></w3m-account-view>`
      case 'AllWallets':
        return html`<w3m-all-wallets-view></w3m-all-wallets-view>`
      case 'ApproveTransaction':
        return html`<w3m-approve-transaction-view></w3m-approve-transaction-view>`
      case 'BuyInProgress':
        return html`<w3m-buy-in-progress-view></w3m-buy-in-progress-view>`
      case 'ChooseAccountName':
        return html`<w3m-choose-account-name-view></w3m-choose-account-name-view>`
      case 'Connect':
        return html`<w3m-connect-view></w3m-connect-view>`
      case 'Create':
        return html`<w3m-connect-view walletGuide="explore"></w3m-connect-view>`
      case 'ConnectingWalletConnect':
        return html`<w3m-connecting-wc-view></w3m-connecting-wc-view>`
      case 'ConnectingWalletConnectBasic':
        return html`<w3m-connecting-wc-basic-view></w3m-connecting-wc-basic-view>`
      case 'ConnectingExternal':
        return html`<w3m-connecting-external-view></w3m-connecting-external-view>`
      case 'ConnectingSiwe':
        return html`<w3m-connecting-siwe-view></w3m-connecting-siwe-view>`
      case 'ConnectWallets':
        return html`<w3m-connect-wallets-view></w3m-connect-wallets-view>`
      case 'ConnectSocials':
        return html`<w3m-connect-socials-view></w3m-connect-socials-view>`
      case 'ConnectingSocial':
        return html`<w3m-connecting-social-view></w3m-connecting-social-view>`
      case 'DataCapture':
        return html`<w3m-data-capture-view></w3m-data-capture-view>`
      case 'DataCaptureOtpConfirm':
        return html`<w3m-data-capture-otp-confirm-view></w3m-data-capture-otp-confirm-view>`
      case 'Downloads':
        return html`<w3m-downloads-view></w3m-downloads-view>`
      case 'EmailLogin':
        return html`<w3m-email-login-view></w3m-email-login-view>`
      case 'EmailVerifyOtp':
        return html`<w3m-email-verify-otp-view></w3m-email-verify-otp-view>`
      case 'EmailVerifyDevice':
        return html`<w3m-email-verify-device-view></w3m-email-verify-device-view>`
      case 'GetWallet':
        return html`<w3m-get-wallet-view></w3m-get-wallet-view>`
      case 'Networks':
        return html`<w3m-networks-view></w3m-networks-view>`
      case 'SwitchNetwork':
        return html`<w3m-network-switch-view></w3m-network-switch-view>`
      case 'ProfileWallets':
        return html`<w3m-profile-wallets-view></w3m-profile-wallets-view>`
      case 'Transactions':
        return html`<w3m-transactions-view></w3m-transactions-view>`
      case 'OnRampProviders':
        return html`<w3m-onramp-providers-view></w3m-onramp-providers-view>`
      case 'OnRampTokenSelect':
        return html`<w3m-onramp-token-select-view></w3m-onramp-token-select-view>`
      case 'OnRampFiatSelect':
        return html`<w3m-onramp-fiat-select-view></w3m-onramp-fiat-select-view>`
      case 'UpgradeEmailWallet':
        return html`<w3m-upgrade-wallet-view></w3m-upgrade-wallet-view>`
      case 'UpdateEmailWallet':
        return html`<w3m-update-email-wallet-view></w3m-update-email-wallet-view>`
      case 'UpdateEmailPrimaryOtp':
        return html`<w3m-update-email-primary-otp-view></w3m-update-email-primary-otp-view>`
      case 'UpdateEmailSecondaryOtp':
        return html`<w3m-update-email-secondary-otp-view></w3m-update-email-secondary-otp-view>`
      case 'UnsupportedChain':
        return html`<w3m-unsupported-chain-view></w3m-unsupported-chain-view>`
      case 'Swap':
        return html`<w3m-swap-view></w3m-swap-view>`
      case 'SwapSelectToken':
        return html`<w3m-swap-select-token-view></w3m-swap-select-token-view>`
      case 'SwapPreview':
        return html`<w3m-swap-preview-view></w3m-swap-preview-view>`
      case 'WalletSend':
        return html`<w3m-wallet-send-view></w3m-wallet-send-view>`
      case 'WalletSendSelectToken':
        return html`<w3m-wallet-send-select-token-view></w3m-wallet-send-select-token-view>`
      case 'WalletSendPreview':
        return html`<w3m-wallet-send-preview-view></w3m-wallet-send-preview-view>`
      case 'WhatIsABuy':
        return html`<w3m-what-is-a-buy-view></w3m-what-is-a-buy-view>`
      case 'WalletReceive':
        return html`<w3m-wallet-receive-view></w3m-wallet-receive-view>`
      case 'WalletCompatibleNetworks':
        return html`<w3m-wallet-compatible-networks-view></w3m-wallet-compatible-networks-view>`
      case 'WhatIsAWallet':
        return html`<w3m-what-is-a-wallet-view></w3m-what-is-a-wallet-view>`
      case 'ConnectingMultiChain':
        return html`<w3m-connecting-multi-chain-view></w3m-connecting-multi-chain-view>`
      case 'WhatIsANetwork':
        return html`<w3m-what-is-a-network-view></w3m-what-is-a-network-view>`
      case 'ConnectingFarcaster':
        return html`<w3m-connecting-farcaster-view></w3m-connecting-farcaster-view>`
      case 'SwitchActiveChain':
        return html`<w3m-switch-active-chain-view></w3m-switch-active-chain-view>`
      case 'RegisterAccountName':
        return html`<w3m-register-account-name-view></w3m-register-account-name-view>`
      case 'RegisterAccountNameSuccess':
        return html`<w3m-register-account-name-success-view></w3m-register-account-name-success-view>`
      case 'SmartSessionCreated':
        return html`<w3m-smart-session-created-view></w3m-smart-session-created-view>`
      case 'SmartSessionList':
        return html`<w3m-smart-session-list-view></w3m-smart-session-list-view>`
      case 'SIWXSignMessage':
        return html`<w3m-siwx-sign-message-view></w3m-siwx-sign-message-view>`
      case 'Pay':
        return html`<w3m-pay-view></w3m-pay-view>`
      case 'PayLoading':
        return html`<w3m-pay-loading-view></w3m-pay-loading-view>`
      default:
        return html`<w3m-connect-view></w3m-connect-view>`
    }
  }

  private onViewChange(newView: RouterControllerState['view']) {
    TooltipController.hide()

    let direction = ConstantsUtil.VIEW_DIRECTION.Next
    const { history } = RouterController.state
    if (history.length < this.prevHistoryLength) {
      direction = ConstantsUtil.VIEW_DIRECTION.Prev
    }

    this.prevHistoryLength = history.length
    this.viewDirection = direction

    setTimeout(() => {
      this.view = newView
    }, ConstantsUtil.ANIMATION_DURATIONS.ViewTransition)
  }

  private getWrapper() {
    return this.shadowRoot?.querySelector('div') as HTMLElement
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-router': W3mRouter
  }
}
