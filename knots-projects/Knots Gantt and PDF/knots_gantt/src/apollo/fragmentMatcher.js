import {
  IntrospectionFragmentMatcher
} from 'apollo-cache-inmemory';

export const fragmentMatcher = new IntrospectionFragmentMatcher({
  introspectionQueryResultData: {
    // eslint-disable-next-line id-match
    __schema: {
      types: [
      ]
    }
  }
});