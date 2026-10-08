import Fastify from 'fastify';
import cors from '@fastify/cors';
import { decryptAes, decryptOtp, encryptAes, encryptOtp } from './crypto.js';

const app = Fastify({ logger: true, bodyLimit: 1_000_000 });
await app.register(cors, { origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000' });

app.get('/health', async () => ({ status: 'ok', name: 'Cipher Studio API' }));

app.post('/api/crypto/encrypt', async (request, reply) => {
  const body = request.body as { algorithm?: string; text?: string; password?: string };
  if (typeof body?.text !== 'string' || !body.text) return reply.code(400).send({ error: 'Enter text to encrypt.' });
  try {
    if (body.algorithm === 'aes') return { result: await encryptAes(body.text, body.password ?? '') };
    if (body.algorithm === 'otp') return { ...encryptOtp(body.text) };
    return reply.code(400).send({ error: 'Choose AES or One-Time Pad.' });
  } catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : 'Encryption failed.' }); }
});

app.post('/api/crypto/decrypt', async (request, reply) => {
  const body = request.body as { algorithm?: string; text?: string; password?: string; oneTimePad?: string };
  if (typeof body?.text !== 'string' || !body.text) return reply.code(400).send({ error: 'Enter an encrypted message to decrypt.' });
  try {
    if (body.algorithm === 'aes') return { result: await decryptAes(body.text, body.password ?? '') };
    if (body.algorithm === 'otp') return { result: decryptOtp(body.text, body.oneTimePad ?? '') };
    return reply.code(400).send({ error: 'Choose AES or One-Time Pad.' });
  } catch (error) { return reply.code(400).send({ error: error instanceof Error ? error.message : 'Decryption failed.' }); }
});

const port = Number(process.env.API_PORT ?? 4000);
try { await app.listen({ port, host: '0.0.0.0' }); }
catch (error) { app.log.error(error); process.exit(1); }
