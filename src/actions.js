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
    apiOpts: {
      userAgent: 'web:searchsavedredditcontent:0.0.1 (by /u/danielfgray)',
      client_id: config.client_id || '',
      response_type: 'token',
      state: Date.now(),
      duration: 'temporary',
      redirect_uri: config.redirect_uri,
      scope: 'identity history',
    },
  }),
  effects: {
    setFlag: (effects, key, value) => state => ({ ...state, [key]: value }),
    addSaved: (effects, e) => state => ({ ...state, saved: state.saved.concat(e) }),
    getSaved: wrapWithPending('savedPending', (effects, code) =>
      Reddit(code, 'api/v1/me')
        .flatMap(x => getAllSaved(code, x.name))
        .flatMap(x => x)
        .reduce((p, c) => p.concat(c.data), [])
        .toPromise()
        .then(saved => state => ({ ...state, saved }))),
  },
  computed: {
    domains: ({ saved }) =>
      pipe(
        pluck('subreddit'),
        countBy(identity),
        toPairs,
        map(zipObj(['name', 'count'])),
        sortBy('count'),
        reverse,
      )(saved),
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
