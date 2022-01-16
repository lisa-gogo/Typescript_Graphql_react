import "reflect-metadata";
import { MikroORM } from "@mikro-orm/core";
import { __prod__ } from "./constants";
// import { Post } from "./entities/Post";
import mikroOrmConfig from "./mikro-orm.config";
import express from 'express';
import {ApolloServer} from 'apollo-server-express'
import { buildSchema } from "type-graphql";
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session'
import { MyContext } from "./types";
// import connectRedis from 'connect-redis'







const main = async () =>{
   

    const orm = await MikroORM.init(mikroOrmConfig);
    await orm.getMigrator().up();
    const app = express();
// redis 

const RedisStore = require('connect-redis')(session)

const redisClient = redis.createClient()
 
app.use(
  session({
     name:'qid',
    store: new RedisStore({ 
        client: redisClient,
        // disableTTL: true,
        disableTouch: true
     }),

     cookie:{
         sameSite:'lax',//csrf 
       maxAge:1000*60*60*24*365*10,
       httpOnly:true,
       secure:__prod__,

     },
    saveUninitialized: false,
    secret: 'dagwagewrq',
    
    resave: false
  })
)

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