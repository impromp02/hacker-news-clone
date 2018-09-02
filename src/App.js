import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux',
      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=',
      PARAM_PAGE = 'page=';

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
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
  }

  onDismiss(id) {
    const updatedResult = this.state.result.hits.filter(item => item.objectID !== id);
    this.setState({result: {...this.state.result, hits: updatedResult}});
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
    
  }

  onSearchSubmit(event) {
    const {searchTerm} = this.state;
    this.fetchSearchTopStories(searchTerm);
    event.preventDefault();
  }

  setSearchTopStories(result) {
    this.setState({result});
  }

  fetchSearchTopStories(searchTerm, page = 0) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const {searchTerm, result} = this.state;
    const page = (result && result.page) || 0;

    return (
      <div className="page">
        <div className="interactions">
          <Search searchTerm={searchTerm} onSearchChange={this.onSearchChange} onSearchSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        {
          result && <Table list={result.hits} onDismiss={this.onDismiss}/>
        }
        <Button onClick={() => this.fetchSearchTopStories(searchTerm, page+1)}>
          More
        </Button>
      </div>
    );
  }
}  

export default App;

const Search = ({searchTerm, onSearchChange, onSearchSubmit, children}) => {
  return (
    <form onSubmit={onSearchSubmit}>
      <input value={searchTerm} onChange={onSearchChange} type="text"/>
      <button type="submit">{children}</button>
    </form>
  );
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
                <Button className="button-inline" onClick={() => onDismiss(item.objectID)}>Dismiss</Button>
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
    <button onClick={() => props.onClick()}>{props.children}</button>
  );
}