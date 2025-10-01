declare module 'react/jsx-runtime' {
  export { Fragment, jsx, jsxs } from 'react'
}

declare namespace JSX {
  interface IntrinsicElements {
    [elemName: string]: any;
  }
}