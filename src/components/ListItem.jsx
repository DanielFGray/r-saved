// @flow
import * as React from 'react'

import style from '../style.sss'

import type { Saved } from '../types'

const Item = (props: Saved) => (
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
    {props.link_title && (
      <div>
        <a href={props.link_url}>{props.link_title}</a>
      </div>
    )}
    {props.title && (
      <div>
        <a href={props.url}>{props.title}</a>
      </div>
    )}
    {props.body_html && (
      <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.body_html }} />
    )}
    {props.selftext_html && (
      <div style={{ overflow: 'auto' }} dangerouslySetInnerHTML={{ __html: props.selftext_html }} />
    )}
    <div className={style.meta}>
      <span className={style.sub}>
        <a href={`https://reddit.com/r/${props.subreddit}`}>/r/{props.subreddit}</a>
      </span>
      <span className={style.comments}>
        <a href={props.link_permalink || `https://reddit.com${props.permalink}`}>
          {props.num_comments} comments
        </a>
      </span>
      <span className={style.author}>
        <a href={`https://reddit.com/u/${props.author}`}>/u/{props.author}</a>
      </span>
    </div>
  </li>
)

export default Item
