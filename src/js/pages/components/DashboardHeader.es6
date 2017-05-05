import React from 'react'
// import PropTypes from 'prop-types'

import AddColumnUseCase from 'src/usecases/AddColumnUseCase'
import GenerateKeypairUseCase from 'src/usecases/GenerateKeypairUseCase'
import {AppPropType, ContextPropType} from 'src/propTypes'
import {DropdownMenuButton, IconFont, UserIconWithHost} from 'src/pages/parts'
import {
  COLUMN_TIMELINE, COLUMN_FRIENDS,
  TIMELINE_FEDERATION, TIMELINE_LOCAL, TIMELINE_HOME, SUBJECT_MIXED,
} from 'src/constants'


/**
 * ダッシュボードのヘッダ
 * [logo] [toot欄] [account icon] [account icon] [account icon] [account icon] .... [歯車]
 */
export default class DashboardHeader extends React.Component {
  static contextTypes = {
    app: AppPropType,
    context: ContextPropType,
  }

  /**
   * @constructor
   */
  constructor(...args) {
    super(...args)

    this.state = this.getStateFromContext()
  }

  /**
   * @override
   */
  componentDidMount() {
    // update accounts
    const {context} = this.context

    this.listenerRemovers = [
      context.onChange(() => this.setState(this.getStateFromContext())),
    ]
  }

  /**
   * @override
   */
  componentWillUnmount() {
    for(const remover of this.listenerRemovers) {
      remover()
    }
  }

  /**
   * @override
   */
  render() {
    const {accountsState} = this.state
    const {tokens} = accountsState

    return (
      <header className="naumanniDashboard-header">
        <DropdownMenuButton onRenderMenu={::this.onRenderCompoundMenu}>
          <img className="naumanniDashboard-header-logo" src="/static/images/naumanni-headerLogo.svg" />
        </DropdownMenuButton>

        <div className="naumanniDashboard-header-toot">
          <input type="text" placeholder="何してますか？忙しいですか？手伝ってもらってもいいですか？" />
        </div>

        <ul className="naumanniDashboard-header-accounts">
          {tokens.map((token) => this.renderAccount(token))}
          <li>
            <button className="naumanniDashboard-header-addAccountButton"
              onClick={::this.onClickAddAccount}>
              <IconFont iconName="plus" />
            </button>
          </li>
        </ul>

        <span className="naumanniDashboard-header-spacer" />

        <button className="naumanniDashboard-header-configButton">
          <IconFont iconName="cog" />
        </button>

      </header>
    )
  }

  /**
   * ヘッダに顔アイコンを書くよ
   * @return {React.Component}
   */
  renderAccount(token) {
    if(!token.account) {
      return (
        <li key={token.address}>
          <div className="naumanniDashboard-header-noAccount">?</div>
        </li>
      )
    }

    return (
      <li key={token.address}>
        <DropdownMenuButton onRenderMenu={this.onRenderAccountMenu.bind(this, token)}>
          <UserIconWithHost account={token.account} />
        </DropdownMenuButton>
      </li>
    )
  }

  getStateFromContext() {
    const {accountsState} = this.context.context.getState()
    return {
      accountsState,
    }
  }

  // callbacks
  onRenderCompoundMenu() {
    return (
      <ul className="menu menu--header">
        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: SUBJECT_MIXED, timelineType: TIMELINE_HOME})}
          >
          <IconFont iconName="home" />
          <span className="menu-itemLabel">統合ホームタイムライン</span>
        </li>

        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: SUBJECT_MIXED, timelineType: TIMELINE_LOCAL})}>
          <IconFont iconName="users" />
          <span className="menu-itemLabel">統合ローカルタイムライン</span>
        </li>

        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: SUBJECT_MIXED, timelineType: TIMELINE_FEDERATION})}>
          <IconFont iconName="globe" />
          <span className="menu-itemLabel">統合連合タイムライン</span>
        </li>

      </ul>
    )
  }

  onRenderAccountMenu(token) {
    const {account} = token

    return (
      <ul className="menu menu--header">
        <li className="menu-description">
          <UserIconWithHost account={account} />
          <div className="menu-descriptionNote">
            <span className="user-displayName">{account.display_name}</span><br />
            <span className="user-account">{account.account}</span>

            <div>
              {account.hasPublicKey && <span className="user-hasPublickey"><IconFont iconName="key" />pub</span>}
            </div>
            <div>
              {account.hasPrivateKey && <span className="user-hasPrivatekey"><IconFont iconName="key" />prv</span>}
            </div>
            <button onClick={this.onClickGenKey.bind(this, token, account)}>鍵生成</button>
          </div>
        </li>
        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: account.address, timelineType: TIMELINE_HOME})}>
          <IconFont iconName="home" />
          <span>ホームタイムライン</span>
        </li>

        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: account.address, timelineType: TIMELINE_LOCAL})}>
          <IconFont iconName="users" />
          <span>ローカルタイムライン</span>
        </li>

        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(
            this, COLUMN_TIMELINE, {subject: account.address, timelineType: TIMELINE_FEDERATION})}>
          <IconFont iconName="globe" />
          <span>連合タイムライン</span>
        </li>

        <li className="menu-item"
          onClick={this.onClickMenuItem.bind(this, COLUMN_FRIENDS, {subject: account.address})}>
          <IconFont iconName="mail" />
          <span>メッセージ</span>
        </li>
      </ul>
    )
  }

  onClickAddAccount() {
    // TODO: named routingしたい
    this.context.app.pushState({}, null, '/account/add')
  }

  onClickMenuItem(columnType, columnParams) {
    const {context} = this.context

    context.useCase(new AddColumnUseCase()).execute(columnType, columnParams)
  }

  onClickGenKey(token, account) {
    const {context} = this.context

    context.useCase(
      new GenerateKeypairUseCase()
    ).execute(token, account)
  }
}
