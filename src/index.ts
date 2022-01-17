import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";

import mikroOrmConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import { MyContext } from "./types";
import session from 'express-session'

// import cookieSession from "cookie-session";
import connectRedis from "connect-redis";
import { createClient } from "redis";


const main = async () =>{
   

    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    const app = express();
// redis 

const RedisStore = connectRedis(session)


const redisClient =createClient();
   
 

app.use(
    session({
      name: "qid",
      store: new RedisStore({
        client: redisClient,
        disableTouch: true,
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        httpOnly: true,
        sameSite: "lax", // csrf
        secure: __prod__, // cookie only works in https
        // domain: __prod__ ? ".codeponder.com" : undefined,
      },
      saveUninitialized: false,
      secret: 'dwew',
      resave: false,
    })
  );

//redis

    // const post = orm.em.create(Post,{title:'my first post'})
    // await orm.em.persistAndFlush(post)

    // second 
 /*    await orm.em.nativeInsert(Post,{title:'my first post 2'}) */

//    const posts = await orm.em.find(Post,{})
//    console.log(posts)


 const apolloServer = new ApolloServer({
   schema: await buildSchema({
        resolvers : [HelloResolver, PostResolver,UserResolver],
       validate:false ,
   }),

   context :({req,res}):MyContext=>({em: orm.em,req,res})
 })      
 
 await apolloServer.start();

 apolloServer.applyMiddleware({app})
//  app.get('/',(_,res)=>{
//      res.send('Hello')

//  })
 app.listen(4000,()=>{
     console.log('server started on localhost:4000')
 })

}

main().catch((err)=>{
    console.error(err)

}
)

console.log("hello ")