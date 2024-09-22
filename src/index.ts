import dotenv from 'dotenv';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client/core';
import fetch from 'node-fetch';

dotenv.config();

const client = new ApolloClient({
  uri: `https://${process.env.SHOPIFY_SHOP_NAME}/admin/api/2023-04/graphql.json`,
  cache: new InMemoryCache(),
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
  },
  fetch: fetch as any,
});

const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    blogs(first: 1) {
      edges {
        node {
          articles(first: 10) {
            edges {
              node {
                id
                title
                content
                publishedAt
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchBlogPosts() {
  try {
    const { data } = await client.query({
      query: GET_BLOG_POSTS,
    });

    console.log(JSON.stringify(data.blogs.edges[0].node.articles.edges, null, 2));
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
}

fetchBlogPosts();
