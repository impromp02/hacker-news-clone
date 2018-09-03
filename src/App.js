import React, { Component } from 'react';
import './App.css';

const DEFAULT_QUERY = 'redux',
      DEFAULT_HPP = '100',

      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=',
      PARAM_PAGE = 'page=',
      PARAM_HPP = 'hitsPerPage=';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
  }

  onDismiss(id) {
    const {searchKey, results} = this.state;
    const updatedResult = results[searchKey].hits.filter(item => item.objectID !== id);
    this.setState({results: {...results, [searchKey]: {hits: updatedResult}}});
  }

  onSearchChange(event) {
    this.setState({searchTerm: event.target.value});
    
  }

  onSearchSubmit(event) {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    if(this.needsToSearchTopStories(searchTerm)) {
      this.fetchSearchTopStories(searchTerm);
    }
    event.preventDefault();
  }

  setSearchTopStories(result) {
    const {hits, page} = result;
    const {searchKey, results} = this.state;
    //const oldHits = this.state.result.hits || [];
    const oldHits = results && results[searchKey] ? results[searchKey].hits : [];
    const updatedHits = [...oldHits, ...hits];
    console.log(updatedHits)
    this.setState({
      results: {
        ...results, 
        [searchKey]: {hits: updatedHits, page}
      }
    });

  }

  fetchSearchTopStories(searchTerm, page = 0) {
    fetch(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(response => response.json())
      .then(result => this.setSearchTopStories(result))
      .catch(error => error);
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  componentDidMount() {
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  render() {
    const {searchTerm, results, searchKey} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const result = (results && results[searchKey] && results[searchKey].hits) || [];
    return (
      <div className="page">
        <div className="interactions">
          <Search searchTerm={searchTerm} onSearchChange={this.onSearchChange} onSearchSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        {
          <Table list={result} onDismiss={this.onDismiss}/>
        }
        <Button onClick={() => this.fetchSearchTopStories(searchKey, page+1)}>
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