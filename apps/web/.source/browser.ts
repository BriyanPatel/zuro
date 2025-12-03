// @ts-nocheck
import { browser } from 'fumadocs-mdx/runtime/browser';
import type * as Config from '../source.config';

const create = browser<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>();
const browserCollections = {
  docs: create.doc("docs", {"core.mdx": () => import("../content/docs/core.mdx?collection=docs"), "database.mdx": () => import("../content/docs/database.mdx?collection=docs"), "index.mdx": () => import("../content/docs/index.mdx?collection=docs"), "init.mdx": () => import("../content/docs/init.mdx?collection=docs"), }),
};
export default browserCollections;