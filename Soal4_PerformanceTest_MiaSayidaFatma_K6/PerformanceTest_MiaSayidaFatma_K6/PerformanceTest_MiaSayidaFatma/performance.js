import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { SharedArray } from 'k6/data';
import exec from 'k6/execution';

// Pilih skenario melalui: k6 run -e SCENARIO=baseline performance.js
const BASE_URL = __ENV.BASE_URL || 'https://demoqa.com';
const SCENARIO = __ENV.SCENARIO || 'baseline';
const JSON_HEADERS = { 'Content-Type': 'application/json', Accept: 'application/json' };

// Satu akun berbeda untuk setiap virtual user (VU).
const accounts = new SharedArray('accounts', () =>
  open('./data/users.csv').trim().split(/\r?\n/).slice(1)
    .filter(line => line.trim() && !line.startsWith('#'))
    .map(line => {
      const [username, password, userId = ''] = line.split(',');
      return { username: username?.trim(), password: password?.trim(), userId: userId.trim() };
    })
);

// ISBN cadangan jika daftar buku API kosong. Header CSV dilewati.
const fallbackBooks = new SharedArray('fallback ISBN', () =>
  open('./data/books.csv').trim().split(/\r?\n/).slice(1)
    .map(line => line.trim()).filter(Boolean)
);

const plans = {
  baseline: { 
    executor: 'per-vu-iterations', 
    vus: 1, 
    iterations: 5, 
    maxDuration: '5m' 
  },

  load10: { 
    executor: 'ramping-vus', 
    stages: [
    { duration: '30s', target: 10 }, { duration: '2m', target: 10 }, { duration: '30s', target: 0 }
    ] 
  },

  load50: { 
    executor: 'ramping-vus', 
    stages: [
    { duration: '2m', target: 50 }, { duration: '3m', target: 50 }, { duration: '1m', target: 0 }
    ] 
  },

  load100: { 
    executor: 'ramping-vus', 
    stages: [
    { duration: '3m', target: 100 }, { duration: '5m', target: 100 }, { duration: '1m', target: 0 }
    ] 
  },

  stress: {
    executor: 'ramping-vus',
    startVUs: 0,
    stages: [
        { duration: '1m', target: 100 },
        { duration: '2m', target: 100 },
        { duration: '1m', target: 0 }
    ],
    gracefulRampDown: '30s'
  },

  soak: { 
    executor: 'constant-vus', 
    vus: 20, 
    duration: __ENV.SOAK_DURATION || '30m' }
  };

if (!plans[SCENARIO]) throw new Error(`Skenario tidak dikenal: ${SCENARIO}`);
if (SCENARIO !== 'baseline' && __ENV.AUTHORIZED_LOAD !== 'true') {
  throw new Error('Load/stress/soak hanya untuk lingkungan berizin. Set AUTHORIZED_LOAD=true setelah mendapat izin.');
}

export const options = {
  scenarios: { [SCENARIO]: plans[SCENARIO] },
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95']
  }
};

function parseJson(response) {
  if (!response.body) return null;
  try { return response.json(); } catch (_) { return null; }
}

function thinkTime() { sleep(1 + Math.random() * 2); }

