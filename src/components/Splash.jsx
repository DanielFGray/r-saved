// @flow
import * as React from 'react'

import Spinner from './Spinner'

import style from '../style.sss'

type P = {
  authorize: Function,
  signIn: boolean,
  savedPending: boolean,
  authPending: boolean,
}

const SignIn = (props: { authorize: Function }) => (
  <div style={{ textAlign: 'center' }}>
    <div>Sign in to Reddit to see your saved content with real-time search and filtering</div>
    <button onClick={props.authorize}>Sign In</button>
  </div>
)

const Splash = (props: P) => (
  <div className={style.card} style={{ margin: '10px' }}>
    {props.signIn || <SignIn authorize={props.authorize} />}
    <div>
      {props.savedPending && (
        <Spinner label="Fetching content..." />
      )}
    </div>
    <div>
      {props.authPending && (
        <Spinner label="Waiting for response from reddit" />
      )}
    </div>
  </div>
)

export default Splash
