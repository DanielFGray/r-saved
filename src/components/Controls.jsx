// @flow
import * as React from 'react'

import style from '../style.sss'

import type { Subreddit } from '../types'

const Controls = (props: {
  changeSub: Function,
  changeText: Function,
  changeSort: Function,
  download: Function,
  filterText: string,
  listLength: number,
  subreddits: Subreddit[],
}) => (
  <div className={style.headerControls}>
    <span className={style.subFilter}>
      <select onChange={props.changeSub}>
        <optgroup label="filter by subreddit">
          {[{ name: 'all', count: props.listLength }].concat(props.subreddits).map(e => (
            <option key={e.name} value={e.name}>
              {e.name} - {e.count}
            </option>
          ))}
        </optgroup>
      </select>
    </span>
    <span className={style.filterText}>
      <input
        type="text"
        placeholder="search titles"
        value={props.filterText}
        onChange={props.changeText}
      />
    </span>
    <span className={style.subFilter}>
      <select onChange={props.changeSort}>
        <optgroup label="sort by">
          {['date', 'upvotes', 'score', 'comments'].map(e => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </optgroup>
      </select>
    </span>
    <span className={style.buttons}>
      <button onClick={props.download}>Download JSON</button>
    </span>
  </div>
)

export default Controls
