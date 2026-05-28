import 'react'

declare module 'react' {
  interface SVGAttributes<T> {
    strokeWidth?: number | string | undefined
  }
}
