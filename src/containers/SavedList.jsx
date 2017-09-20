// @flow
import * as React from 'react'
import { injectState } from 'freactal'
import download from 'downloadjs'

import ListItem from '../components/ListItem'

import style from '../style.sss'

import type { Subreddit, Saved } from '../types'

type ListProps = {
  state: {
    saved: Saved[],
    subreddits: Subreddit[],
  },
}

type ListState = {
  filteredSub: string,
  filteredText: string,
}

type ControlProps = {
  changeSub: Function,
  listLength: Number,
  subreddits: Subreddit[],
  filterText: string,
  changeText: Function,
  download: Function,
}

const Controls = (props: ControlProps) => (
  <div className={style.headerControls}>
    <span className={style.subFilter}>
      <select onChange={props.changeSub}>
        <optgroup label="filter by subreddit">
          {[{ name: 'all', count: props.listLength }]
            .concat(props.subreddits)
            .map(e => (
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
    <span className={style.buttons}>
      <button onClick={props.download}>Download JSON</button>
    </span>
  </div>
)

class SavedList extends React.Component<ListProps, ListState> {
  state = {
    filteredSub: 'all',
    filterText: '',
  }

  changeSub = (e: SyntheticInputEvent) => {
    this.setState({ filteredSub: e.target.value })
  }

  changeText = (e: SyntheticInputEvent) => {
    this.setState({ filterText: e.target.value })
  }

  download = () => {
    download(JSON.stringify(this.props.state.saved), 'reddit-saved-data.json', 'text/plain')
  }

  render() {
    let list = this.props.state.saved.map(e => ({ ...e, matches: true }))

    if (this.state.filteredSub !== 'all') {
      list = list.map(e => {
        const matches = e.subreddit === this.state.filteredSub
        return { ...e, matches }
      })
    }

    if (this.state.filterText !== '') {
      list = list.map(e => {
        const s = e.selftext || e.body || e.title
        const matches = e.matches && s.toLowerCase().includes(this.state.filterText.toLowerCase())
        return { ...e, matches }
      })
    }

    return (
      <div>
        <Controls
          changeSub={this.thangeSub}
          listLength={list.length}
          subreddits={this.state.subreddits}
          filterText={this.filterText}
          changeText={this.changeText}
          download={this.download}
        />
        <ol>{list.map(ListItem)}</ol>
      </div>
    )
  }
}

export default injectState(SavedList)