export default function () {
  const vu = exec.vu.idInTest;
  const account = accounts[vu - 1];
  if (!account || !account.username || !account.password) {
    console.error(`VU ${vu}: akun tidak tersedia/invalid di data/users.csv`);
    return;
  }

  let userId = '';
  let token = '';
  let isbn = '';

  // 01 LOGIN: harus mengembalikan userId dan isActive.
  group('01 Login', () => {
    const response = http.post(`${BASE_URL}/Account/v1/Login`, JSON.stringify({
        userName: account.username,
        password: account.password
    }), {
        headers: JSON_HEADERS,
        tags: { step: 'login' }
    });

    const body = parseJson(response);
    userId = body?.userId || '';

    check(response, {
        'login HTTP 200': r => r.status === 200,
        'login userId dari response': () => Boolean(userId),
        'login token tersedia': () => Boolean(body?.token)
    });

    // Menampilkan VU dan username jika token tidak tersedia
    if (!body?.token) {
        console.error(
            `LOGIN TOKEN FAILED | VU=${vu} | username=${account.username} | HTTP=${response.status} | userId=${userId ? 'ADA' : 'KOSONG'}`
        );
    }

    if (!body) {
        console.error(
            `VU ${vu}: Login HTTP ${response.status}, response kosong/bukan JSON.`
        );
    }
});

if (!userId && account.userId) {
    userId = account.userId;
}

if (!userId) {
    console.error(`VU ${vu}: userId tidak tersedia di Login maupun CSV`);
    return;
}
  thinkTime();

  // 02 GENERATE TOKEN
  group('02 Generate Token', () => {
    const response = http.post(`${BASE_URL}/Account/v1/GenerateToken`, JSON.stringify({
      userName: account.username, password: account.password
    }), { headers: JSON_HEADERS, tags: { step: 'token' } });
    const body = parseJson(response);
    token = body?.token || '';
    check(response, {
      'token HTTP 200': r => r.status === 200,
      'token tersedia': () => Boolean(token),
      'token status Success': () => body?.status === 'Success'
    });
    if (!token) console.error(`VU ${vu}: GenerateToken gagal, HTTP ${response.status}`);
  });
  if (!token) return;
  thinkTime();

  const authHeaders = { ...JSON_HEADERS, Authorization: `Bearer ${token}` };

  // 03 BROWSE BOOKS: pilih ISBN dari response API.
  group('03 Browse Books', () => {
    const response = http.get(`${BASE_URL}/BookStore/v1/Books`, {
      headers: authHeaders, tags: { step: 'browse' }
    });
    const body = parseJson(response);
    const items = Array.isArray(body?.books) ? body.books.filter(b => b.isbn) : [];
    check(response, {
      'browse HTTP 200': r => r.status === 200,
      'browse punya ISBN': () => items.length > 0
    });
    if (items.length) isbn = items[(vu + exec.scenario.iterationInTest) % items.length].isbn;
    else if (__ENV.ALLOW_FALLBACK_ISBN === 'true' && fallbackBooks.length)
        isbn = fallbackBooks[(vu - 1) % fallbackBooks.length];

    console.log(
        `BROWSE | VU=${vu} | ISBN=${isbn || 'KOSONG'} | Source=${items.length ? 'API' : isbn ? 'CSV' : 'NONE'}`
    );

    });
    if (!isbn) return;
    thinkTime();

  // 04 SELECT BOOK
  let selected = false;
  group('04 Select Book', () => {
    const response = http.get(`${BASE_URL}/BookStore/v1/Book?ISBN=${encodeURIComponent(isbn)}`, {
      headers: authHeaders, tags: { step: 'select' }
    });
    const body = parseJson(response);
    selected = response.status === 200 && body?.isbn === isbn;
    check(response, {
      'select HTTP 200': r => r.status === 200,
      'select ISBN sesuai': () => body?.isbn === isbn
    });
  });
  if (!selected) return;
  thinkTime();

  // 05 CLEANUP: agar ISBN yang sama bisa ditambahkan di iterasi berikutnya.
  // PERHATIAN: menghapus SELURUH buku di koleksi akun uji. Jangan gunakan akun pribadi.
  let cleaned = false;
  group('05 Cleanup Collection', () => {
    const response = http.del(
      `${BASE_URL}/BookStore/v1/Books?UserId=${encodeURIComponent(userId)}`,
      null, { headers: authHeaders, tags: { step: 'cleanup' } }
    );
    cleaned = response.status === 204;
    check(response, { 'cleanup HTTP 204': r => r.status === 204 });
  });
  if (!cleaned) return;
  thinkTime();

  // 06 ADD BOOK
  group('06 Add Book', () => {
    const response = http.post(`${BASE_URL}/BookStore/v1/Books`, JSON.stringify({
      userId, collectionOfIsbns: [{ isbn }]
    }), { headers: authHeaders, tags: { step: 'add' } });
    const body = parseJson(response);
    check(response, {
      'add HTTP 201': r => r.status === 201,
      'add ISBN sesuai': () => Array.isArray(body?.books) && body.books.some(b => b.isbn === isbn)
    });
    if (response.status !== 201) console.error(`VU ${vu}: Add Book gagal HTTP ${response.status}`);
  });
  thinkTime();
}
