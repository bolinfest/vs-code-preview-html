/** @flow */

import React, {Component} from 'react';
import './ConnectionDialog.css';

type PropsType = {
  host: string,
  privateKey: string,
  serverCommand: string,
  searchDirectory: string,
  onConnect(host: string, privateKey: string, serverCommand: string, searchDirectory: string): void,
};

type StateType = {
  host: string,
  privateKey: string,
  serverCommand: string,
  searchDirectory: string,
};

const STORAGE_KEY = 'big-dig.lastConnection';

export default class ConnectionDialog extends Component {
  static defaultProps = {
    host: '',
    privateKey: '',
    serverCommand: '',
    searchDirectory: '',
  };

  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._onSubmit = this._onSubmit.bind(this);
    const lastState = localStorage.getItem(STORAGE_KEY);
    if (lastState) {
      this.state = JSON.parse(lastState);
    } else {
      this.state = {
        host: props.host,
        privateKey: props.privateKey,
        serverCommand: props.serverCommand,
        searchDirectory: props.searchDirectory,
      };
    }
  }

  render() {
    // Note that we autofocus the first input, though we should really autofocus
    // the first empty input, or the submit button if all inputs are non-empty.
    return (
      <div className="connection-dialog-root">
        <form onSubmit={this._onSubmit}>
          <div className="connection-dialog">
            <div className="connection-dialog-row">
              <div className="connection-dialog-cell">Host:</div>
              <div className="connection-dialog-cell">
                <input value={this.state.host} onChange={e => this.setState({host: e.target.value})} autoFocus={true} />
              </div>
            </div>
            <div className="connection-dialog-row">
              <div className="connection-dialog-cell">Private Key:</div>
              <div className="connection-dialog-cell">
                <input value={this.state.privateKey} onChange={e => this.setState({privateKey: e.target.value})} />
              </div>
            </div>
            <div className="connection-dialog-row">
              <div className="connection-dialog-cell">Server Command:</div>
              <div className="connection-dialog-cell">
                <input value={this.state.serverCommand} onChange={e => this.setState({serverCommand: e.target.value})} />
              </div>
            </div>
            <div className="connection-dialog-row">
              <div className="connection-dialog-cell">Search Directory:</div>
              <div className="connection-dialog-cell">
                <input value={this.state.searchDirectory} onChange={e => this.setState({searchDirectory: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="connection-dialog-submit-button-container">
            <button className="connection-dialog-submit-button" type="submit">CONNECT</button>
          </div>
        </form>
      </div>
    );
  }

  _onSubmit(event: Event) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    this.props.onConnect(this.state.host, this.state.privateKey, this.state.serverCommand, this.state.searchDirectory);
    event.preventDefault();
  }
}
