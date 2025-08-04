import { css } from 'lit'

export default css`
  :host {
    display: flex;
  }

  :host([data-size='sm']) {
    width: 12px;
    height: 12px;
  }

  :host([data-size='md']) {
    width: 16px;
    height: 16px;
  }

  :host([data-size='lg']) {
    width: 24px;
    height: 24px;
  }

  :host([data-size='xl']) {
    width: 32px;
    height: 32px;
  }
`
