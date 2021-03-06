import moment from 'moment'
import {List, Record} from 'immutable'

import {
  MESSAGE_TAG_REX,
  VISIBLITY_DIRECT, VISIBLITY_PRIVATE, VISIBLITY_UNLISTED, VISIBLITY_PUBLIC,
} from 'src/constants'
import {isObjectSame, parseMastodonHtml} from 'src/utils'


const StatusRecord = Record({  // eslint-disable-line new-cap
  id_by_host: {},
  uri: '',
  url: '',
  content: '',
  created_at: '',
  account: '',
  reblogs_count: '',
  favourites_count: '',
  sensitive: '',
  spoiler_text: '',
  visibility: '',
  media_attachments: [],
  mentions: [],
  tags: [],
  application: '',
  reblog: null,
  in_reply_to_id_by_host: {},
  in_reply_to_account_id_by_host: {},
  reblogged_by_acct: {},
  favourited_by_acct: {},
})

/*
mention
url URL of user's profile (can be remote) no
username  The username of the account no
acct  Equals username for local users, includes @domain for remote ones no
id  Account ID  no
*/

/**
 * MastodonのStatus
 */
export default class Status extends StatusRecord {
  /**
   * @constructor
   * @param {object} raw
   */
  constructor(raw) {
    if(raw.media_attachments && raw.media_attachments.length) {
      const Attachment = require('./Attachment').default
      raw.media_attachments = raw.media_attachments.map((rawmedia) => new Attachment(rawmedia))
    }

    super(raw)
  }

  // とりあえず
  get hosts() {
    return Object.keys(this.id_by_host)
  }

  get id() {
    console.error('deprecated attribute')
    require('assert')(0)
  }

  getIdByHost(host) {
    return this.id_by_host[host]
  }

  getInReplyToIdByHost(host) {
    return this.in_reply_to_id_by_host[host]
  }

  get parsedContent() {
    if(!this._parsedContent) {
      const mentions = this.mentions
      this._parsedContent = new List(parseMastodonHtml(this.content, mentions))
    }
    return this._parsedContent
  }

  get createdAt() {
    return moment(this.created_at)
  }

  get hasSpoilerText() {
    return this.spoiler_text.length > 0
  }

  get spoilerText() {
    return this.spoiler_text
  }

  canReblog() {
    return (this.visibility === VISIBLITY_PUBLIC || this.visibility === VISIBLITY_UNLISTED)
      ? true
      : false
  }

  isRebloggedAt(acct) {
    return this.reblogged_by_acct[acct]
  }

  isFavouritedAt(acct) {
    return this.favourited_by_acct[acct]
  }

  /**
   * そいつあてのMentionが含まれているか？
   * @param {URI} uri そいつ
   * @return {bool}
   */
  isMentionToURI(uri) {
    if(this.mentions.find((m) => m.url === uri))
      return true
    return false
  }

  checkMerge(newObj) {
    let isChanged = false

    const merged = super.mergeDeepWith((prev, next, key) => {
      let result = next
      if(typeof prev === 'object') {
        if((!prev && next) || (prev && !next)) {
          isChanged = true
        } else if(Array.isArray(next)) {
          // media_attachmentの中身はサーバによって必ず違うので、長さだけチェック
          if(prev.length != next.length)
            isChanged = true
        } else if(!isObjectSame(prev, next)) {
          isChanged = true
          result = {...(prev || {}), ...(next || {})}
        }
      } else if(prev !== next) {
        isChanged = true
      }

      return result
    }, newObj)

    return {isChanged, merged}
  }

  static compareCreatedAt(a, b) {
    const aAt = a.createdAt
    const bAt = b.createdAt
    if(aAt.isBefore(bAt))
      return 1
    else if(aAt.isAfter(bAt))
      return -1
    return 0
  }

  // naumanni用機能
  get messageBlockInfo() {
    const match = this.content.match(MESSAGE_TAG_REX)
    if(!match)
      return null

    return {
      checksum: match[1],
      index: +match[2],
      total: +match[3],
    }
  }
}
