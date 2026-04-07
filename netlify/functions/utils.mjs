// Shared utilities for blog API functions

const GITHUB_REPO = "Victoric3/eulaiq-blog";
const CONTENT_PATH = "content/posts";
const GITHUB_API = "https://api.github.com";

/**
 * Validate the Authorization header against BLOG_API_KEY
 */
export function authenticate(event) {
  const apiKey = process.env.BLOG_API_KEY;
  if (!apiKey) {
    return { ok: false, status: 500, message: "BLOG_API_KEY not configured" };
  }

  const authHeader = event.headers?.authorization || event.headers?.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");

  if (!token || token !== apiKey) {
    return { ok: false, status: 401, message: "Unauthorized" };
  }

  return { ok: true };
}

/**
 * Build standard JSON response
 */
export function respond(statusCode, body) {
  return {
    statusCode,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  };
}

/**
 * Handle CORS preflight
 */
export function handleCors(event) {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
      body: "",
    };
  }
  return null;
}

/**
 * Convert a title string to a URL-friendly slug
 */
export function slugify(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")   // remove non-word chars (except spaces and hyphens)
    .replace(/\s+/g, "-")        // replace spaces with hyphens
    .replace(/-+/g, "-")         // collapse multiple hyphens
    .replace(/^-|-$/g, "");      // trim leading/trailing hyphens
}

/**
 * Build YAML frontmatter string from an object
 */
export function buildFrontmatter(meta) {
  const lines = ["---"];

  if (meta.title) lines.push(`title: "${meta.title.replace(/"/g, '\\"')}"`);
  if (meta.date) lines.push(`date: ${meta.date}`);
  if (meta.draft !== undefined) lines.push(`draft: ${meta.draft}`);
  if (meta.description) lines.push(`description: "${meta.description.replace(/"/g, '\\"')}"`);
  if (meta.author) lines.push(`author: "${meta.author.replace(/"/g, '\\"')}"`);
  if (meta.image) lines.push(`image: ${meta.image}`);
  if (meta.canonical) lines.push(`canonical: "${meta.canonical}"`);

  if (meta.keywords && meta.keywords.length > 0) {
    lines.push(`keywords: [${meta.keywords.map((k) => `"${k}"`).join(", ")}]`);
  }
  if (meta.tags && meta.tags.length > 0) {
    lines.push(`tags: [${meta.tags.map((t) => `"${t}"`).join(", ")}]`);
  }
  if (meta.categories && meta.categories.length > 0) {
    lines.push(`categories: [${meta.categories.map((c) => `"${c}"`).join(", ")}]`);
  }

  lines.push("---");
  return lines.join("\n");
}

/**
 * Parse YAML frontmatter and body from a markdown string
 */
export function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) return { meta: {}, body: raw };

  const yamlBlock = match[1];
  const body = match[2];
  const meta = {};

  for (const line of yamlBlock.split("\n")) {
    const colonIdx = line.indexOf(":");
    if (colonIdx === -1) continue;

    const key = line.slice(0, colonIdx).trim();
    let value = line.slice(colonIdx + 1).trim();

    // Handle arrays like [tag1, tag2]
    if (value.startsWith("[") && value.endsWith("]")) {
      value = value
        .slice(1, -1)
        .split(",")
        .map((v) => v.trim().replace(/^["']|["']$/g, ""))
        .filter(Boolean);
    } else {
      // Remove surrounding quotes
      value = value.replace(/^["']|["']$/g, "");
    }

    meta[key] = value;
  }

  return { meta, body };
}

/**
 * GitHub API helper: fetch a file from the repo
 */
export async function githubGetFile(filePath) {
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub GET failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * GitHub API helper: create or update a file in the repo
 */
export async function githubPutFile(filePath, content, message, sha = null) {
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`;

  const body = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
  };
  if (sha) body.sha = sha;

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub PUT failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * GitHub API helper: delete a file from the repo
 */
export async function githubDeleteFile(filePath, sha, message) {
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${filePath}`;

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, sha }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub DELETE failed (${res.status}): ${err}`);
  }

  return res.json();
}

/**
 * GitHub API helper: list files in a directory
 */
export async function githubListDir(dirPath) {
  const token = process.env.GITHUB_TOKEN;
  const url = `${GITHUB_API}/repos/${GITHUB_REPO}/contents/${dirPath}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `token ${token}`,
      Accept: "application/vnd.github.v3+json",
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub LIST failed (${res.status}): ${err}`);
  }

  return res.json();
}
