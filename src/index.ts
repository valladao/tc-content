import dotenv from "dotenv"
import { ApolloClient, InMemoryCache, gql, HttpLink } from "@apollo/client/core"
import fetch from "node-fetch"
import fs from "fs"
import path from "path"

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

const GET_BLOG_ARTICLES = gql`
  query GetBlogArticles {
    articles(first: 250) {
      edges {
        node {
          id
          handle
          title
          content
          tags
          url
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
    const { data } = await client.query({
      query: GET_BLOG_ARTICLES
    })

    const santosCatolicosArticles = data.articles.edges.filter((edge: any) => 
      edge.node.blog.title === 'Santos Católicos'
    )

    if (santosCatolicosArticles.length > 0) {
      console.log(`Found ${santosCatolicosArticles.length} articles from Santos Católicos blog`)
      santosCatolicosArticles.forEach((edge: any) => {
        const article = edge.node
        saveHtmlContent(article)
        saveJsonMetadata(article)
      })
    } else {
      console.log("No articles found in Santos Católicos blog")
    }
  } catch (error) {
    console.error("Error fetching blog articles:", error)
  }
}

function saveHtmlContent(article: any) {
  const publishedDir = path.join(__dirname, '..', 'published')
  if (!fs.existsSync(publishedDir)) {
    fs.mkdirSync(publishedDir, { recursive: true })
  }

  const filePath = path.join(publishedDir, `${article.handle}.html`)
  fs.writeFileSync(filePath, article.content)
  console.log(`Saved HTML content for "${article.title}" to ${filePath}`)
}

function saveJsonMetadata(article: any) {
  const publishedPostsDir = path.join(__dirname, '..', 'published-posts')
  if (!fs.existsSync(publishedPostsDir)) {
    fs.mkdirSync(publishedPostsDir, { recursive: true })
  }

  const metadata = {
    id: article.id,
    handle: article.handle,
    title: article.title,
    tags: article.tags,
    url: article.url,
    blogTitle: article.blog.title
  }

  const filePath = path.join(publishedPostsDir, `${article.handle}.json`)
  fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2))
  console.log(`Saved JSON metadata for "${article.title}" to ${filePath}`)
}

fetchBlogArticles()
