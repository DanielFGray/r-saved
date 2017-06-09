// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import Spinner from '../components/Spinner'
import SavedList from '../components/SavedList'
import style from '../style.sss'

const SignIn = (props: { authorize: Function }) => (
  <div style={{ textAlign: 'center' }}>
    <div>
      Sign in to Reddit to see your saved content with real-time search and filtering
    </div>
    <button onClick={props.authorize}>
      Sign In
    </button>
  </div>
)

const objectToString = (obj, join = '=&') =>
  Object.entries(obj)
    .map(p => p.map(e => encodeURIComponent(e)).join(join[0]))
    .join(join[1])

class Home extends Component {
  props: {
    effects: {
      getSaved: Function,
      setFlag: Function,
    },
    state: {
      saved: Array<Object>,
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
    window.open(`https://www.reddit.com/api/v1/authorize/?${objectToString(this.props.state.apiOpts)}`,
      objectToString({
        dialog: 1,
        toolbar: 0,
      }, '=,'))
    this.props.effects.setFlag('authPending', true)
  }

  render() {
    return (
      this.props.state.saved.length > 0
        ? <SavedList />
        : <div className={style.card} style={{ margin: '10px' }}>
          {this.props.state.signIn ||
            <SignIn authorize={this.authorize} />}
          <div>
            {this.props.state.savedPending &&
              <div style={{ textAlign: 'center' }}>Fetching content...<Spinner /></div>}
          </div>
          <div>
            {this.props.state.authPending &&
              <div style={{ textAlign: 'center' }}>Waiting for response from reddit<Spinner /></div>}
          </div>
        </div>
    )
  }
}

export default injectState(Home)
