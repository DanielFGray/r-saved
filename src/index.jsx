// @flow
import React from 'react'
import { render } from 'react-dom'

import 'normalize.css'
import './style.sss'

import Home from './containers/Home'

const Init = () => (
  <Home />
)

render(<Init />, document.getElementById('main'))
