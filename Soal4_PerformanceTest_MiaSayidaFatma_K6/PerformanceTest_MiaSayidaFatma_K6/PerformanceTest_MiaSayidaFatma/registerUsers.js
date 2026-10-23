
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const baseUrl = process.env.API_BASE_URL;
const targetCount = Number(process.env.ACCOUNT_COUNT || 1);
const csvPath = path.join(__dirname, 'data', 'users.csv');

if (!baseUrl || !/^https?:\/\//.test(baseUrl)) {
    console.error('API_BASE_URL belum valid.');
    process.exit(1);
}

if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > 100) {
    console.error('ACCOUNT_COUNT harus antara 1 dan 100.');
    process.exit(1);
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

function getExistingUsers() {
    if (!fs.existsSync(csvPath)) return [];

    const lines = fs.readFileSync(csvPath, 'utf8')
        .replace(/^\uFEFF/, '')
        .split(/\r?\n/)
        .filter(line => line.trim());

    if (lines.length === 0) return [];

    if (lines[0].trim() !== 'username,password,userId') {
        throw new Error('Header CSV tidak sesuai.');
    }

    return lines.slice(1).map(line => {
        const [username, password, userId] = line.split(',');
        if (!username || !password || !userId) {
            throw new Error('Ada baris CSV yang tidak lengkap.');
        }
        return { username, password, userId };
    });
}

async function registerUser() {
    const username =
        `qa_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

    const password =
        `Qa!${crypto.randomBytes(12).toString('hex')}A9`;

    const response = await fetch(
        new URL('/Account/v1/User', baseUrl),
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userName: username,
                password
            }),
            signal: AbortSignal.timeout(15000)
        }
    );

    const raw = await response.text();

    let data;
    try {
        data = JSON.parse(raw);
    } catch {
        throw new Error(
            `HTTP ${response.status}: response bukan JSON`
        );
    }

    const userId = data.userID || data.userId;

    if (!response.ok || !userId) {
        throw new Error(
            `HTTP ${response.status}: ${data.message || 'userId tidak tersedia'}`
        );
    }

    return { username, password, userId };
}

async function main() {
    fs.mkdirSync(path.dirname(csvPath), { recursive: true });

    const users = getExistingUsers();

    if (!fs.existsSync(csvPath) || fs.statSync(csvPath).size === 0) {
        fs.writeFileSync(csvPath, 'username,password,userId\n');
    }

    const uniqueUsers = new Set(users.map(user => user.username));

    console.log(`Akun tersimpan: ${users.length}`);
    console.log(`Target akun: ${targetCount}`);

    if (uniqueUsers.size !== users.length) {
        throw new Error('Terdapat username duplikat dalam CSV.');
    }

    let created = 0;

    while (uniqueUsers.size < targetCount) {
        try {
            const user = await registerUser();

            if (uniqueUsers.has(user.username)) {
                continue;
            }

            fs.appendFileSync(
                csvPath,
                `${user.username},${user.password},${user.userId}\n`
            );

            uniqueUsers.add(user.username);
            created++;

            console.log(
                `Berhasil: ${uniqueUsers.size}/${targetCount} akun`
            );

            await sleep(1500);
        } catch (error) {
            console.error(`Registrasi dihentikan: ${error.message}`);
            process.exitCode = 1;
            break;
        }
    }

    console.log(`Akun baru dibuat: ${created}`);
    console.log(`Total akun tersimpan: ${uniqueUsers.size}`);
}

main().catch(error => {
    console.error(error.message);
    process.exitCode = 1;
});