import React from "react";
import { ApolloProvider, Mutation, Query } from "react-apollo";
import client from "./client";
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from "./graphql";

const StarButton = ({ node, query, first, last, before, after }) => {
  const viewerHasStarred = node.viewerHasStarred;
  const totalCount = node.stargazers.totalCount;
  const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`;
  const StarStatus = ({ addOrRemoveStar }) => (
    <button
      onClick={() =>
        addOrRemoveStar({ variables: { input: { starrableId: node.id } } })
      }
    >
      {starCount} | {viewerHasStarred ? "stared" : "-"}
    </button>
  );

  return (
    <Mutation
      mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
      refetchQueries={(mutationResult) => {
        console.log({ mutationResult });
        return [
          {
            query: SEARCH_REPOSITORIES,
            variables: { query, first, last, before, after },
          },
        ];
      }}
    >
      {(addOrRemoveStar) => <StarStatus addOrRemoveStar={addOrRemoveStar} />}
    </Mutation>
  );
};

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
  const handleGoPrevious = (search) =>
    setVariables({
      ...default_state,
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
    });
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

                    <StarButton
                      node={edge.node}
                      {...{ query, first, last, after, before }}
                    ></StarButton>
                  </li>
                ))}
              </ul>
              {search.pageInfo.hasPreviousPage ? (
                <button onClick={() => handleGoPrevious(search)}>
                  Previous
                </button>
              ) : null}
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
