// import { Post } from "src/entities/Post";
import { Post } from "../entities/Post";
import { Arg, Ctx, Int, Query, Resolver } from "type-graphql";
import { MyContext } from "src/types";
import { convertNodeHttpToRequest } from "apollo-server-core";

@Resolver()
export class PostResolver {
    // type query 

    @Query(()=>[Post])
    posts(
        @Ctx() {em}: MyContext
    ):Promise<Post[]>{
        return em.find(Post,{})
    }

    @Query(()=>Post, {nullable:true})
    post(
        @Arg('id',()=>Int) id: number,
        @Ctx() {em}: MyContext
    ):Promise<Post| null>{
        return em.findOne(Post,{id})
    }
   
    

};