const { gql } = require("apollo-server-express");

const typeDefs = gql`
  type Query {
    checkToken: Response
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
    logout: Response
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
    countTasks: Int
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
    error: String
  }

  type Response {
    success: Boolean,
    error: String
  }
`;

module.exports = typeDefs;
