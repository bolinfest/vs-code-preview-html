import React, {Component} from 'react';

type KeyboardInteractivePrompt = {prompt: string, echo: boolean};

type PropsType = {
  prompts: Array<KeyboardInteractivePrompt>,
};

type StateType = {
  promptsIndex: number,
};

export default class KeyboardInteractive extends Component {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    // TODO(mbolin): Support going to the next prompt.
    this.state = {
      promptsIndex: 0,
    };
  }

  render() {
    const prompt = this.props.prompts[this.state.promptsIndex];
    if (prompt == null) {
      return <div />;
    }

    // TODO(mbolin): Support submitting prompt.
    const inputType = prompt.echo ? 'text' : 'password';
    return (
      <div>
        {prompt.prompt} <input type={inputType} />
      </div>
    );
  }
}
