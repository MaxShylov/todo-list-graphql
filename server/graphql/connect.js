const { ApolloServer } = require("apollo-server-express");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    const token = req && req.headers.authorization.split("Bearer ")[1] || "";

    return { token };
  }
});

const connectFraphQL = ({ app, httpServer }) => {
  server.applyMiddleware({ app, path: "/graphql" });

  server.installSubscriptionHandlers(httpServer);
};

module.exports = connectFraphQL;
