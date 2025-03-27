import { ApolloClient, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: 'https://gateway.multiversx.com/graphql', // ou outro endpoint GQL
  cache: new InMemoryCache(),
});

export default client;


