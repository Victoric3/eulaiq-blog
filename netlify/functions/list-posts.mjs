import {
  authenticate,
  respond,
  handleCors,
  parseFrontmatter,
  githubListDir,
  githubGetFile,
} from "./utils.mjs";

export const handler = async (event) => {
  // Handle CORS preflight
  const cors = handleCors(event);
  if (cors) return cors;

  // Only allow GET
  if (event.httpMethod !== "GET") {
    return respond(405, { error: "Method not allowed. Use GET." });
  }

  // Authenticate
  const auth = authenticate(event);
  if (!auth.ok) return respond(auth.status, { error: auth.message });

  try {
    // List all files in content/posts/
    const files = await githubListDir("content/posts");

    // Filter to .md files only
    const mdFiles = files.filter(
      (f) => f.type === "file" && f.name.endsWith(".md")
    );

    // Fetch each file and extract frontmatter metadata
    const posts = await Promise.all(
      mdFiles.map(async (f) => {
        try {
          const file = await githubGetFile(f.path);
          const raw = Buffer.from(file.content, "base64").toString("utf-8");
          const { meta } = parseFrontmatter(raw);

          return {
            slug: f.name.replace(/\.md$/, ""),
            title: meta.title || f.name,
            date: meta.date || null,
            draft: meta.draft === "true" || meta.draft === true,
            tags: meta.tags || [],
            description: meta.description || "",
          };
        } catch {
          return {
            slug: f.name.replace(/\.md$/, ""),
            title: f.name,
            date: null,
            error: "Could not parse file",
          };
        }
      })
    );

    // Sort by date descending
    posts.sort((a, b) => {
      if (!a.date) return 1;
      if (!b.date) return -1;
      return new Date(b.date) - new Date(a.date);
    });

    return respond(200, { count: posts.length, posts });
  } catch (err) {
    console.error("list-posts error:", err);
    return respond(500, { error: "Failed to list posts", details: err.message });
  }
};
