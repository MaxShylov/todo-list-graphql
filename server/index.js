import express from "express";
import { createServer } from "http";

import connectFraphQL from "./graphql/connect";

const PORT = process.env.PORT || 8000

const app = express();
const httpServer = createServer(app);

connectFraphQL({app, httpServer});

httpServer.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
  console.log(`Apollo Subscription on ws://localhost:${PORT}/graphql`);
});
