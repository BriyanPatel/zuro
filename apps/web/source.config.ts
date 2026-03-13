import { z } from 'zod';
import { defineConfig, defineDocs, frontmatterSchema } from 'fumadocs-mdx/config';

const docsFrontmatterSchema = frontmatterSchema.extend({
  seoTitle: z.string().optional(),
  publishedAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: docsFrontmatterSchema,
  },
});

export default defineConfig();
