import dotenv from 'dotenv';
import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
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

const GET_PRODUCTS = gql`
  query GetProducts {
    products(first: 10) {
      edges {
        node {
          id
          title
          description
          images(first: 1) {
            edges {
              node {
                src
              }
            }
          }
        }
      }
    }
  }
`;

async function fetchProducts() {
  try {
    const { data } = await client.query({
      query: GET_PRODUCTS,
    });

    console.log(JSON.stringify(data.products.edges, null, 2));
  } catch (error) {
    console.error('Error fetching products:', error);
  }
}

fetchProducts();
