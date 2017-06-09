// @flow
import { provideState } from 'freactal'
import { Observable } from 'rxjs'
import request from 'superagent'
import {
  countBy,
  identity,
  map,
  pipe,
  pluck,
  reverse,
  sortBy,
  toPairs,
  zipObj,
} from 'lodash/fp'
import config from '../secrets'

const objectToString = (obj, join = '=&') =>
  Object.entries(obj)
    .map(p => p.map(e => encodeURIComponent(e)).join(join[0]))
    .join(join[1])

const apiOpts = {
  userAgent: 'web:searchsavedredditcontent:0.0.1 (by /u/danielfgray)',
  client_id: config.client_id || '',
  response_type: 'token',
  state: Date.now(),
  duration: 'temporary',
  redirect_uri: config.redirect_uri,
  scope: 'identity history save vote',
}

const wrapWithPending = (pendingKey, cb) => (effects, ...a) =>
  effects.setFlag(pendingKey, true)
    .then(() => cb(effects, ...a))
    .then(value => effects.setFlag(pendingKey, false).then(() => value))

const Reddit = (code, url, query = {}) =>
  Observable.from(
    request.get(`https://oauth.reddit.com/${url}`)
      .set({ Authorization: `bearer ${code}` })
      .query({ ...query, raw_json: 1 }))
    .map(x => x.body)

const getSaved = (code, user, query) =>
  Reddit(code, `user/${user}/saved`, { ...query, limit: 100 })

const getAllSaved = (code, user, query) =>
  Observable.defer(() => getSaved(code, user, query)
    .flatMap(x => {
      const items$ = Observable.of(x.data.children)
      const next$ =
        x.data.after !== null
        ? getAllSaved(code, user, { after: x.data.after })
        : Observable.empty()
      return Observable.concat(items$, next$)
    }))

const Provider = provideState({
  initialState: () => ({
    signedIn: false,
    saved: [],
    savedPending: false,
    authPending: false,
    signIn: false,
    subFilter: '',
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    addSaved: (effects, e) => state => ({ ...state, saved: state.saved.concat(e) }),
    authorize: effects =>
      effects.setFlag('authPending', true)
        .then(window.open(`https://www.reddit.com/api/v1/authorize/?${objectToString(apiOpts)}`,
          objectToString({
            dialog: 1,
            toolbar: 0,
          }, '=,')))
        .then(() => state => state),
    getSaved: wrapWithPending('savedPending', (effects, code) =>
      Reddit(code, 'api/v1/me')
        .flatMap(x => getAllSaved(code, x.name))
        .flatMap(x => x)
        .reduce((p, c) => p.concat(c.data), [])
        .toPromise()
        .then(saved => state => ({ ...state, saved }))),
  },
  computed: {
    subreddits: ({ saved }) =>
      pipe(
        pluck('subreddit'),
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'count'])),
        sortBy('count'),
        reverse,
      )(saved),
  },
})

export default Provider
