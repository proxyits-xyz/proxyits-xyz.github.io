var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json());
  function slugify(text) {
    return text.toString().toLowerCase().trim().replace(/\s+/g, "-").replace(/[^\w\-]+/g, "").replace(/\-\-+/g, "-");
  }
  function formatIdnDate(d) {
    const months = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }
  app.get("/api/download/zip", (req, res) => {
    const filePath = import_path.default.join(process.cwd(), "project.zip");
    if (import_fs.default.existsSync(filePath)) {
      res.download(filePath, "project.zip");
    } else {
      res.status(404).send("File project.zip tidak ditemukan. Silakan lakukan 'npm run build' terlebih dahulu untuk generate.");
    }
  });
  app.get("/api/download/posts", (req, res) => {
    const filePath = import_path.default.join(process.cwd(), "posts.json");
    const publicPath = import_path.default.join(process.cwd(), "public", "posts.json");
    if (import_fs.default.existsSync(filePath)) {
      res.download(filePath, "posts.json");
    } else if (import_fs.default.existsSync(publicPath)) {
      res.download(publicPath, "posts.json");
    } else {
      res.status(404).send("File posts.json belum tersedia.");
    }
  });
  app.post("/api/posts", (req, res) => {
    try {
      const { title, excerpt, content, category, readTime, image } = req.body;
      if (!title || !excerpt || !content || !category || !readTime) {
        return res.status(400).json({
          error: "Field 'title', 'excerpt', 'content', 'category', dan 'readTime' wajib diisi!"
        });
      }
      const id = slugify(title) || `post-${Date.now()}`;
      const date = formatIdnDate(/* @__PURE__ */ new Date());
      const newPost = {
        id,
        title,
        excerpt,
        content,
        category,
        date,
        readTime,
        image: image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
      };
      const publicPath = import_path.default.join(process.cwd(), "public", "posts.json");
      const rootPath = import_path.default.join(process.cwd(), "posts.json");
      let posts = [];
      if (import_fs.default.existsSync(publicPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(publicPath, "utf-8"));
        } catch (e) {
          console.error("Error reading public/posts.json, resetting array");
        }
      } else if (import_fs.default.existsSync(rootPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(rootPath, "utf-8"));
        } catch (e) {
          console.error("Error reading posts.json, resetting array");
        }
      }
      posts.unshift(newPost);
      import_fs.default.writeFileSync(publicPath, JSON.stringify(posts, null, 2), "utf-8");
      import_fs.default.writeFileSync(rootPath, JSON.stringify(posts, null, 2), "utf-8");
      console.log(`Successfully added new post: ${title} (${id})`);
      return res.json({ success: true, post: newPost });
    } catch (error) {
      console.error("Error saving post:", error);
      return res.status(500).json({
        error: "Terjadi kesalahan internal ketika menyimpan artikel baru: " + error.message
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode...");
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
