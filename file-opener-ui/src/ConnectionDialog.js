/** @flow */

import React, {Component} from 'react';
import './ConnectionDialog.css';

type PropsType = {
  host: string,
  privateKey: string,
  serverCommand: string,
  onConnect: (host: string, privateKey: string, serverCommand: string) => void,
};

type StateType = {
  host: string,
  privateKey: string,
  serverCommand: string,
};

export default class ConnectionDialog extends Component {
  static defaultProps = {
    host: 'localhost',
    privateKey: '~/.ssh/test_id_rsa',
    serverCommand: '/usr/local/bin/node /Users/mbolin/fbsource/fbobjc/Tools/Nuclide/modules/nuclide-proxy/src/fb-filesearch/main-entry.js',
  };

  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._onSubmit = this._onSubmit.bind(this);
    this.state = {
      host: props.host,
      privateKey: props.privateKey,
      serverCommand: props.serverCommand,
    };
  }

  render() {
    return (
      <div className="connection-dialog-root">
        <form onSubmit={this._onSubmit}>
          <div className="connection-dialog">
            <div className="connection-dialog-row">
              <div className="connection-dialog-cell">Host:</div>
              <div className="connection-dialog-cell">
                <input value={this.state.host} onChange={e => this.setState({host: e.target.value})} />
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
          </div>
          <div className="connection-dialog-submit-button-container">
            <button className="connection-dialog-submit-button" type="submit">CONNECT</button>
          </div>
        </form>
      </div>
    );
  }

  _onSubmit(event: Event) {
    this.props.onConnect(this.state.host, this.state.privateKey, this.state.serverCommand);
    event.preventDefault();
  }
}
