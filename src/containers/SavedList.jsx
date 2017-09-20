// @flow
/* eslint 'no-unused-vars': 'warn' */
import * as React from 'react'
import { injectState } from 'freactal'
import download from 'downloadjs'
import {
  curry,
  equals as eq,
  identity as id,
  ifElse,
  map,
  path,
  pipe as $,
  prop,
  propOr,
  reverse,
  sortBy,
} from 'ramda'

import Controls from '../components/Controls'
import ListItem from '../components/ListItem'

import type { Subreddit, Saved } from '../types'

const tap = curry((f, o) => {
  // eslint-disable-line no-extend-native
  f(o)
  return o
})

const filterSortList = (state, l) =>
  $(
    map(e => {
      let matches = true
      if (state.filteredSub !== 'all') {
        matches = e.subreddit === state.filteredSub
      }
      if (state.filterText !== '') {
        matches =
          matches &&
          propOr('', 'title', e)
            .toLowerCase()
            .includes(state.filterText.toLowerCase())
      }
      return { ...e, matches }
    }),
    tap(console.log),
    ifElse(
      () => eq('date', state.sortBy),
      id,
      propOr(id, state.sortBy.toLowerCase(), {
        upvotes: $(sortBy(prop('ups')), reverse),
        score: $(sortBy(prop('score')), reverse),
        comments: $(sortBy(prop('num_comments')), reverse),
      }),
    ),
  )(l)

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
    sortBy: string,
  }

  state = {
    filteredSub: 'all',
    filterText: '',
    sortBy: 'date',
  }

  changeSub = (e: SyntheticInputEvent) => {
    this.setState({ filteredSub: e.currentTarget.value })
  }

  changeText = (e: SyntheticInputEvent) => {
    this.setState({ filterText: e.currentTarget.value })
  }

  changeSort = (e: SyntheticInputEvent) => {
    this.setState({ sortBy: e.currentTarget.value })
  }

  download = () => {
    download(JSON.stringify(this.props.state.saved), 'reddit-saved-data.json', 'text/plain')
  }

  render() {
    const list = filterSortList(this.state, this.props.state.saved)
    return (
      <div>
        <Controls
          changeSub={this.changeSub}
          changeText={this.changeText}
          changeSort={this.changeSort}
          download={this.download}
          filterText={this.state.filterText}
          listLength={list.length}
          subreddits={this.props.state.subreddits}
        />
        <ol>{list.map(ListItem)}</ol>
      </div>
    )
  }
}

export default injectState(SavedList)
