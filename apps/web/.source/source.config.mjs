// source.config.ts
import { z } from "zod";
import { defineConfig, defineDocs, frontmatterSchema } from "fumadocs-mdx/config";
var docsFrontmatterSchema = frontmatterSchema.extend({
  seoTitle: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional()
});
var docs = defineDocs({
  dir: "content/docs",
  docs: {
    schema: docsFrontmatterSchema
  }
});
var source_config_default = defineConfig();
export {
  source_config_default as default,
  docs
};
