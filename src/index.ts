import dotenv from "dotenv"
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client/core"
import fetch from "node-fetch"
import fs from "fs"
import path from "path"
import { fileURLToPath } from 'url'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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

const GET_BLOG_ARTICLES = gql`
  query GetBlogArticles($cursor: String) {
    articles(first: 250, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          handle
          title
          body
          tags
          blog {
            title
          }
        }
      }
    }
  }
`

async function fetchBlogArticles() {
  try {
    let hasNextPage = true;
    let cursor = null;
    let allArticles: any[] = [];

    while (hasNextPage) {
      const { data } = await client.query({
        query: GET_BLOG_ARTICLES,
        variables: { cursor }
      });

      if (!data || !data.articles || !data.articles.edges) {
        console.error("Unexpected data structure received:", data);
        return;
      }

      allArticles = allArticles.concat(data.articles.edges);
      hasNextPage = data.articles.pageInfo.hasNextPage;
      cursor = data.articles.pageInfo.endCursor;

      console.log(`Fetched ${data.articles.edges.length} articles. Total: ${allArticles.length}`);
    }

    console.log(`Total articles received: ${allArticles.length}`);

    const blogTitles = new Set(
      allArticles.map((edge: any) => edge.node.blog.title)
    );
    console.log("Blog titles found:", Array.from(blogTitles));

    const santosCatolicosArticles = allArticles.filter(
      (edge: any) => edge.node.blog.title === "Santos Católicos"
    );

    if (santosCatolicosArticles.length > 0) {
      console.log(
        `Found ${santosCatolicosArticles.length} articles from Santos Católicos blog`
      );
      santosCatolicosArticles.forEach((edge: any) => {
        const article = edge.node;
        saveHtmlContent(article);
        saveJsonMetadata(article);
      });
    } else {
      console.log("No articles found in Santos Católicos blog");
    }
  } catch (error) {
    console.error("Error fetching blog articles:", error);
  }
}

function saveHtmlContent(article: any) {
  const publishedDir = path.join(__dirname, "..", "published")
  if (!fs.existsSync(publishedDir)) {
    fs.mkdirSync(publishedDir, { recursive: true })
  }

  const filePath = path.join(publishedDir, `${article.handle}.html`)
  fs.writeFileSync(filePath, article.body)
  console.log(`Saved HTML content for "${article.title}" to ${filePath}`)
}

function saveJsonMetadata(article: any) {
  const publishedPostsDir = path.join(__dirname, "..", "published-posts")
  if (!fs.existsSync(publishedPostsDir)) {
    fs.mkdirSync(publishedPostsDir, { recursive: true })
  }

  const metadata = {
    id: article.id,
    handle: article.handle,
    title: article.title,
    tags: article.tags,
    blogTitle: article.blog.title
  }

  const filePath = path.join(publishedPostsDir, `${article.handle}.json`)
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2))
  console.log(`Saved JSON metadata for "${article.title}" to ${filePath}`)
}

fetchBlogArticles().catch(error => {
  console.error("Error in fetchBlogArticles:", error)
})
