// @ts-ignore
import { gql } from "graphql-tag";
import { DocumentNode } from "graphql";
export const typeDefs: DocumentNode = gql`
  type Query {
    test: String
  }
  type Mutation {
    test: String
  }
`;
