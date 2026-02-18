// @ts-nocheck
import * as __fd_glob_6 from "../content/docs/validator.mdx?collection=docs"
import * as __fd_glob_5 from "../content/docs/init.mdx?collection=docs"
import * as __fd_glob_4 from "../content/docs/index.mdx?collection=docs"
import * as __fd_glob_3 from "../content/docs/error-handler.mdx?collection=docs"
import * as __fd_glob_2 from "../content/docs/database.mdx?collection=docs"
import * as __fd_glob_1 from "../content/docs/auth.mdx?collection=docs"
import { default as __fd_glob_0 } from "../content/docs/meta.json?collection=docs"
import { server } from 'fumadocs-mdx/runtime/server';
import type * as Config from '../source.config';

const create = server<typeof Config, import("fumadocs-mdx/runtime/types").InternalTypeConfig & {
  DocData: {
  }
}>({"doc":{"passthroughs":["extractedReferences"]}});

export const docs = await create.docs("docs", "content/docs", {"meta.json": __fd_glob_0, }, {"auth.mdx": __fd_glob_1, "database.mdx": __fd_glob_2, "error-handler.mdx": __fd_glob_3, "index.mdx": __fd_glob_4, "init.mdx": __fd_glob_5, "validator.mdx": __fd_glob_6, });