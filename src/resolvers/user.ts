import { Mutation, Arg, InputType, Field, Ctx,Resolver, ObjectType } from "type-graphql";
import { MyContext } from "src/types";
import { User } from "../entities/User";
import argon2 from 'argon2'

// import session from "express-session";


@InputType()
class UsernamePasswordInput {

    @Field(()=>String)
    username: string
    @Field(()=>String)
    password: string

}

@ObjectType()
class FieldError{
    @Field(()=>String)
    field:string
    @Field(()=>String)
    message: string
}

@ObjectType()
class UserResponse {
    @Field(()=>[FieldError],{nullable:true})
    errors ?:FieldError[]

    @Field(()=>User, {nullable:true})
    user?:User
}

@Resolver()
export class UserResolver {
    @Mutation( () => UserResponse)
    async  register (
       @Arg('options',()=> UsernamePasswordInput) options: UsernamePasswordInput,
       @Ctx(){em} : MyContext
     ):Promise<UserResponse>{
        if(options.username.length <= 2){
            return {
                errors:[{
                       field:"username",
                       message:"length must be greater than 2",
                }]
            }
        }

        if(options.password.length <= 3){
        return {
            errors:[{
                    field:"password",
                    message:"password must be greater than 3",
            }]
        }
        }

       const hashedPassword = await argon2.hash(options.password)
       const user = em.create(User,{username: options.username, password:hashedPassword})

       try{
            await em.persistAndFlush(user)
       } catch(err: any){
           if(err.code ==="23505"){
               return {
                  errors:[{
                      field:" username",
                      message:"username already taken",
                  }]
               }
           }
       }
      
       return {
           user
       }
    }

    @Mutation( () => UserResponse)
    async  login (
       @Arg('options',()=> UsernamePasswordInput) options: UsernamePasswordInput,
       @Ctx(){em, req} : MyContext
     ): Promise<UserResponse>{
         const user = await em.findOne(User, {username: options.username});
         if(!user){
             return {

            errors:[{
                field:"username",
                message: "that username does not exist ",
            }]

             }
         }
         const valid = await argon2.verify(user.password, options.password);
         if(!valid){
             return {
                errors:[{
                    field:"password",
                    message: "invalid password ",
                }]   
             }
         }    
        
        req.session.userId= user.id
       return{
           user 
       }
    }

};