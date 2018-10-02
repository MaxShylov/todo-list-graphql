import { ApolloServer } from "apollo-server-express";

import typeDefs from "./schema";
import resolvers from "./resolvers";

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

export default connectFraphQL;
