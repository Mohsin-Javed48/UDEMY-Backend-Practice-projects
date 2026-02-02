const { buildSchema } = require("graphql");

module.exports = buildSchema(`
    type Post {
        _id: ID!
        title: String!
        content: String!
        imageUrl: String!
        creator: User!
        createdAt: String!
        updatedAt: String!
    }

    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        status: String!
        posts: [Post!]!
    }
    
    type AuthData {
        token: String!
        userId: String!
    }

   input userInputData {
        email: String!
        name: String!
        password: String!
   }

   input postInputData {
        title: String!
        content: String!
        imageUrl: String!
   }


    type RootMutation {
        createUser (userInput: userInputData): User!
        createPost (postInput: postInputData): Post!
        updatePost (postId: ID!, postInput: postInputData): Post!
        deletePost (postId: ID!): Boolean!
    }

    type RootQuery {
        login(email: String!, password: String!): AuthData!
        getPosts: [Post!]!
        getSinglePost(postId: ID!): Post!
    }
    
    schema {
        query: RootQuery
        mutation: RootMutation
    }

`);
