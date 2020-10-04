import React from "react";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import client from "./client";
import { SEARCH_REPOSITORIES } from "./graphql";

const PER_PAGE = 5;
const DEFAULT_STATE = {
  first: PER_PAGE,
  after: null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア",
};

const App = () => {
  const [default_state, setVariables] = React.useState(DEFAULT_STATE);
  const { query, first, last, before, after } = default_state;
  const handleChange = (e) =>
    setVariables({ ...default_state, query: e.target.value });

  const handleSubmit = (e) => e.preventDefault();
  const handleGoNext = (search) =>
    setVariables({ ...default_state, after: search.pageInfo.endCursor });
  return (
    <ApolloProvider client={client}>
      <form onSubmit={(e) => handleSubmit(e)}>
        <input value={query} onChange={(e) => handleChange(e)} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
          const search = data.search;
          const repositoryCount = search.repositoryCount;
          const repositoryUnit =
            repositoryCount === 1 ? "Repository" : "Repositories";
          const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`;

          return (
            <React.Fragment>
              <h2>{title}</h2>
              <ul>
                {search.edges.map((edge) => (
                  <li key={edge.node.id}>
                    <a
                      href={edge.node.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {edge.node.name}
                    </a>
                  </li>
                ))}
              </ul>
              {search.pageInfo.hasNextPage ? (
                <button onClick={() => handleGoNext(search)}>Next</button>
              ) : null}
            </React.Fragment>
          );
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
