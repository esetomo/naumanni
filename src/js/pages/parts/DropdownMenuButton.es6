import React from 'react'
import PropTypes from 'prop-types'


/**
 * メニューがにょっと出てくる
 */
export default class DropdownMenuButton extends React.Component {
  static propTypes = {
    // children
    onRenderMenu: PropTypes.func.isRequired,
  }

  state = {
    menuVisible: false,
  }

  /**
   * @override
   */
  render() {
    return (
      <div className="dropdownMenuButton" onMouseLeave={::this.onMouseLeave}>
        <div className="dropdownMenuButton-button" onClick={::this.onClickButton}>
          {this.props.children}
        </div>
        {this.state.menuVisible && (
          <div className="dropdownMenuButton-menu" onClick={::this.onClickMenu}>
            {this.props.onRenderMenu()}
          </div>
        )}
      </div>
    )
  }

  onClickButton(e) {
    e.preventDefault()
    this.setState({menuVisible: !this.state.menuVisible})
  }

  onClickMenu() {
    this.setState({menuVisible: false})
  }

  onMouseLeave() {
    this.setState({menuVisible: false})
  }
}
