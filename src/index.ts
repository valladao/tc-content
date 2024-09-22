import dotenv from 'dotenv';
import { ApolloClient, InMemoryCache, gql, HttpLink } from '@apollo/client/core';
import fetch from 'node-fetch';

dotenv.config();

const httpLink = new HttpLink({
  uri: `https://${process.env.SHOPIFY_SHOP_NAME}/admin/api/2023-04/graphql.json`,
  fetch: fetch as any,
  headers: {
    'X-Shopify-Access-Token': process.env.SHOPIFY_ACCESS_TOKEN || '',
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

const GET_BLOG_POSTS = gql`
  query GetBlogPosts {
    blogs(first: 1) {
      edges {
        node {
          id
          title
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

    if (data.blogs.edges.length > 0) {
      const articles = data.blogs.edges[0].node.articles.edges;
      console.log(JSON.stringify(articles, null, 2));
    } else {
      console.log('No blogs found');
    }
  } catch (error) {
    console.error('Error fetching blog posts:', error);
  }
}

fetchBlogPosts();
