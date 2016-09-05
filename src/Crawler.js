/* Loads a URL then starts looking for links.
  Emits a full page whenever a new link is found. */
import url from 'url'
import snapshot from './snapshot'

export default class Crawler {
  constructor(baseUrl) {
    const { protocol, host, path } = url.parse(baseUrl)
    this.protocol = protocol
    this.host = host
    this.paths = [path]
    this.processed = {}
  }

  crawl(handler) {
    this.handler = handler
    return this.snap()
  }

  snap() {
    console.log(this.paths)
    let path = this.paths.shift()
    if (!path) return Promise.resolve()
    if (this.processed[path]) {
      return this.snap()
    } else {
      this.processed[path] = true
    }
    return snapshot(this.protocol, this.host, path).then(html => {
      this.handler({path, html})
      this.extractNewLinks(html)
      return this.snap()
    }, err => {
      console.log(err)
    })
  }

  extractNewLinks(html) {
    /* Obviously be better than this */
    html.replace(/<a[^>]+href=['"]([^'"]+)['"]/g, (link, href) => {
      if (!this.processed[href]) this.paths.push(href)
    })
  }
}
