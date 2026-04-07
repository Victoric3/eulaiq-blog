# EulaIQ Blog API Documentation

REST API for managing blog posts via `curl`. Powered by Netlify Functions + GitHub API.

**Base URL:** `https://blog.eulaiq.com/.netlify/functions`  
**Auth:** All requests require `Authorization: Bearer $BLOG_API_KEY`

Set your key locally for easy use:
```bash
export BLOG_API_KEY="your-key-from-netlify-dashboard"
```

---

## 1. List All Posts

```bash
curl -s https://blog.eulaiq.com/.netlify/functions/list-posts \
  -H "Authorization: Bearer $BLOG_API_KEY"
```

**Response (200):**
```json
{
  "count": 5,
  "posts": [
    {
      "slug": "what-is-eulaiq-and-why-everyones-talking-about-it",
      "title": "What Is EulaIQ and Why Everyone's Talking About It",
      "date": "2025-09-20T13:05:00.000+01:00",
      "draft": false,
      "tags": [],
      "description": ""
    }
  ]
}
```

---

## 2. Create a Post

```bash
curl -s -X POST https://blog.eulaiq.com/.netlify/functions/create-post \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "My New Post Title",
    "content": "# Welcome\n\nMarkdown body of the post.\n\n## Section Two\n\nMore content here.",
    "description": "SEO description",
    "tags": ["ai", "education"],
    "categories": ["product"],
    "image": "/images/uploads/hero.png",
    "draft": false
  }'
```

| Field | Required | Default |
|-------|----------|---------|
| `title` | ✅ | — |
| `content` | ✅ | — |
| `description` | ❌ | `""` |
| `tags` | ❌ | `[]` |
| `categories` | ❌ | `[]` |
| `keywords` | ❌ | `[]` |
| `image` | ❌ | `""` |
| `author` | ❌ | `"Alpha3 Technologies"` |
| `canonical` | ❌ | `""` |
| `date` | ❌ | Current timestamp |
| `draft` | ❌ | `false` |

**Response (201):**
```json
{
  "message": "Post created successfully",
  "slug": "my-new-post-title",
  "path": "content/posts/my-new-post-title.md",
  "commitSha": "abc123...",
  "url": "https://blog.eulaiq.com/posts/my-new-post-title/"
}
```

---

## 3. Edit a Post

Only send fields you want to change. Everything else stays the same.

```bash
curl -s -X PUT https://blog.eulaiq.com/.netlify/functions/edit-post \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "slug": "my-new-post-title",
    "title": "Updated Post Title",
    "content": "# Updated\n\nNew body content.",
    "tags": ["ai", "education", "update"]
  }'
```

| Field | Required | Notes |
|-------|----------|-------|
| `slug` | ✅ | Identifies which post to edit |
| All others | ❌ | Only provided fields are updated |

> **Tip:** Use `list-posts` first to get the slug.

**Response (200):**
```json
{
  "message": "Post updated successfully",
  "slug": "my-new-post-title",
  "path": "content/posts/my-new-post-title.md",
  "commitSha": "def456...",
  "url": "https://blog.eulaiq.com/posts/my-new-post-title/"
}
```

---

## 4. Delete a Post

```bash
curl -s -X DELETE https://blog.eulaiq.com/.netlify/functions/delete-post \
  -H "Authorization: Bearer $BLOG_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"slug": "my-new-post-title"}'
```

**Response (200):**
```json
{
  "message": "Post deleted successfully",
  "slug": "my-new-post-title",
  "path": "content/posts/my-new-post-title.md"
}
```

---

## Error Codes

| Code | Meaning |
|------|---------|
| `400` | Missing required fields or invalid JSON |
| `401` | Wrong or missing API key |
| `404` | Post slug not found (edit/delete) |
| `405` | Wrong HTTP method |
| `409` | Slug already exists (create) |
| `500` | Server error — check [function logs](https://app.netlify.com/projects/eulaiq-blog/logs/functions) |

---

## How It Works

1. You send a `curl` request to the API
2. Netlify Function validates your key and processes the request
3. It commits/updates/deletes the markdown file via the GitHub Contents API
4. GitHub triggers a Netlify rebuild → post goes live in ~1–2 minutes

---

## Environment Variables (Netlify Dashboard)

Both are set in **Netlify Dashboard → Site Settings → Environment Variables**.

| Variable | How to get it |
|----------|---------------|
| `GITHUB_TOKEN` | Run `gh auth token` in your terminal |
| `BLOG_API_KEY` | Any secret string you choose |

To update either value:
```bash
npx netlify-cli env:set VARIABLE_NAME new-value
```

> **Note:** The GitHub OAuth token (`gho_*`) does not expire unless you revoke it or change your GitHub password.

---

## Netlify Functions Free Tier

| Resource | Limit |
|----------|-------|
| Invocations | 125,000/month |
| Runtime | 100 hours/month |
| Timeout | 10 seconds |
| Payload | 6 MB |
