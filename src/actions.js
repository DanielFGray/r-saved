// @flow
import { provideState } from 'freactal'
import Snoowrap from 'snoowrap'
import config from '../secrets'

const objectToString = (obj, join = '&') =>
  Object.entries(obj)
    .map(p => p.map(e => encodeURIComponent(e)).join('='))
    .join(join)

const apiOpts = {
  userAgent: 'web:searchsavedredditcontent:0.0.1 (by /u/danielfgray)',
  client_id: config.client_id || '',
  response_type: 'token',
  state: Date.now(),
  duration: 'temporary',
  redirect_uri: 'http://danielfgray.gitlab.io/r-saved/callback.html',
  scope: 'identity history save vote',
}

const wrapWithPending = (pendingKey, cb) => (effects, ...a) =>
  effects.setFlag(pendingKey, true)
    .then(() => cb(effects, ...a))
    .then(value => effects.setFlag(pendingKey, false).then(() => value))

const Provider = provideState({
  initialState: () => ({
    signedIn: false,
    saved: null,
    savedPending: false,
    authPending: false,
    subFilter: '',
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    authorize: effects =>
      effects.setFlag('authPending', true)
        .then(window.open(`https://www.reddit.com/api/v1/authorize/?${objectToString(apiOpts)}`,
          objectToString({
            dialog: 1,
            toolbar: 0,
          }, ','))),
    getSaved: wrapWithPending('savedPending', (effects, code) =>
      (new Snoowrap({
        userAgent: apiOpts.userAgent,
        accessToken: code,
      }))
        .getMe()
        .getSavedContent()
        .fetchAll()
        .then(saved => state => ({ ...state, saved })),
    ),
  },
})

export default Provider
