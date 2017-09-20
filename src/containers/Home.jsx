// @flow
import * as React from 'react'
import { injectState } from 'freactal'

import SavedList from '../containers/SavedList'
import Splash from '../components/Splash'

import type { Saved } from '../types'

const objectToString = (obj, join = '=&') =>
  Object.entries(obj)
    .map(p => p.map(e => encodeURIComponent(e)).join(join[0]))
    .join(join[1])

class Home extends React.Component {
  props: {
    effects: {
      getSaved: Function,
      setFlag: Function,
    },
    state: {
      saved: Saved[],
      authPending: boolean,
      savedPending: boolean,
      signIn: boolean,
      apiOpts: Object,
    },
  }

  componentDidMount() {
    window.addEventListener('message', ev => {
      if (typeof ev.data !== 'string' || ! ev.data) return
      const data = ev.data // this is probably dumb
        .split('&')
        .map(e => e.split('=').map(p => decodeURIComponent(p)))
        .reduce((a, [k, v]) => ({ ...a, [k]: v }), {})
      console.log(data)
      this.props.effects.setFlag('authPending', false)
      this.props.effects.setFlag('signIn', true)
      this.props.effects.getSaved(data.access_token)
    })
  }

  authorize = () => {
    window.open(
      `https://www.reddit.com/api/v1/authorize/?${objectToString(this.props.state.apiOpts)}`,
      objectToString(
        {
          dialog: 1,
          toolbar: 0,
        },
        '=,',
      ),
    )
    this.props.effects.setFlag('authPending', true)
  }

  render() {
    return this.props.state.saved.length > 0 ? (
      <SavedList />
    ) : (
      <Splash
        authorize={this.authorize}
        signIn={this.props.state.signIn}
        savedPending={this.props.state.savedPending}
        authPending={this.props.state.authPending}
      />
    )
  }
}

export default injectState(Home)
