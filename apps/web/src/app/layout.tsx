import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cipher Studio — Encrypt & Decrypt',
  description: 'Encrypt and decrypt text with AES or a true one-time pad.'
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
