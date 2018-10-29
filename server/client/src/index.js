import React from 'react';
import ReactDOM from 'react-dom';
import { ApolloProvider } from 'react-apollo';
import { ApolloClient } from 'apollo-client';
import { getMainDefinition } from 'apollo-utilities';
import { ApolloLink, split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';

import App from './App';


const HTTP_URI = process.env.NODE_ENV === 'development'
  ? 'http://localhost:8000/graphql'
  : 'https://todo-list-gql.herokuapp.com/graphql';

const WS_URI = process.env.NODE_ENV === 'development'
  ? 'ws://localhost:8000/graphql'
  : 'wss://todo-list-gql.herokuapp.com/graphql';


const httpLink = new HttpLink({
  uri: HTTP_URI,
  headers: {
    authorization: `Bearer ${localStorage.token}`
  }
});

const wsLink = new WebSocketLink({
  uri: WS_URI,
  options: {
    reconnect: true
  }
});

const terminatingLink = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return (
      kind === 'OperationDefinition' && operation === 'subscription'
    );
  },
  wsLink,
  httpLink
);

const link = ApolloLink.from([terminatingLink]);

const cache = new InMemoryCache();

const client = new ApolloClient({
  link,
  cache
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
