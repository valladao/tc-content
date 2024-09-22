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

const GET_BLOG_TITLES = gql`
  query GetBlogTitles {
    blogs(first: 10) {
      edges {
        node {
          title
        }
      }
    }
  }
`

async function fetchBlogTitles() {
  try {
    const { data } = await client.query({
      query: GET_BLOG_TITLES
    })

    if (data.blogs.edges.length > 0) {
      console.log("Blog Titles:")
      data.blogs.edges.forEach((edge: any) => {
        console.log(edge.node.title)
      })
    } else {
      console.log("No blogs found")
    }
  } catch (error) {
    console.error("Error fetching blog titles:", error)
  }
}

fetchBlogTitles()
