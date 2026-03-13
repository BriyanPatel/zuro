const DEFAULT_SITE_URL = 'https://zuro-cli.devbybriyan.com';

function normalizeSiteUrl(value) {
  const trimmed = (value || DEFAULT_SITE_URL).trim().replace(/\/+$/, '');

  try {
    return new URL(trimmed).toString().replace(/\/+$/, '');
  } catch {
    return DEFAULT_SITE_URL;
  }
}

async function fetchWithFallback(url) {
  const headResponse = await fetch(url, {
    method: 'HEAD',
    redirect: 'follow',
    headers: {
      'user-agent': 'zuro-sitemap-validator/1.0',
    },
  });

  if (headResponse.status === 405 || headResponse.status === 501) {
    return fetch(url, {
      method: 'GET',
      redirect: 'follow',
      headers: {
        'user-agent': 'zuro-sitemap-validator/1.0',
      },
    });
  }

  return headResponse;
}

async function main() {
  const siteUrl = normalizeSiteUrl(process.env.SITE_URL);
  const sitemapUrl = `${siteUrl}/sitemap.xml`;

  console.log(`Validating sitemap URLs from ${sitemapUrl}`);

  const sitemapResponse = await fetch(sitemapUrl, {
    redirect: 'follow',
    headers: {
      'user-agent': 'zuro-sitemap-validator/1.0',
    },
  });

  if (!sitemapResponse.ok) {
    throw new Error(`Failed to fetch sitemap (${sitemapResponse.status})`);
  }

  const xml = await sitemapResponse.text();
  const locMatches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  const urls = locMatches.map((match) => match[1]);

  if (urls.length === 0) {
    throw new Error('No <loc> URLs found in sitemap');
  }

  const failures = [];

  for (const url of urls) {
    const response = await fetchWithFallback(url);
    if (response.status !== 200) {
      failures.push({ url, status: response.status });
      console.error(`FAIL ${response.status} ${url}`);
    } else {
      console.log(`OK   200 ${url}`);
    }
  }

  if (failures.length > 0) {
    throw new Error(`Sitemap validation failed for ${failures.length} URL(s)`);
  }

  console.log(`Sitemap validation passed for ${urls.length} URL(s).`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
