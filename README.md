# Cipher Studio

Cipher Studio is a small text encryption app with a Next.js interface and a Fastify API. It supports password-based AES-256-GCM and a true one-time pad (OTP).

## Requirements

- Node.js 20 or newer
- npm 10 or newer

## Run locally

```sh
npm install
npm run dev
```

The web app runs at <http://localhost:3000> and the API at <http://localhost:4000>. Copy `.env.example` to `.env` to customize the API port or URL.

## Encryption formats

- **AES-256-GCM:** derives a key from the password with scrypt and stores a random salt and nonce with the authenticated ciphertext. Keep the password; it cannot be recovered.
- **One-time pad:** encryption generates a cryptographically random pad matching the UTF-8 byte length of the message. Save the returned pad securely and use it exactly once. Anyone with the pad can decrypt the message. The API does not store pads.

This is an educational project. Do not send sensitive plaintext to an API you do not control.
