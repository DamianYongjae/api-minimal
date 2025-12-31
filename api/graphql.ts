// import { ApolloServer } from "apollo-server-express";
import { ApolloServer } from "@apollo/server";
import { IResolvers } from "@graphql-tools/utils";
import cors from "cors";
import express, { RequestHandler } from "express";
import requestIp from "request-ip";

import Mutation from "../src/resolvers/Mutation";
import Query from "../src/resolvers/Query";
import { typeDefs } from "../src/utils/typeDefs";
import { expressMiddleware } from "@apollo/server/express4";
import { makeExecutableSchema } from "@graphql-tools/schema";

const resolvers: IResolvers = {
  Mutation,
  Query
};

interface ServerContext {
  req?: any;
  clientIp?: string;
  member?: any;
}
const schema = makeExecutableSchema({ typeDefs, resolvers });

const apolloServer = new ApolloServer<ServerContext>({
  schema
});

const app = express();

// //@ts-ignore

// const startServer = async (server: any) => {
//   await server.start();
//   app.use(
//     "/graphql",
//     // @ts-ignore
//     cors({
//       origin: "*",
//       credentials: true,
//       optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
//     }),
//     express.json(),
//     // @ts-ignore
//     expressMiddleware(apolloServer, {
//       // @ts-ignore
//       context: ({ req }: any) => {
//         const clientIp = requestIp.getClientIp(req);
//         console.log(clientIp, req.body?.operationName);
//         return { req, clientIp };
//       }
//     })
//   );
// };

// startServer(apolloServer);

const corsMiddleware = cors({
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
});

app.use("/graphql", corsMiddleware, express.json());

// Track server initialization and middleware
let graphqlMiddleware: RequestHandler | null = null;
let serverStartPromise: Promise<void> | null = null;

// @ts-ignore
const ensureStarted = async (): Promise<RequestHandler> => {
  if (graphqlMiddleware) return graphqlMiddleware;

  if (!serverStartPromise) {
    serverStartPromise = apolloServer.start().then(() => {
      // Create the middleware only after server is started
      //@ts-ignore
      graphqlMiddleware = expressMiddleware(apolloServer, {
        // @ts-ignore
        context: ({ req }: any) => {
          const clientIp = requestIp.getClientIp(req);
          console.log(clientIp, req.body?.operationName);
          return { req, clientIp };
        }
      }) as RequestHandler;
    });
  }

  await serverStartPromise;
  return graphqlMiddleware!;
};

app.use("/graphql", async (req, res, next) => {
  // Skip non-GraphQL requests (OPTIONS already handled by CORS above)
  if (req.method === "OPTIONS") {
    return next();
  }

  try {
    const middleware = await ensureStarted();
    middleware(req, res, next);
  } catch (error) {
    next(error);
  }
});

export { apolloServer };

export default app;
