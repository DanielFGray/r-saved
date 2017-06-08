// @flow
import React, { Component } from 'react'
import {
  countBy,
  identity,
  includes,
  map,
  pipe,
  pluck,
  reverse,
  sortBy,
  toPairs,
  zipObj,
} from 'lodash/fp'
import style from '../style.sss'

/* eslint-disable react/prop-types */
const Saved = props => (
  <li className={style.card}>
    {props.title
      ? <div><a href={props.url}>{props.title}</a></div>
      : <div dangerouslySetInnerHTML={{ __html: props.body_html }} />}
    <div><a href={`https://reddit.com/${props.subreddit_name_prefixed}`}>/r/{props.subreddit}</a> <a href={props.link_permalink || `https://reddit.com${props.permalink}`}>{props.num_comments} comments</a></div>
  </li>
)

class SavedList extends Component { // eslint-disable-line react/prefer-stateless-function
  props: {
    list: Array<any>,
  }

  state = {
    filteredSub: 'none',
    filterText: '',
  }

  changeSub = (e: SyntheticInputEvent) =>
    this.setState({ filteredSub: e.target.value })

  changeText = (e: SyntheticInputEvent) =>
    this.setState({ filterText: e.target.value })

  render() {
    const subreddits = pipe(
      pluck('subreddit'),
      countBy(identity),
      toPairs,
      map(zipObj(['name', 'count'])),
      sortBy('count'),
      reverse,
    )

    let list = this.props.list

    if (this.state.filteredSub !== 'none') {
      list = list.filter(e => e.subreddit === this.state.filteredSub)
    }

    if (this.state.filterText !== '') {
      list = list.filter(e => includes(this.state.filterText, e.title))
    }

    return (
      <div>
        <div style={{ margin: '10px', textAlign: 'center' }}>
          <input
            type="text"
            placeholder="search titles"
            value={this.state.filterText}
            onChange={this.changeText}
          />
          <select onChange={this.changeSub}>
            <optgroup label="filter by subreddit">
              <option value="none">-none-</option>
              {subreddits(this.props.list).map(e =>
                <option value={e.name}>{e.name} - {e.count}</option>)}
            </optgroup>
          </select>
        </div>
        <ol>{list.map(Saved)}</ol>
      </div>
    )
  }
}

export default SavedList
