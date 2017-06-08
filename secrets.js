module.exports = {
  client_id: process.env.NODE_ENV === 'production'
    ? '3WWi8AkprGjniA'
    : '7SMYYgduFcOeIg',
  redirect_uri: process.env.NODE_ENV === 'production'
    ? 'https://danielfgray.gitlab.io/r-saved/callback.html'
    : 'http://localhost:8080/callback.html',
}
