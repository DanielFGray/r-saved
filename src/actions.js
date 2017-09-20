// @flow
import { provideState } from 'freactal'
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/defer'
import 'rxjs/add/observable/empty'
import 'rxjs/add/observable/from'
import 'rxjs/add/observable/of'
import 'rxjs/add/observable/concat'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/reduce'
import 'rxjs/add/operator/toPromise'
import { get } from 'superagent'
import {
  countBy,
  identity as id,
  map,
  pipe,
  pluck,
  prop,
  reverse,
  sortBy,
  toPairs,
  zipObj,
} from 'ramda'
import config from '../secrets'

const wrapWithPending = (pendingKey, cb) => (effects, ...a) =>
  effects
    .setFlag(pendingKey, true)
    .then(() => cb(effects, ...a))
    .then(value => effects.setFlag(pendingKey, false).then(() => value))

const Reddit = (code, url, query = {}) =>
  Observable.from(
    get(`https://oauth.reddit.com/${url}`)
      .set({
        Authorization: `bearer ${code}`,
        'User-Agent': 'web:r-saved:0.0.1 (by /u/danielfgray)',
      })
      .query({ ...query, raw_json: 1 }),
  ).map(x => x.body)

const getSaved = (code, user, query) => Reddit(code, `user/${user}/saved`, { ...query, limit: 100 })

const getAllSaved = (code, user, query) =>
  Observable.defer(() =>
    getSaved(code, user, query).flatMap(x => {
      const items$ = Observable.of(x.data.children)
      const next$ =
        x.data.after !== null
          ? getAllSaved(code, user, { after: x.data.after })
          : Observable.empty()
      return Observable.concat(items$, next$)
    }),
  )

const Provider = provideState({
  initialState: () => ({
    signedIn: false,
    saved: [],
    savedPending: false,
    authPending: false,
    signIn: false,
    subFilter: '',
    apiOpts: {
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
        .flatMap(({ name }) => getAllSaved(code, name))
        .flatMap(id)
        .reduce((p, c) => p.concat(c.data), [])
        .toPromise()
        .then(saved => state => ({ ...state, saved })),
    ),
  },
  computed: {
    domains: pipe(
      prop('saved'),
      pluck('subreddit'),
      countBy(id),
      toPairs,
      map(zipObj(['name', 'count'])),
      sortBy('count'),
      reverse,
    ),
    subreddits: pipe(
      prop('saved'),
      pluck('subreddit'),
      countBy(id),
      toPairs,
      map(zipObj(['name', 'count'])),
      sortBy('count'),
      reverse,
    ),
  },
})

export default Provider
