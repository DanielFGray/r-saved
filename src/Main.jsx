import React, { useContext } from 'react'
import ctx from './ctx'
import Item from './ListItem'

const includes = (a, b) => a.includes(b)
const on = (f, g) => (a, b) => f(g(a), g(b))
const kontains = on(includes, x => x.toLowerCase())

export default function Main() {
  const {
    loggedIn,
    login,
    clearToken,
    saved,
    token,
    subreddits,
    loading,
    user,
    getAllSaved,
    searchInput,
    searchChange,
    subredditsSelected,
    subredditsChanged,
  } = useContext(ctx)
  const hasSaved = saved != null && saved.length > 0
  const filtered = ! hasSaved
    ? []
    : saved.filter(e => {
      const title = e.link_title || e.title
      if (searchInput && (! kontains(title, searchInput) || (e.body && ! kontains(e.body, searchInput)))) {
        return false
      }
      if (subredditsSelected.length && ! subredditsSelected.includes(e.subreddit)) {
        return false
      }
      return true
    })
  return (
    <>
      <div className="controls">
        {hasSaved && (
          <>
            <input
              type="text"
              placeholder="search"
              onChange={e => searchChange(e.currentTarget.value)}
              value={searchInput}
              className="search_input"
            />
            <select multiple onChange={subredditsChanged} className="subreddit_picker">
              {subreddits.map(({ name, count }) => (
                <option key={name} value={name}>
                  {`${name} - ${(count)}`}
                </option>
              ))}
            </select>
          </>
        )}
        <div className="buttons">
          {loggedIn ? (
            <>
              <button
                onClick={getAllSaved}
                type="button"
                value={searchInput}
                onChange={e => searchChange(e.currentTarget.value)}
              >
                Get Saved
              </button>
              <button onClick={clearToken} type="button">Log out</button>
            </>
          ) : (
            <button onClick={login} type="button">Log in!</button>
          )}
        </div>
        <div className="info">
          <div className="user">{loggedIn && `user: ${user && user.name}`}</div>
          <div className="matches">
            {(hasSaved && filtered.length !== saved.length)
              && `${filtered.length} matched out of ${saved.length}`}
          </div>
        </div>
      </div>
      {loading && 'Loading...'}
      {! loggedIn && 'Log in to see your saved content from Reddit'}
      {hasSaved && (
        <div className="list_container">
          {filtered.map(e => <Item key={e.id} data={e} />)}
        </div>
      )}
    </>
  )
}
