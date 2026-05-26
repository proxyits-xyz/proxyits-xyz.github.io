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
  app.get("/api/seo-config", (req, res) => {
    const filePath = import_path.default.join(process.cwd(), "seo-config.json");
    const publicPath = import_path.default.join(process.cwd(), "public", "seo-config.json");
    if (import_fs.default.existsSync(filePath)) {
      res.json(JSON.parse(import_fs.default.readFileSync(filePath, "utf-8")));
    } else if (import_fs.default.existsSync(publicPath)) {
      res.json(JSON.parse(import_fs.default.readFileSync(publicPath, "utf-8")));
    } else {
      res.json({});
    }
  });
  app.post("/api/seo-config", (req, res) => {
    try {
      const config = req.body;
      const filePath = import_path.default.join(process.cwd(), "seo-config.json");
      const publicPath = import_path.default.join(process.cwd(), "public", "seo-config.json");
      import_fs.default.writeFileSync(filePath, JSON.stringify(config, null, 2), "utf-8");
      if (!import_fs.default.existsSync(import_path.default.join(process.cwd(), "public"))) {
        import_fs.default.mkdirSync(import_path.default.join(process.cwd(), "public"), { recursive: true });
      }
      import_fs.default.writeFileSync(publicPath, JSON.stringify(config, null, 2), "utf-8");
      console.log("Successfully saved updated SEO configurations.");
      return res.json({ success: true });
    } catch (error) {
      console.error("Error saving SEO configuration:", error);
      return res.status(500).json({ error: error.message });
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
      let id = slugify(title) || `post-${Date.now()}`;
      const idBase = id;
      let counter = 1;
      while (posts.some((p) => p.id === id)) {
        counter++;
        id = `${idBase}-${counter}`;
      }
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
  app.put("/api/posts/:id", (req, res) => {
    try {
      const { id } = req.params;
      const { title, excerpt, content, category, readTime, image } = req.body;
      if (!title || !excerpt || !content || !category || !readTime) {
        return res.status(400).json({
          error: "Field 'title', 'excerpt', 'content', 'category', dan 'readTime' wajib diisi!"
        });
      }
      const publicPath = import_path.default.join(process.cwd(), "public", "posts.json");
      const rootPath = import_path.default.join(process.cwd(), "posts.json");
      let posts = [];
      if (import_fs.default.existsSync(publicPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(publicPath, "utf-8"));
        } catch (e) {
          console.error("Error reading public/posts.json", e);
        }
      } else if (import_fs.default.existsSync(rootPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(rootPath, "utf-8"));
        } catch (e) {
          console.error("Error reading posts.json", e);
        }
      }
      const postIndex = posts.findIndex((p) => p.id === id);
      if (postIndex === -1) {
        return res.status(404).json({ error: "Post tidak ditemukan" });
      }
      posts[postIndex] = {
        ...posts[postIndex],
        title,
        excerpt,
        content,
        category,
        readTime,
        image: image || "https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80"
      };
      import_fs.default.writeFileSync(publicPath, JSON.stringify(posts, null, 2), "utf-8");
      import_fs.default.writeFileSync(rootPath, JSON.stringify(posts, null, 2), "utf-8");
      console.log(`Successfully updated post: ${id}`);
      return res.json({ success: true, post: posts[postIndex] });
    } catch (error) {
      console.error("Error updating post:", error);
      return res.status(500).json({
        error: "Terjadi kesalahan ketika memperbarui artikel: " + error.message
      });
    }
  });
  app.delete("/api/posts/:id", (req, res) => {
    try {
      const { id } = req.params;
      const publicPath = import_path.default.join(process.cwd(), "public", "posts.json");
      const rootPath = import_path.default.join(process.cwd(), "posts.json");
      let posts = [];
      if (import_fs.default.existsSync(publicPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(publicPath, "utf-8"));
        } catch (e) {
          console.error("Error reading public/posts.json", e);
        }
      } else if (import_fs.default.existsSync(rootPath)) {
        try {
          posts = JSON.parse(import_fs.default.readFileSync(rootPath, "utf-8"));
        } catch (e) {
          console.error("Error reading posts.json", e);
        }
      }
      const filteredPosts = posts.filter((p) => p.id !== id);
      if (posts.length === filteredPosts.length) {
        return res.status(404).json({ error: "Post tidak ditemukan" });
      }
      import_fs.default.writeFileSync(publicPath, JSON.stringify(filteredPosts, null, 2), "utf-8");
      import_fs.default.writeFileSync(rootPath, JSON.stringify(filteredPosts, null, 2), "utf-8");
      console.log(`Successfully deleted post: ${id}`);
      return res.json({ success: true });
    } catch (error) {
      console.error("Error deleting post:", error);
      return res.status(500).json({
        error: "Terjadi kesalahan ketika menghapus artikel: " + error.message
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite middleware...");
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use("/img", import_express.default.static(import_path.default.join(process.cwd(), "img")));
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
