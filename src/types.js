// @flow
export type Saved = {
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
}

export type Subreddit = {
  name: string,
  count: number,
}
