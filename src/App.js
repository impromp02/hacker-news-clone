import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux',
      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null,
      searchTerm: DEFAULT_QUERY,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
  }

  onDismiss(id) {
    const updatedResult = this.state.result.filter(item => item.objectID !== id);
    this.setState({result: updatedResult});
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
  }

  setSearchTopStories(result) {
    this.setState({result: result});
  }

  componentDidMount() {
    const {searchTerm} = this.state;

    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result.hits))
      .catch(error => error);
  }

  render() {
    const {searchTerm, result} = this.state;

    if(!result) return null;

    return (
      <div className="page">
        <div className="interactions">
          <Search searchTerm={searchTerm} onSearchChange={this.onSearchChange}>
            Search
          </Search>
        </div>
          <Table list={result} onDismiss={this.onDismiss}/>
      </div>
    );
  }
}

export default App;

class Search extends Component {
  render() {
    const {onSearchChange, searchTerm} = this.props;
    return (
      <form>
        {this.props.children}
        <input value={searchTerm} onChange={onSearchChange} type="text"/>
      </form>
    );
  }
}

class Table extends Component {
  render() {
    const {list, onDismiss} = this.props;
    return (
      <div className="table">
        {list
          .map(item => 
            <div key={item.objectID} className="table-row">
              <span><a href={item.url}>{item.title}</a></span>
              <span>{item.author}</span>
              <span>{item.num_comments}</span>
              <span>{item.points}</span>
              <span>
                <Button className="button-inline" id={item.objectID} onDismiss={onDismiss}>Dismiss</Button>
              </span>
            </div>
          )
        }
      </div>
    );
  }
}

function Button(props) {
  return (
    <button onClick={() => props.onDismiss(props.id)}>{props.children}</button>
  );
}