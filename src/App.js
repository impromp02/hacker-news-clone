import React, { Component } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import { sortBy } from 'lodash';
import './App.css';

const DEFAULT_QUERY = 'redux',
      DEFAULT_HPP = '100',

      PATH_BASE = 'https://hn.algolia.com/api/v1',
      PATH_SEARCH = '/search',
      PARAM_SEARCH = 'query=',
      PARAM_PAGE = 'page=',
      PARAM_HPP = 'hitsPerPage=';

const SORTS = {
  NONE: list => list,
  TITLE: list => sortBy(list, 'title'),
  AUTHOR: list => sortBy(list, 'author'),
  COMMENTS: list => sortBy(list, 'num_comments').reverse(),
  POINTS: list => sortBy(list, 'points').reverse(),
};

class App extends Component {
  _isModified = false;

  constructor(props) {
    super(props);
    this.state = {
      results: null,
      searchKey: '',
      searchTerm: DEFAULT_QUERY,
      error: null,
      isLoading: false,
      sortKey: 'NONE',
      isSortReversed: false,
    };

    this.onDismiss = this.onDismiss.bind(this);
    this.onSearchChange = this.onSearchChange.bind(this);
    this.setSearchTopStories = this.setSearchTopStories.bind(this);
    this.fetchSearchTopStories = this.fetchSearchTopStories.bind(this);
    this.onSearchSubmit = this.onSearchSubmit.bind(this);
    this.needsToSearchTopStories = this.needsToSearchTopStories.bind(this);
    this.onSort = this.onSort.bind(this);
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
    this.setState({
      results: {
        ...results, 
        [searchKey]: {hits: updatedHits, page},
      },
      isLoading: false
    });

  }

  fetchSearchTopStories(searchTerm, page = 0) {
    this.setState({isLoading: true});

    axios(`${PATH_BASE}${PATH_SEARCH}?${PARAM_SEARCH}${searchTerm}&${PARAM_PAGE}${page}&${PARAM_HPP}${DEFAULT_HPP}`)
      .then(result => this._isModified && this.setSearchTopStories(result.data))
      .catch(error => this._isModified && this.setState({error}));
  }

  needsToSearchTopStories(searchTerm) {
    return !this.state.results[searchTerm];
  }

  onSort(sortKey) {
    const isSortReversed = this.state.sortKey === sortKey && !this.state.isSortReversed;
    this.setState({sortKey, isSortReversed});
  }

  componentDidMount() {
    this._isModified = true;
    const {searchTerm} = this.state;
    this.setState({searchKey: searchTerm});
    this.fetchSearchTopStories(searchTerm);
  }

  componentWillUnmount() {
    this._isModified = false;
  }
  render() {
    const {searchTerm, results, searchKey, error, isLoading, sortKey, isSortReversed} = this.state;
    const page = (results && results[searchKey] && results[searchKey].page) || 0;
    const result = (results && results[searchKey] && results[searchKey].hits) || [];

    return (
      <div className="page">
        <div className="interactions">
          <Search searchTerm={searchTerm} onSearchChange={this.onSearchChange} onSearchSubmit={this.onSearchSubmit}>
            Search
          </Search>
        </div>
        { error ?
          <div>
            <p>Something went wrong..</p>
          </div> :
          <Table list={result} onDismiss={this.onDismiss} sortKey={sortKey} onSort={this.onSort} isSortReversed={isSortReversed}/>
        }
        { isLoading ? <Loading/> : 
          <Button onClick={() => this.fetchSearchTopStories(searchKey, page+1)}>
          More
          </Button>
        }
      </div>
    );
  }
}  

export default App;

class Search extends Component {
  componentDidMount() {
    if(this.input) {
      this.input.focus();
    }
  }

  render() {
    const {searchTerm, onSearchSubmit, onSearchChange, children} = this.props;
    return (
      <form onSubmit={onSearchSubmit}>
        <input value={searchTerm} onChange={onSearchChange} type="text" ref={(node) => this.input = node}/>
        <button type="submit">{children}</button>
      </form>
    );
  }
}

//Table Component
class Table extends Component {
  render() {
    const {list, onDismiss, sortKey, onSort, isSortReversed} = this.props;
    const sortedList = SORTS[sortKey](list);
    const reverseSortedList = isSortReversed ? sortedList.reverse() : sortedList;

    return (
      <div className="table">
        <div className="table-header">
          <span style={{width: '40%'}}>
            <Sort sortKey={'TITLE'} onSort={onSort} activeSortKey={sortKey}>Title</Sort> 
          </span>
          <span style={{width: '30%'}}>
            <Sort sortKey={'AUTHOR'} onSort={onSort} activeSortKey={sortKey}>Author</Sort> 
          </span>
          <span style={{width: '10%'}}>
            <Sort sortKey={'COMMENTS'} onSort={onSort} activeSortKey={sortKey}>Comments</Sort> 
          </span>
          <span style={{width: '10%'}}>
            <Sort sortKey={'POINTS'} onSort={onSort} activeSortKey={sortKey}>Points</Sort> 
          </span>
          <span style={{width: '10%'}}>
            Archive
          </span>
        </div>
        {reverseSortedList
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

Table.propTypes = {
  list: PropTypes.arrayOf(
    PropTypes.shape({
      objectID: PropTypes.string.isRequired,
      author: PropTypes.string,
      url: PropTypes.string,
      num_comments: PropTypes.number,   
    })
  ).isRequired,
  onDismiss: PropTypes.func.isRequired,
}

// Button component
function Button({onClick, children, className}) {
  return (
    <button onClick={() => onClick()} className={className}>{children}</button>
  );
}

Button.propTypes = {
  onClick: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
}

const Loading = (props) => <p>Loading...</p>;

const Sort = ({sortKey, onSort, children, activeSortKey}) => {
  const sortClass = ['button-inline'];
  if(sortKey === activeSortKey) {
    sortClass.push('button-active');
  }
  return <Button onClick={() => onSort(sortKey)} className={sortClass.join(' ')}>{children}</Button>
}