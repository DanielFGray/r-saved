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
import { injectState } from 'freactal'
import style from '../style.sss'

const Item = (props: {
  title: string,
  id: string,
  url: string,
  body_html: string,
  subreddit_name_prefixed: string,
  link_permalink: string,
  permalink: string,
  num_comments: number,
}) => (
  <li className={style.card} key={props.id}>
    {props.title
      ? <div><a href={props.url}>{props.title}</a></div>
      : <div dangerouslySetInnerHTML={{ __html: props.body_html }} />}
    <div>
      <a href={`https://reddit.com/${props.subreddit_name_prefixed}`}>/{props.subreddit_name_prefixed}</a>
      <a href={props.link_permalink || `https://reddit.com${props.permalink}`}>{props.num_comments} comments</a>
    </div>
  </li>
)

class SavedList extends Component {
  props: {
    // list: Array<any>,
    state: {
      saved: Array<Object>,
    },
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

    let list = this.props.state.saved

    if (this.state.filteredSub !== 'none') {
      list = list.filter(e => e.subreddit === this.state.filteredSub)
    }

    if (this.state.filterText !== '') {
      list = list.filter(e => {
        const s = e.title || e.body
        return includes(this.state.filterText, s.toLowerCase)
      })
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
              {subreddits(this.props.state.saved).map(e =>
                <option key={e.name} value={e.name}>{e.name} - {e.count}</option>)}
            </optgroup>
          </select>
        </div>
        <ol>{list.map(Item)}</ol>
      </div>
    )
  }
}

export default injectState(SavedList)
