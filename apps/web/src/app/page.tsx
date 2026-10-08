'use client';

import { FormEvent, useState } from 'react';

type Algorithm = 'aes' | 'otp';
type ApiResponse = { result?: string; ciphertext?: string; oneTimePad?: string; error?: string };
const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function Home() {
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [algorithm, setAlgorithm] = useState<Algorithm>('aes');
  const [text, setText] = useState('');
  const [password, setPassword] = useState('');
  const [oneTimePad, setOneTimePad] = useState('');
  const [result, setResult] = useState('');
  const [generatedPad, setGeneratedPad] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(''); setResult(''); setGeneratedPad(''); setCopied(false);
    try {
      const response = await fetch(`${apiUrl}/api/crypto/${mode}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ algorithm, text, password, oneTimePad })
      });
      const data = await response.json() as ApiResponse;
      if (!response.ok) throw new Error(data.error ?? 'Request failed.');
      if (mode === 'encrypt' && algorithm === 'otp') { setResult(data.ciphertext ?? ''); setGeneratedPad(data.oneTimePad ?? ''); }
      else setResult(data.result ?? '');
    } catch (e) { setError(e instanceof Error ? e.message : 'Could not reach the API.'); }
    finally { setBusy(false); }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value); setCopied(true); window.setTimeout(() => setCopied(false), 1500);
  }

  return <main className="shell">
    <header className="topbar"><a className="brand" href="#"><span className="brand-mark">C</span><span>Cipher<span className="brand-light"> Studio</span></span></a><span className="top-note"><i /> No messages are saved</span></header>
    <section className="intro"><div className="eyebrow"><span>✳</span> SIMPLE, SECURE TEXT ENCRYPTION</div><h1>Your words,<br /><em>under your control.</em></h1><p>Encrypt and decrypt text with industry-standard AES or a true one-time pad.</p></section>
    <section className="workspace" aria-label="Encryption tool">
      <div className="mode-switch" role="group" aria-label="Operation">
        <button className={mode === 'encrypt' ? 'active' : ''} onClick={() => setMode('encrypt')} type="button"><span>↗</span> Encrypt</button>
        <button className={mode === 'decrypt' ? 'active' : ''} onClick={() => setMode('decrypt')} type="button"><span>↙</span> Decrypt</button>
      </div>
      <form onSubmit={handleSubmit}>
        <div className="field-head"><label htmlFor="message">{mode === 'encrypt' ? 'Plaintext' : 'Encrypted message'}</label><span>{new TextEncoder().encode(text).length} bytes</span></div>
        <textarea id="message" value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'encrypt' ? 'Type or paste your message here…' : 'Paste the encrypted message here…'} required rows={5} />
        <div className="options-row">
          <div className="algorithm-select"><label htmlFor="algorithm">Algorithm</label><select id="algorithm" value={algorithm} onChange={e => setAlgorithm(e.target.value as Algorithm)}><option value="aes">AES-256-GCM</option><option value="otp">One-Time Pad</option></select></div>
          <div className="algorithm-hint">{algorithm === 'aes' ? 'Password-derived key with authenticated encryption.' : 'Cryptographically random pad, the same length as your message.'}</div>
        </div>
        {algorithm === 'aes' ? <div className="field"><label htmlFor="password">Password</label><input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter a strong password" autoComplete="off" required /></div> : mode === 'decrypt' ? <div className="field"><label htmlFor="pad">One-time pad</label><textarea id="pad" value={oneTimePad} onChange={e => setOneTimePad(e.target.value)} placeholder="Paste the one-time pad" rows={2} required /></div> : <div className="notice"><span>ⓘ</span><p>A fresh random pad will be generated. Save it securely: it is shown only once and cannot be recovered.</p></div>}
        <button className="submit" type="submit" disabled={busy}>{busy ? 'Processing…' : mode === 'encrypt' ? 'Encrypt message' : 'Decrypt message'} <span>→</span></button>
      </form>
      {error && <div className="error" role="alert">{error}</div>}
      {result && <section className="result"><div className="result-head"><div><span className="result-label">RESULT</span><h2>{mode === 'encrypt' ? 'Encrypted message' : 'Decrypted text'}</h2></div><button type="button" className="copy" onClick={() => copy(result)}>{copied ? 'Copied ✓' : 'Copy'}</button></div><textarea readOnly value={result} rows={4} />{generatedPad && <div className="pad-result"><div className="result-head"><div><span className="result-label">SAVE THIS PAD</span><h2>One-time pad</h2></div><button type="button" className="copy" onClick={() => copy(generatedPad)}>{copied ? 'Copied ✓' : 'Copy pad'}</button></div><textarea readOnly value={generatedPad} rows={3} /><p>Use this pad once to decrypt. Anyone who has it can read the message.</p></div>}</section>}
    </section>
    <footer><span>🔒 The API does not save messages or keys.</span><span>Run a trusted API before sending sensitive text.</span></footer>
  </main>;
}
