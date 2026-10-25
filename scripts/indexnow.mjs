#!/usr/bin/env node
// Ping IndexNow (Bing, Yandex, Seznam, Naver; shared with other engines) with
// every URL in the live sitemap. Free, no account needed. The key is public by
// design: it must be served at https://<host>/<key>.txt.
// Usage: node scripts/indexnow.mjs [https://www.aionestop.shop]
const KEY = 'bfe34aca40654f1d9a9fbab9980bfc3b';
const site = (process.argv[2] || 'https://www.aionestop.shop').replace(/\/$/, '');
const host = new URL(site).host;

const xml = await (await fetch(`${site}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
if (urlList.length === 0) throw new Error('No URLs found in sitemap');

const keyCheck = await fetch(`${site}/${KEY}.txt`);
if (!keyCheck.ok || (await keyCheck.text()).trim() !== KEY) {
  throw new Error('Key file is not live yet; deploy first.');
}

for (let i = 0; i < urlList.length; i += 10000) {
  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key: KEY, keyLocation: `${site}/${KEY}.txt`, urlList: urlList.slice(i, i + 10000) }),
  });
  console.log(`IndexNow: ${res.status} for ${urlList.slice(i, i + 10000).length} URLs`);
}
