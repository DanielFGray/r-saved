// @flow
import React from 'react'
import { render } from 'react-dom'
import 'normalize.css'
import './style.sss'
import Provider from './actions'
import Home from './containers/Home'

const Init = Provider(() => (
  <Home />
))

render(<Init />, document.getElementById('main'))
