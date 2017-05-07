import React, {Component} from 'react';
import './KeyboardInteractive.css';

type KeyboardInteractivePrompt = {prompt: string, echo: boolean};

type PropsType = {
  prompts: Array<KeyboardInteractivePrompt>,
  finish(responses: Array<string>): void,
};

type StateType = {
  response: string,
  responses: Array<string>,
};

export default class KeyboardInteractive extends Component {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._onSubmit = this._onSubmit.bind(this);
    // TODO(mbolin): Support going to the next prompt.
    this.state = {
      response: '',
      responses: [],
    };
  }

  render() {
    const prompt = this.props.prompts[this.state.responses.length];
    if (prompt == null) {
      return <div />;
    }

    const inputType = prompt.echo ? 'text' : 'password';
    return (
      <form onSubmit={this._onSubmit}>
        <div>
          <div className="keyboard-interactive-prompt">{prompt.prompt}</div>
          <input type={inputType} value={this.state.response} onChange={e => this.setState({response: e.target.value})} />
        </div>
        <div className="connection-dialog-submit-button-container">
          <button className="connection-dialog-submit-button" type="submit">SUBMIT</button>
        </div>
      </form>
    );
  }

  _onSubmit(event: Event) {
    event.preventDefault();
    const newResponses = this.state.responses.concat(this.state.response);
    this.setState({
      response: '',
      responses: newResponses,
    });
    if (newResponses.length === this.props.prompts.length) {
      this.props.finish(newResponses);
    }
  }
}
