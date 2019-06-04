import React, { useState, useMemo } from 'react'
import ReactDOM from 'react-dom'
import superagent from 'superagent'
import { pipe, countBy, prop, sort, descend, map } from 'ramda';
import Login from './redditauth'
import Main from './Main'
import 'normalize.css'
import './style.css'
import ctx from './ctx'

const Index = ({ initState }) => {
  const [token, token$] = useState(initState.token || null)
  const [expires, expires$] = useState(initState.expires || null)
  const [saved, saved$] = useState(initState.saved || null)
  const [user, user$] = useState(initState.user || null)
  const [loading, loading$] = useState(null)
  const [error, error$] = useState(null)
  const [searchInput, searchChange] = useState('')
  const [subredditsSelected, subs$] = useState(new Set())

  const updateToken = useMemo(() => ({ token: t, expires: e }) => {
    if (! (t && e)) return
    token$(t)
    expires$(e)
    localStorage.setItem('access_token', t)
    localStorage.setItem('expires', e)
    superagent('post', '/api/setToken')
      .send({ token: t })
      .then(x => x.body)
      .then(u => {
        user$(u)
        localStorage.setItem('user', JSON.stringify(u))
      })
  }, [])

  const updateSaved = s => {
    if (s === null || s.length < 1) {
      localStorage.removeItem('saved')
    } else {
      localStorage.setItem('saved', JSON.stringify(s))
    }
    saved$(s)
  }

  const clearToken = useMemo(() => async () => {
    await superagent('post', '/api/clearToken')
    token$(null)
    token$(null)
    user$(null)
    saved$(null)
    localStorage.removeItem('user')
    localStorage.removeItem('saved')
    localStorage.removeItem('access_token')
    localStorage.removeItem('expires')
  }, [])

  const Reddit = async (url, query = {}) => {
    if (! token) { error$('no token available') }
    loading$(true)
    return superagent(`/api/reddit${url}`)
      .query(query)
      .then(({ body }) => {
        loading$(false)
        return body
      })
  }

  const login = () => Login()
    .then(updateToken)

  const getAllSaved = async () => {
    let list = []
    let x = null

    const getSaved = ({ ...params }) => Reddit(`/user/${user.name}/saved`, { limit: 100, ...params })

    while (x === null || x.data.after) {
      // eslint-disable-next-line no-await-in-loop
      x = await getSaved(x ? { after: x.data.after } : {})
      list = list.concat(x.data.children.map(e => e.data))
      updateSaved(list)
    }
  }

  const subreddits = useMemo(() => {
    if (saved && saved.length > 0) {
      return pipe(
        countBy(prop('subreddit')),
        Object.entries,
        sort(descend(prop(1))),
        map(([name, count]) => ({ name, count })),
      )(saved)
    }
    return []
  }, [saved])

  const loggedIn = Boolean(token && user)

  const subredditsChanged = useMemo(() => ev =>
    subs$(Array.from(ev.currentTarget.selectedOptions, e => e.value)), [])

  return (
    <ctx.Provider
      value={{
        subreddits,
        loggedIn,
        token,
        getAllSaved,
        login,
        clearToken,
        saved,
        loading,
        user,
        searchChange,
        searchInput,
        subredditsSelected,
        subredditsChanged,
      }}
    >
      <Main />
    </ctx.Provider>
  )
}

const initState = {
  token: localStorage.getItem('access_token'),
  expires: localStorage.getItem('expires'),
  user: localStorage.getItem('user'),
  saved: localStorage.getItem('saved'),
}

try {
  initState.saved = JSON.parse(initState.saved)
} catch (e) {
  initState.saved = null
}

try {
  initState.user = JSON.parse(initState.user)
} catch (e) {
  initState.user = null
}

document.addEventListener('DOMContentLoaded', () => {
  const root = document.getElementById('root')
  ReactDOM.render(<Index initState={initState} />, root)
})
