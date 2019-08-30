import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';

import PropTypes from 'prop-types';
import api from '../../services/api';

import {
  Loading,
  Owner,
  IssueList,
  Paginator,
  PaginatorButton,
  IssueFilter,
  IssueButton,
} from './styles';
import Container from '../../components/Container';

export default class Repository extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        repository: PropTypes.string,
      }),
    }).isRequired,
  };

  constructor() {
    super();
    this.state = {
      repository: {},
      issues: [],
      loading: true,
      filterState: 'all',
      page: 1,
    };
  }

  async componentDidMount() {
    this.fetchData();
  }

  handleClick = async action => {
    const { page } = this.state;
    await this.setState({
      page: action === 'back' ? page - 1 : page + 1,
    });
    this.fetchData();
  };

  async fetchData() {
    const { match } = this.props;
    const { filterState, page } = this.state;
    const repoName = decodeURIComponent(match.params.repository);

    const [repository, issues] = await Promise.all([
      api.get(`/repos/${repoName}`),
      api.get(`/repos/${repoName}/issues`, {
        params: {
          state: filterState,
          per_page: 5,
          page,
        },
      }),
    ]);

    await this.setState({
      loading: false,
      repository: repository.data,
      issues: issues.data,
    });
  }

  async handleFilterState(filterState) {
    await this.setState({ filterState });
    this.fetchData();
  }

  render() {
    const { repository, issues, loading, page, filterState } = this.state;

    if (loading) {
      return <Loading>Carregando</Loading>;
    }
    const filters = [
      { label: 'All', value: 'all' },
      { label: 'Open', value: 'open' },
      { label: 'Closed', value: 'closed' },
    ];
    return (
      <Container>
        <Owner>
          <Link to="/">Back</Link>
          <img src={repository.owner.avatar_url} alt={repository.owner.login} />
          <h1>{repository.name}</h1>
          <p>{repository.description}</p>
        </Owner>
        <IssueFilter>
          {filters.map(filter => (
            <IssueButton
              key={filter.value}
              type="button"
              onClick={() => this.handleFilterState(filter.value)}
              active={filterState === filter.value}
            >
              {filter.label}
            </IssueButton>
          ))}
        </IssueFilter>
        <IssueList>
          {issues.map(issue => (
            <li key={String(issue.id)}>
              <img src={issue.user.avatar_url} alt={issue.user.login} />
              <div>
                <strong>
                  <a href={issue.html_url}>{issue.title}</a>
                  {issue.labels.map(label => (
                    <span key={label.id}>{label.name}</span>
                  ))}
                </strong>
                <p>{issue.user.login}</p>
              </div>
            </li>
          ))}
        </IssueList>
        <Paginator>
          <PaginatorButton
            disabled={page < 2}
            onClick={() => this.handleClick('back')}
          >
            <FaArrowLeft />
          </PaginatorButton>
          <PaginatorButton onClick={() => this.handleClick('next')}>
            <FaArrowRight />
          </PaginatorButton>
        </Paginator>
      </Container>
    );
  }
}
