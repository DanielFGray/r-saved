// @flow
import React, { Component } from 'react'
import { injectState } from 'freactal'
import { includes } from 'lodash/fp'
import download from 'downloadjs'
import style from '../style.sss'

const Item = (props: {
  author: string,
  body_html: string,
  matches: boolean,
  id: string,
  link_permalink: string,
  link_title: string,
  link_url: string,
  num_comments: number,
  permalink: string,
  selftext_html: string,
  subreddit: string,
  title: string,
  url: string,
}) => (
  <li
    className={style.listItem}
    key={props.id}
    style={{
      height: props.matches || 0,
      margin: props.matches || 0,
      padding: props.matches || 0,
      border: props.matches || 0,
      overflow: props.matches || 'hidden',
    }}
  >
    {props.link_title && <div><a href={props.link_url}>{props.link_title}</a></div>}
    {props.title && <div><a href={props.url}>{props.title}</a></div>}
    {props.body_html && <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.body_html }} />}
    {props.selftext_html && <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.selftext_html }} />}
    <div className={style.meta}>
      <span className={style.sub}>
        <a href={`https://reddit.com/r/${props.subreddit}`}>/r/{props.subreddit}</a>
      </span>
      <span className={style.comments}>
        <a href={props.link_permalink || `https://reddit.com${props.permalink}`}>{props.num_comments} comments</a>
      </span>
      <span className={style.author}>
        <a href={`https://reddit.com/u/${props.author}`}>/u/{props.author}</a>
      </span>
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

  download = () =>
    download(JSON.stringify(this.props.state.saved), 'reddit-saved-data.json', 'text/plain')

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
        const matches = (e.matches &&
          includes(this.state.filterText.toLowerCase(), s.toLowerCase()))
        return { ...e, matches }
      })
    }

    return (
      <div>
        <div className={style.headerControls}>
          <span className={style.subFilter}>
            <select onChange={this.changeSub}>
              <optgroup label="filter by subreddit">
                {[{ name: 'all', count: list.length }].concat(this.props.state.subreddits).map(e =>
                  <option key={e.name} value={e.name}>{e.name} - {e.count}</option>)}
              </optgroup>
            </select>
          </span>
          <span className={style.filterText}>
            <input
              type="text"
              placeholder="search titles"
              value={this.state.filterText}
              onChange={this.changeText}
            />
          </span>
          <span className={style.buttons}>
            <button onClick={this.download}>Download JSON</button>
          </span>
        </div>
        <ol>{list.map(Item)}</ol>
      </div>
    )
  }
}

export default injectState(SavedList)
