// Tells IndexNow (Bing, and through it ChatGPT search, plus Yandex, Seznam and
// Naver) which pages changed, so they are recrawled within hours.
//
//   node .github/scripts/indexnow.mjs              every URL in the live sitemap
//   node .github/scripts/indexnow.mjs <url> ...    just these
//
// Kept under .github/ so GitHub Pages does not publish it. Run by
// .github/workflows/indexnow.yml after a Pages build that changed a page.
// The key is public by design: IndexNow checks ownership by fetching
// https://justroam.nl/<key>.txt.

const HOST = 'justroam.nl'
const KEY = '3f2c970a0825d0c28bfeaa42097eccab'

let urls = process.argv.slice(2)
if (urls.length === 0) {
  const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text()
  urls = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1].trim()))]
}
urls = urls.filter(u => new URL(u).host === HOST)
if (urls.length === 0) { console.log('indexnow: nothing to submit'); process.exit(0) }

const res = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList: urls }),
})
// 200 and 202 both mean accepted; 202 while the key is still being checked.
console.log(`indexnow: ${res.status} for ${urls.length} URLs`)
if (!res.ok) { console.log(await res.text().catch(() => '')); process.exit(1) }
