import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://gateway.multiversx.com/graphql', // ← CORRIGIDO AGORA
  cache: new InMemoryCache(),
});

export default client;

