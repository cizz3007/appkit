import { css } from 'lit'

export default css`
  :host {
    position: relative;
    display: block;
  }

  button {
    background: var(--transparent);
    border: 1px solid var(--neutral-black);
    border-radius: var(--wui-border-radius-xxs);
    color: var(--neutral-black);
    gap: var(--wui-spacing-3xs);
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.1);
    font-weight: 500;
    line-height: 1;
  }

  button.loading {
    background-color: var(--neutral-black);
    border-color: var(--neutral-black);
    color: var(--neutral-white);
    pointer-events: none;
  }

  button:disabled {
    background-color: var(--neutral-black);
    border-color: var(--neutral-black);
    color: var(--neutral-white);
  }

  button:disabled > wui-text {
    color: var(--neutral-white);
  }

  @media (hover: hover) and (pointer: fine) {
    button:hover:enabled {
      background-color: var(--neutral-black);
      border-color: var(--neutral-black);
      color: var(--neutral-white);
    }

    button:hover:enabled > wui-text {
      color: var(--neutral-white);
    }

    button:active:enabled {
      background-color: var(--wui-color-accent-080);
    }
  }

  button:focus-visible {
    border: 1px solid var(--neutral-black);
    background-color: var(--neutral-black);
    color: var(--neutral-white);
    -webkit-box-shadow: 0px 0px 0px 5px var(--wui-box-shadow-blue);
    -moz-box-shadow: 0px 0px 0px 5px var(--wui-box-shadow-blue);
    box-shadow: 0px 0px 0px 5px var(--wui-box-shadow-blue);
  }

  button:focus-visible > wui-text {
    color: var(--neutral-white);
  }

  button[data-size='sm'] {
    padding: 6.75px 10px 7.25px;
  }

  button[data-size='12'] {
    height: 40px;
    padding: 12px;
  }

  ::slotted(*) {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    opacity: var(--local-opacity-100);
  }

  button > wui-text {
    transition: opacity var(--wui-ease-out-power-1) var(--wui-duration-md);
    will-change: opacity;
    color: var(--neutral-black);
  }

  button[data-size='md'] {
    padding: 9px var(--wui-spacing-l) 9px var(--wui-spacing-l);
  }

  button[data-size='md'] + wui-text {
    padding-left: var(--wui-spacing-3xs);
  }

  @media (max-width: 500px) {
    button[data-size='md'] {
      height: 32px;
      padding: 5px 12px;
    }

    button[data-size='md'] > wui-text > slot {
      font-size: 14px !important;
    }
  }

  wui-loading-spinner {
    width: 20px;
    height: 20px;
  }

  wui-loading-spinner::slotted(svg) {
    width: 10px !important;
    height: 10px !important;
  }

  button[data-size='sm'] > wui-loading-spinner {
    width: 16px;
    height: 16px;
  }
`
