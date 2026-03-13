import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

const handlers = createFromSource(source);

export async function GET(request: Request) {
  const response = await handlers.GET(request);
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  return response;
}
