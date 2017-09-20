// @flow
import * as React from 'react'
import { injectState } from 'freactal'
import download from 'downloadjs'

import Controls from '../components/Controls'
import ListItem from '../components/ListItem'

import type { Subreddit, Saved } from '../types'

class SavedList extends React.Component {
  props: {
    state: {
      saved: Saved[],
      subreddits: Subreddit[],
    },
  }

  state: {
    filteredSub: string,
    filteredText: string,
  }

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
          changeSub={this.changeSub}
          listLength={list.length}
          subreddits={this.props.state.subreddits}
          filterText={this.state.filterText}
          changeText={this.changeText}
          download={this.download}
        />
        <ol>{list.map(ListItem)}</ol>
      </div>
    )
  }
}

export default injectState(SavedList)
