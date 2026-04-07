import {
  authenticate,
  respond,
  handleCors,
  parseFrontmatter,
  buildFrontmatter,
  githubGetFile,
  githubPutFile,
} from "./utils.mjs";

export const handler = async (event) => {
  // Handle CORS preflight
  const cors = handleCors(event);
  if (cors) return cors;

  // Only allow PUT
  if (event.httpMethod !== "PUT") {
    return respond(405, { error: "Method not allowed. Use PUT." });
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

  // Validate required field
  const { slug } = data;
  if (!slug) {
    return respond(400, { error: "Missing required field: slug" });
  }

  const filePath = `content/posts/${slug}.md`;

  try {
    // Fetch existing file
    const existing = await githubGetFile(filePath);
    if (!existing) {
      return respond(404, { error: `Post with slug "${slug}" not found` });
    }

    // Decode existing content (GitHub returns base64)
    const rawContent = Buffer.from(existing.content, "base64").toString("utf-8");
    const { meta: existingMeta, body: existingBody } = parseFrontmatter(rawContent);

    // Merge updates — only override fields that are explicitly provided
    const updatedMeta = { ...existingMeta };

    if (data.title !== undefined) updatedMeta.title = data.title;
    if (data.date !== undefined) updatedMeta.date = data.date;
    if (data.draft !== undefined) updatedMeta.draft = data.draft;
    if (data.description !== undefined) updatedMeta.description = data.description;
    if (data.author !== undefined) updatedMeta.author = data.author;
    if (data.tags !== undefined) updatedMeta.tags = data.tags;
    if (data.categories !== undefined) updatedMeta.categories = data.categories;
    if (data.keywords !== undefined) updatedMeta.keywords = data.keywords;
    if (data.image !== undefined) updatedMeta.image = data.image;
    if (data.canonical !== undefined) updatedMeta.canonical = data.canonical;

    const updatedBody = data.content !== undefined ? data.content : existingBody;

    // Rebuild file
    const frontmatter = buildFrontmatter(updatedMeta);
    const fileContent = `${frontmatter}\n${updatedBody}`;

    // Commit to GitHub (must pass existing SHA for update)
    const result = await githubPutFile(
      filePath,
      fileContent,
      `Update post: ${updatedMeta.title || slug}`,
      existing.sha
    );

    return respond(200, {
      message: "Post updated successfully",
      slug,
      path: filePath,
      commitSha: result.commit?.sha,
      url: `https://blog.eulaiq.com/posts/${slug}/`,
    });
  } catch (err) {
    console.error("edit-post error:", err);
    return respond(500, { error: "Failed to update post", details: err.message });
  }
};
