import uuid from 'uuid/v1'
import * as config from './config'

const objectToString = (obj, join = '=&') => Object
  .entries(obj)
  .map(p => p.map(e => encodeURIComponent(e)).join(join[0]))
  .join(join[1])

export default function RedditAuth() {
  const apiOpts = {
    client_id: config.client_id,
    response_type: 'token',
    state: uuid(),
    duration: 'temporary',
    redirect_uri: config.redirect_uri,
    scope: 'identity history',
  }

  return new Promise((resolve, reject) => {
    const receiveMessage = ev => {
      if (!ev.data || typeof ev.data !== 'string' || ev.data.includes('&') === false) return
      const data = ev.data
        .split('&')
        .map(v => v.split('=').map(p => decodeURIComponent(p)))
        .reduce((a, [k, v]) => ({ ...a, [k]: v }), {})
      if (data.state !== apiOpts.state) {
        reject(new Error('invalid state returned'))
      }
      const { expires_in: expires, access_token: token } = data
      if (! token) {
        reject(new Error('no token returned'))
      }
      window.removeEventListener('message', receiveMessage, false)
      resolve({ token, expires })
    }

    // TODO test for different browsers?
    const opts = objectToString({
      menubar: 0,
      modal: 1,
      location: 0,
      dialog: 1,
      toolbar: 0,
    }, '=,')
    window.addEventListener('message', receiveMessage)
    window.open(`https://www.reddit.com/api/v1/authorize?${objectToString(apiOpts)}`, opts)
  })
}

// const getAllSaved = (code, user, query) =>
//   Observable.defer(() =>
//     getSaved(code, user, query).flatMap(x => {
//       const items$ = Observable.of(x.data.children)
//       const next$ =
//         x.data.after !== null
//           ? getAllSaved(code, user, { after: x.data.after })
//           : Observable.empty()
//       return Observable.concat(items$, next$)
//     }))
