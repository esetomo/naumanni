import moment from 'moment'
import {Record} from 'immutable'


const OAuthTokenRecord = Record({  // eslint-disable-line new-cap
  host: '',

  access_token: null,
  refresh_tokend: null,
  created_at: null,
  scope: '',
  token_type: '',
})


/**
 * OAuthTokenを表す
 */
export default class OAuthToken extends OAuthTokenRecord {
  static storeName = 'oauth_tokens'
  static keyPath = 'address'
  static indexes = [
    ['access_token', ['host', 'access_token'], {unique: true}],
  ]

  /**
   * @constructor
   * @param {Objet} token
   */
  constructor(...args) {
    super(...args)
  }

  toJS() {
    const js = super.toJS()

    js.address = this.address
    return js
  }

  get accessToken() {
    return this.access_token
  }

  get address() {
    return `@${this.user}@${this.host}::${this.access_token}`
  }

  get expiresAt() {
    // Mastodonでは使わん
    // const {
    //   access_token,
    //   refresh_token,
    //   expires,
    //   expires_in,
    // } = token

    // require('assert')(access_token && refresh_token)
    // this.accessToken = access_token
    // this.refreshToken = refresh_token

    // require('assert')(!(expires && expires_in), 'expires and expires_in cannot set simultaneously')
    // require('assert')(expires || expires_in, 'expires or expires_in is required')

    // if(expires_in) {
    //   // 時刻設定連れを考慮して10%の誤差を...
    //   this.expires = moment().add(expires_in * 0.9, 's')
    // } else {
    //   this.expires = expires
    // }
    throw new Error('not implemented')
  }

  /**
   * TokenがexpireしていたらTrueを返す
   * @return {bool}
   */
  isExpired() {
    // refresh_tokenが無い場合はexpiresしないと考える?
    if(!this.refresh_token)
      return false

    return this.expires.isBefore(moment())
  }
}