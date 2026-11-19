# Origin of this vendored classifier

Source package: `@forgemeshlabs/pay-per-crawl-core@0.1.3` (MIT).

- npm tarball: `https://registry.npmjs.org/@forgemeshlabs/pay-per-crawl-core/-/pay-per-crawl-core-0.1.3.tgz`
- Integrity (matches the PR #40 lockfile pin before these packages were removed): `sha512-TgsIXT5HbhsHcCgxWUkTvbkJx79MIUv/hzcJdvHgju9SBAhjO+i4JNcE4qlXmafO1E2WnMfc65HXjl1xya3idA==`
- Tarball shasum: `99d2512624ca38d36f46768f23dadf3ae7efce2b`
- GitHub tag: `v0.1.3`
- Git commit: `d81ad05dfe6c149a52bdf16f2d50b60a655a7858`
- Upstream repo: `https://github.com/forgemeshlabs/pay-per-crawl-js` (`packages/core`)

`npm pack @forgemeshlabs/pay-per-crawl-core@0.1.3` was compared against the lockfile integrity hash above before these files were copied. The published tarball is byte-identical to that pin and to git tag `v0.1.3`.

## What was copied

- `catalog.js` — exact copy of upstream `src/catalog.js` (sha256 `a3c64994dfdd680692c562873c2a50150187aefdc9fb43022a0ec4bef76717eb`).
- `LICENSE` — exact copy of the package MIT license.
- `classify.js` — based on upstream `src/classify.js` (sha256 `59a6c118366f3622dce7e30ab2428a01b4ebf3cb5014284acdbbd511ad7b94ed`). The unused rDNS branch (`verifyRdns`, and the `entry.verify && ip` path inside `classify`) was dropped so this directory does not import `resolver.js` or `util.js`. Those upstream files include DNS-over-HTTPS (`cloudflare-dns.com`) and `@noble/hashes`. `mergeCatalog` (Pro intel-feed merge) was also omitted. With an empty IP, which is the only way `lib/crawler-watch.ts` calls `classify`, upstream never entered that branch, so results are unchanged.

## What was not vendored

Payment settlement (`src/x402.js`, `src/gate.js`), discovery handlers, Pro telemetry (`src/pro.js`, `https://proxy.forgemesh.io`), DNS resolvers (`src/resolver.js`, `src/node-dns.js`), stores, and config parsing. `@noble/hashes` is not a dependency of this tree.

Do not loosen this pin or replace these files with a later package version without a fresh security review.
