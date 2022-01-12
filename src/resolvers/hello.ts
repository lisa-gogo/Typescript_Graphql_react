import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
    // type query 

    @Query(()=>String)
    hello(){
        return " hello world "
    }

};