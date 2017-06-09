// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { includes } from 'lodash/fp'
import style from '../style.sss'

const Item = (props: {
  title: string,
  id: string,
  url: string,
  body_html: string,
  selftext_html: string,
  subreddit: string,
  link_permalink: string,
  permalink: string,
  num_comments: number,
  filtered: boolean,
}) => (
  <li
    className={style.listItem}
    key={props.id}
    style={{
      height: props.filtered && 0,
      margin: props.filtered && 0,
      padding: props.filtered && 0,
      overflow: props.filtered && 'hidden',
    }}
  >
    {props.title && <div><a href={props.url}>{props.title}</a></div>}
    {props.body_html && <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.body_html }} />}
    {props.selftext_html && <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.selftext_html }} />}
    <div>
      <a href={`https://reddit.com/r/${props.subreddit}`}>/r/{props.subreddit}</a>
      <a href={props.link_permalink || `https://reddit.com${props.permalink}`}>{props.num_comments} comments</a>
    </div>
  </li>
)

class SavedList extends Component {
  props: {
    state: {
      saved: Array<Object>,
      subreddits: Array<Object>,
    },
  }

  state = {
    filteredSub: 'all',
    filterText: '',
  }

  changeSub = (e: SyntheticInputEvent) =>
    this.setState({ filteredSub: e.target.value })

  changeText = (e: SyntheticInputEvent) =>
    this.setState({ filterText: e.target.value })

  render() {
    let list = this.props.state.saved

    if (this.state.filteredSub !== 'all') {
      list = list.map(e => ({ ...e, filtered: ! e.subreddit === this.state.filteredSub }))
    }

    if (this.state.filterText !== '') {
      list = list.map(e => {
        const s = e.title || e.body
        const filtered = ! includes(this.state.filterText.toLowerCase(), s.toLowerCase())
        return { ...e, filtered }
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
              <option value="all">all - {list.length}</option>
              {this.props.state.subreddits.map(e =>
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
