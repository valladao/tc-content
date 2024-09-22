import dotenv from 'dotenv';
import { shopifyApi, LATEST_API_VERSION } from '@shopify/shopify-api';

dotenv.config();

const shopify = shopifyApi({
  apiKey: process.env.SHOPIFY_API_KEY || '',
  apiSecretKey: process.env.SHOPIFY_API_SECRET_KEY || '',
  scopes: ['read_products'],
  hostName: process.env.SHOPIFY_SHOP_NAME || '',
  apiVersion: LATEST_API_VERSION,
  isEmbeddedApp: false,
});

async function main() {
  try {
    // Your Shopify GraphQL queries and mutations will go here
    console.log('Shopify GraphQL client is set up!');
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
