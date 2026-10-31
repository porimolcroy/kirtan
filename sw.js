// ক্যাশের ভার্সন: সাইটে বড় পরিবর্তন করলে এই সংখ্যা বাড়িয়ে দিন (v3, v4 ...)
const CACHE = 'site-cache-v2';
const FILES = ['./', './index.html'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      // পুরনো সব ক্যাশ (যেমন 'kirtan-store') মুছে ফেলা হবে
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// আগে নেটওয়ার্ক থেকে নতুন ফাইল আনার চেষ্টা, ইন্টারনেট না থাকলে ক্যাশ থেকে দেখাবে
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request, { cache: 'no-cache' })
      .then((res) => {
        if (res && res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
        }
        return res;
      })
      .catch(() => caches.match(e.request).then((r) => r || caches.match('./index.html')))
  );
});
