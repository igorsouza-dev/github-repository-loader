import React, { Component } from 'react';
import { FaGithubAlt, FaPlus, FaSpinner } from 'react-icons/fa';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import Container from '../../components/Container';

import { Form, SubmitButton, List, ErrorText } from './styles';

class Main extends Component {
  constructor() {
    super();

    this.state = {
      newRepo: '',
      repositories: [],
      loading: false,
      error: false,
      errorMessage: null,
    };
  }

  componentDidMount() {
    const repositories = localStorage.getItem('repositories');
    if (repositories) {
      this.setState({ repositories: JSON.parse(repositories) });
    }
  }

  componentDidUpdate(_, prevState) {
    const { repositories } = this.state;
    if (prevState.repositories !== repositories) {
      localStorage.setItem('repositories', JSON.stringify(repositories));
    }
  }

  handleInputChange = e => {
    this.setState({ newRepo: e.target.value });
  };

  handleSubmit = async e => {
    e.preventDefault();
    this.setState({ loading: true, error: false, errorMessage: null });
    const { newRepo, repositories } = this.state;
    try {
      if (newRepo === '') throw 'You need to inform a repository';

      const hasRepo = repositories.find(r => r.name === newRepo);

      if (hasRepo) throw 'Repository was already added';

      const response = await api.get(`/repos/${newRepo}`);
      const data = {
        name: response.data.full_name,
      };

      this.setState({
        repositories: [...repositories, data],
        newRepo: '',
        loading: false,
      });
    } catch (error) {
      let errorMessage = error;
      if (error.response) {
        if (error.response.status === 404) {
          errorMessage = 'Repository does not exists';
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      this.setState({
        loading: false,
        error: true,
        errorMessage,
      });
    }
  };

  render() {
    const { newRepo, repositories, loading, error, errorMessage } = this.state;
    return (
      <Container>
        <h1>
          <FaGithubAlt />
          Repositories
        </h1>
        <Form onSubmit={this.handleSubmit} error={error}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <input
              type="text"
              placeholder="Add repository"
              value={newRepo}
              onChange={this.handleInputChange}
            />
            {error && <ErrorText error={error}>{errorMessage}</ErrorText>}
          </div>

          <SubmitButton loading={loading}>
            {loading ? (
              <FaSpinner color="#fff" size={14} />
            ) : (
              <FaPlus color="#fff" size={14} />
            )}
          </SubmitButton>
        </Form>
        <List>
          {repositories.map(repository => (
            <li key={repository.name}>
              <span>{repository.name}</span>
              <Link to={`/repository/${encodeURIComponent(repository.name)}`}>
                Detalhes
              </Link>
            </li>
          ))}
        </List>
      </Container>
    );
  }
}

export default Main;
