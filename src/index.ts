import dotenv from "dotenv"
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client/core"
import fetch from "node-fetch"

dotenv.config()

const httpLink = new HttpLink({
  uri: `https://${process.env.SHOPIFY_SHOP_NAME}/admin/api/unstable/graphql.json`,
  fetch: fetch as any,
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN || ""
  }
})

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    blogs(first: 1) {
      edges {
        node {
          title
          articles(first: 10) {
            edges {
              node {
                title
                content
              }
            }
          }
        }
      }
    }
  }
`

async function fetchBlogPosts() {
  try {
    const { data } = await client.query({
      query: GET_BLOG_POSTS
    })

    if (data.blogs.edges.length > 0) {
      const blog = data.blogs.edges[0].node
      console.log("Blog Title:", blog.title)
      console.log("Articles:", JSON.stringify(blog.articles.edges, null, 2))
    } else {
      console.log("No blogs found")
    }
  } catch (error) {
    console.error("Error fetching blog posts:", error)
  }
}

fetchBlogPosts()
