import { LitElement, html } from 'lit'
import { property } from 'lit/decorators.js'

import '../../components/wui-icon/index.js'
import '../../components/wui-loading-spinner/index.js'
import '../../components/wui-text/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import type { SizeType } from '../../utils/TypeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'

// Msu Connect Wallet button
@customElement('msu-connect-button')
export class MsuConnectButton extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public size: Exclude<SizeType, 'inherit' | 'xl' | 'lg' | 'xs' | 'xxs'> | '12' = '12'

  @property({ type: Boolean }) public loading = false

  // -- Render -------------------------------------------- //
  public override render() {
    const textVariant = this.size === 'md' ? 'paragraph-600' : 'small-600'

    return html`
      <button data-size=${this.size} ?disabled=${this.loading}>
        ${this.loadingTemplate()}
        <wui-text variant=${textVariant} color=${this.loading ? 'accent-100' : 'inherit'}>
          <slot></slot>
        </wui-text>
      </button>
    `
  }

  public loadingTemplate() {
    if (!this.loading) {
      return html`<wui-icon name="connectWallet" size="md" color="neutral-black"></wui-icon>`
    }

    return html`<wui-loading-spinner
      size=${this.size === '12' ? 'lg' : this.size}
      color="accent-100"
    ></wui-loading-spinner>`
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'msu-connect-button': MsuConnectButton
  }
}
