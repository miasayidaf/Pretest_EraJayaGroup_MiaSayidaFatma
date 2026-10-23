import http from 'k6/http';
import { check } from 'k6';

const username = __ENV.USERNAME;
const password = __ENV.PASSWORD;

export default function () {
    if (!username || !password) {
        throw new Error('USERNAME dan PASSWORD wajib diisi');
    }

    const response = http.post(
        'https://demoqa.com/Account/v1/GenerateToken',
        JSON.stringify({
            userName: username,
            password: password
        }),
        {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        }
    );

    console.log('HTTP Status:', response.status);
    console.log('Body Length:', response.body?.length ?? 0);

    let body = {};

    try {
        body = response.json();
    } catch (error) {
        console.log('Response bukan JSON valid');
    }

    console.log('Token Exists:', Boolean(body.token));
    console.log('Status:', body.status);
    console.log('Result:', body.result);

    check(response, {
        'GenerateToken HTTP 200': (r) => r.status === 200,
        'Token berhasil dibuat': () => Boolean(body.token),
        'Authorization success': () => body.status === 'Success'
    });
}