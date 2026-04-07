import {
  authenticate,
  respond,
  handleCors,
  githubGetFile,
  githubDeleteFile,
} from "./utils.mjs";

export const handler = async (event) => {
  // Handle CORS preflight
  const cors = handleCors(event);
  if (cors) return cors;

  // Only allow DELETE
  if (event.httpMethod !== "DELETE") {
    return respond(405, { error: "Method not allowed. Use DELETE." });
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
    // Fetch existing file to get SHA
    const existing = await githubGetFile(filePath);
    if (!existing) {
      return respond(404, { error: `Post with slug "${slug}" not found` });
    }

    // Delete from GitHub
    await githubDeleteFile(filePath, existing.sha, `Delete post: ${slug}`);

    return respond(200, {
      message: "Post deleted successfully",
      slug,
      path: filePath,
    });
  } catch (err) {
    console.error("delete-post error:", err);
    return respond(500, { error: "Failed to delete post", details: err.message });
  }
};
