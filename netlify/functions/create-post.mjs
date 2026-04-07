import {
  authenticate,
  respond,
  handleCors,
  slugify,
  buildFrontmatter,
  githubGetFile,
  githubPutFile,
} from "./utils.mjs";

export const handler = async (event) => {
  // Handle CORS preflight
  const cors = handleCors(event);
  if (cors) return cors;

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return respond(405, { error: "Method not allowed. Use POST." });
  }

  // Authenticate
  const auth = authenticate(event);
  if (!auth.ok) return respond(auth.status, { error: auth.message });

  // Parse body
  let data;
  try {
    data = JSON.parse(event.body);
  } catch {
    return respond(400, { error: "Invalid JSON body" });
  }

  // Validate required fields
  const { title, content } = data;
  if (!title || !content) {
    return respond(400, { error: "Missing required fields: title, content" });
  }

  // Build slug and file path
  const slug = slugify(title);
  const filePath = `content/posts/${slug}.md`;

  try {
    // Check if post already exists
    const existing = await githubGetFile(filePath);
    if (existing) {
      return respond(409, {
        error: `Post with slug "${slug}" already exists. Use edit-post to update it.`,
      });
    }

    // Build frontmatter
    const meta = {
      title,
      date: data.date || new Date().toISOString(),
      draft: data.draft !== undefined ? data.draft : false,
      description: data.description || "",
      keywords: data.keywords || [],
      author: data.author || "Alpha3 Technologies",
      tags: data.tags || [],
      categories: data.categories || [],
      image: data.image || "",
      canonical: data.canonical || "",
    };

    const frontmatter = buildFrontmatter(meta);
    const fileContent = `${frontmatter}\n${content}\n`;

    // Commit to GitHub
    const result = await githubPutFile(
      filePath,
      fileContent,
      `Add post: ${title}`
    );

    return respond(201, {
      message: "Post created successfully",
      slug,
      path: filePath,
      commitSha: result.commit?.sha,
      url: `https://blog.eulaiq.com/posts/${slug}/`,
    });
  } catch (err) {
    console.error("create-post error:", err);
    return respond(500, { error: "Failed to create post", details: err.message });
  }
};
