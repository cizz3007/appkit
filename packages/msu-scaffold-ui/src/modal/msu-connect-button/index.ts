import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

import type { ChainNamespace } from '@reown/appkit-common'
import { ModalController } from '@reown/appkit-controllers'
import { customElement } from '@reown/appkit-msu-ui'
import type { MsuConnectButton } from '@reown/appkit-msu-ui/wui-connect-button'
import '@reown/appkit-msu-ui/wui-connect-button'

class MsuWalletConnectButtonBase extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property() public size?: MsuConnectButton['size'] = '12'

  @property() public label? = 'Connect Wallet'

  @property() public loadingLabel? = 'Connecting...'

  @property() public namespace?: ChainNamespace

  @state() private open = ModalController.state.open

  @state() private loading = this.namespace
    ? ModalController.state.loadingNamespaceMap.get(this.namespace)
    : ModalController.state.loading

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ModalController.subscribe(val => {
        this.open = val.open
        this.loading = this.namespace ? val.loadingNamespaceMap.get(this.namespace) : val.loading
      })
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
      <msu-connect-button
        size=${ifDefined(this.size)}
        .loading=${this.loading}
        @click=${this.onClick.bind(this)}
        data-testid=${`connect-button${this.namespace ? `-${this.namespace}` : ''}`}
      >
        ${this.loading ? this.loadingLabel : this.label}
      </msu-connect-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (this.open) {
      ModalController.close()
    } else if (!this.loading) {
      ModalController.open({ view: 'Connect', namespace: this.namespace })
    }
  }
}

@customElement('msu-wallet-connect-button')
export class MsuWalletConnectButton extends MsuWalletConnectButtonBase {}

@customElement('appkit-connect-button')
export class AppKitConnectButton extends MsuWalletConnectButtonBase {}

declare global {
  interface HTMLElementTagNameMap {
    'msu-wallet-connect-button': MsuWalletConnectButton
    'appkit-connect-button': AppKitConnectButton
  }
}
