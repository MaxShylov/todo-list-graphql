import { gql } from "apollo-server-express";

const typeDefs = gql`
  type Query {
    tasks: [Task]
  }

  type Subscription {
    taskCreated: Task
    taskEdited: Task
    taskRemoved: Task
    tasksSorted: [Task]
  }

  type Mutation {
    register(
      username: String!,
      password: String!,
      confirm: String!
    ): Token
    login(
      username: String!,
      password: String!,
    ): Token
    addTask(content: String!): Task
    removeTask(id: ID!): Task
    editTask(
      id: ID!,
      content: String,
      status: String
    ): [Task]
    sortTasks(tasks: String!): [Task]
  }

  type Token {
    error: String
    token: String
  }

  type User {
    id: ID
    username: String
    password: String
    createAt: String
    error: String
    token: String
    tasks: [Task]
  }

  type Task {
    id: ID
    content: String
    status: String
    createAt: String
    edited: Boolean
  }

  type Response {
    success: Boolean,
    error: String
  }
`;

export default typeDefs;
