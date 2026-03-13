import express from "express";
import path from "node:path";
import { adminDirectory, contentDirectory, projectRoot } from "../core/paths.js";
import { attachSessionContext } from "../auth/session.js";
import {
  LEGACY_ADMIN_REDIRECTS,
  LEGACY_PUBLIC_REDIRECTS,
  buildPathWithQuery,
} from "../../src/core/config/route-registry.js";
import accessRouter from "./routes/access-routes.js";
import authRouter from "./routes/auth-routes.js";
import booksRouter from "./routes/books-routes.js";
import chaptersRouter from "./routes/chapters-routes.js";
import explanationsRouter from "./routes/explanations-routes.js";
import versesRouter from "./routes/verses-routes.js";
import sectionsRouter from "./routes/sections-routes.js";

function registerRedirects(app, redirects) {
  redirects.forEach((entry) => {
    app.get(entry.from, (req, res) => {
      const query = {
        ...req.query,
        ...(entry.query || {}),
      };

      res.redirect(302, buildPathWithQuery(entry.to, query));
    });
  });
}

export function createApp() {
  const app = express();

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (origin && (origin === "null" || origin.includes("localhost") || origin.includes("127.0.0.1"))) {
      res.header("Access-Control-Allow-Origin", origin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Vary", "Origin");
    }

    res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  app.use(express.json());
  app.use(attachSessionContext);

  app.get(["/", "/index.html"], (_req, res) => {
    res.sendFile(path.join(projectRoot, "index.html"));
  });

  // Shared public/admin pages now have real entry files, so only explicit legacy aliases redirect here.
  app.get(/^\/admin$/, (req, res) => {
    res.redirect(302, buildPathWithQuery("/admin/", req.query));
  });

  registerRedirects(app, LEGACY_PUBLIC_REDIRECTS);
  registerRedirects(app, LEGACY_ADMIN_REDIRECTS);

  app.use("/assets", express.static(path.join(projectRoot, "assets")));
  app.use("/content", express.static(contentDirectory));
  app.use("/src", express.static(path.join(projectRoot, "src")));
  app.use("/books", express.static(path.join(projectRoot, "books")));
  app.use("/chapters", express.static(path.join(projectRoot, "chapters")));
  app.use("/verses", express.static(path.join(projectRoot, "verses")));
  app.use("/characters", express.static(path.join(projectRoot, "characters")));
  app.use("/topics", express.static(path.join(projectRoot, "topics")));
  app.use("/places", express.static(path.join(projectRoot, "places")));
  app.use("/profile", express.static(path.join(projectRoot, "profile")));
  app.use("/explanations", express.static(path.join(projectRoot, "explanations")));
  app.use("/admin", express.static(adminDirectory));

  app.get("/api/health", (_req, res) => {
    res.json({ success: true, data: { status: "ok" } });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/admin", accessRouter);
  app.use("/api/books", booksRouter);
  app.use("/api/chapters", chaptersRouter);
  app.use("/api/verses", versesRouter);
  app.use("/api", sectionsRouter);
  app.use("/api", explanationsRouter);

  app.use("/api/*rest", (_req, res) => {
    res.status(404).json({
      success: false,
      error: "API route not found"
    });
  });

  app.use((error, _req, res, _next) => {
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  });

  return app;
}
