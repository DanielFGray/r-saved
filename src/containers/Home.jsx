// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import Provider from '../actions'
import Spinner from '../components/Spinner'
import SavedList from '../components/SavedList'
import style from '../style.sss'

const SignIn = (props: { authorize: Function }) => (
  <div style={{ textAlign: 'center' }}>
    <button onClick={props.authorize}>
      Sign In
    </button>
  </div>
)

class Home extends Component {
  props: {
    effects: {
      getSaved: Function,
      authorize: Function,
      setFlag: Function,
    },
    state: {
      saved: Array<Object>,
      authPending: boolean,
      signIn: boolean,
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

  render() {
    return (
      this.props.state.saved.length > 0
        ? <SavedList />
        : <div className={style.card} style={{ margin: '10px' }}>
          {this.props.state.signIn ||
            <SignIn authorize={this.props.effects.authorize} />}
          <div>
            {this.props.state.authPending &&
              <div style={{ textAlign: 'center' }}>Waiting for response from reddit<Spinner /></div>}
          </div>
        </div>
    )
  }
}

export default Provider(injectState(Home))
