import express from "express";
import { createServer } from "http";
import path from "path";

import connectFraphQL from "./graphql/connect";

const PORT = process.env.PORT || 8000;

const app = express();
const httpServer = createServer(app);

connectFraphQL({ app, httpServer });

app.use(express.static(path.join(__dirname, 'client/build')));

app.get('*', (req,res) =>{
  res.sendFile(path.join(__dirname+'/client/build/index.html'));
});

httpServer.listen({ port: PORT }, () => {
  console.log(`Apollo Server on http://localhost:${PORT}/graphql`);
  console.log(`Apollo Subscription on ws://localhost:${PORT}/graphql`);
});
