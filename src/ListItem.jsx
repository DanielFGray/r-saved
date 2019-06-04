import React from 'react'
/* eslint-disable react/no-danger */

const Item = ({ data }) => (
  <div className="listItem"> 
    {data.link_title && (
      <div className="title">
        <a href={data.link_url}>{data.link_title}</a>
      </div>
    )}
    {data.title && (
      <div className="title">
        <a href={data.url}>{data.title}</a>
      </div>
    )}
    {data.body_html && (
      <div
        className="body"
        style={{ overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: data.body_html }}
      />
    )}
    {data.selftext_html && (
      <div
        className="body"
        style={{ overflow: 'auto' }}
        dangerouslySetInnerHTML={{ __html: data.selftext_html }}
      />
    )}
    <div className="sub">
      <a href={`https://reddit.com/r/${data.subreddit}`}>{`/r/${data.subreddit}`}</a>
    </div>
    <div className="comments">
      <a href={data.link_permalink || `https://reddit.com${data.permalink}`}>
        {`${data.score} points - ${data.num_comments} comments`}
      </a>
    </div>
  </div>
)

export default Item
