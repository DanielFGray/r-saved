import React from 'react'
import { type } from 'ramda'

const replacer = (key, value) => {
  const t = type(value)
  switch (t) {
  case 'Function':
  case 'AsyncFunction':
    return `[${t}]`
  default:
    return value
  }
}

export default function Stringify(props) {
  return (
    <pre>
      {JSON.stringify(props, replacer, 2)}
    </pre>
  )
}
