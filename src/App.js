import React from "react";
import { ApolloProvider } from "react-apollo";
import { Query } from "react-apollo";
import client from "./client";
import { SEARCH_REPOSITORIES } from "./graphql";

const DEFAULT_STATE = {
  first: 5,
  after: null,
  last: null,
  before: null,
  query: "フロントエンドエンジニア",
};

const App = () => {
  const [default_state, setVariables] = React.useState(DEFAULT_STATE);
  const { query, first, last, before, after } = default_state;
  const handleChange = (e) => {
    setVariables({ ...default_state, query: e.target.value });
  };
  console.log({ query });
  return (
    <ApolloProvider client={client}>
      <form>
        <input value={query} onChange={(e) => handleChange(e)} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {({ loading, error, data }) => {
          if (loading) return "Loading...";
          if (error) return `Error! ${error.message}`;
          console.log({ data });
          return <div></div>;
        }}
      </Query>
    </ApolloProvider>
  );
};

export default App;
