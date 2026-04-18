import gql from 'graphql-tag';

const fragment = gql`
  fragment RoleFragment on Role {
    name
    permissions {
      name
    }
    roles {
      name
    }
  }
`;

export const listQuery = gql`
  query roles($names: [String!]) {
    roles(names: $names) {
      ...RoleFragment
    }
  }
  ${fragment}
`;

export const getQuery = gql`
  query role($name: String) {
    role(name: $name) {
      ...RoleFragment
    }
  }
  ${fragment}
`;

export const editQuery = gql`
  mutation roleUpdate($data: RoleInput!) {
    roleUpdate(data: $data) {
      userErrors {
        message
        field
      }
      role {
        ...RoleFragment
      }
    }
  }
  ${fragment}
`;
