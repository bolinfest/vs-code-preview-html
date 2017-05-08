import React, {Component} from 'react';
import './FileSearch.css';

type PropsType = {
  query: string,
  searchDirectory: string,
  results: Array<string>,
  doQuery: (query: string) => void,
  openFile: (result: string) => void,
};

type StateType = {
  query: string,
};

export default class FileSearch extends Component {
  props: PropsType;
  state: StateType;

  constructor(props: PropsType) {
    super(props);
    (this: any)._onChange = this._onChange.bind(this);
    (this: any)._open = this._open.bind(this);
    this.state = {
      query: props.query,
    };
  }

  render() {
    const children = this.props.results.map(result => {
      return (
        <div className="file-search-query-result">
          <span className="file-search-query-result-text" onClick={() => this._open(result)}>{result}</span>
        </div>
      )
    });

    return (
      <div className="file-search-root">
        <div>
          <div className="file-search-title">
            Search <code>{this.props.searchDirectory}</code>:
          </div>
          <div>
            <input value={this.state.query} onChange={this._onChange} autoFocus={true} />
          </div>
        </div>
        <div>
          {children}
        </div>
      </div>
    );
  }

  _onChange(event: Event) {
    const query = event.target.value;
    this.setState({query});
    this.props.doQuery(query);
  }

  _open(result: string) {
    this.props.openFile(result);
  }
}
