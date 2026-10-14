// passwordSecurity.js — scrambling the password so it is never stored as typed.

// 100,000 rounds of PBKDF2 is the low end of current guidance and is chosen so that logging.
const ROUNDS = 100000

// Whether this browser can do proper cryptography.
function hasStrongCrypto() {
  return Boolean(window.crypto && window.crypto.subtle)
}

// Bytes → text, so the result can be stored as JSON.
function toHex(bytes) {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('')
}

// Text → bytes, the reverse of the above.
function fromHex(hex) {
  const bytes = new Uint8Array(hex.length / 2)

  for (let i = 0; i < bytes.length; i += 1) {
    bytes[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16)
  }

  return bytes
}

// A fresh random salt. crypto.getRandomValues is a proper random source.
function randomSalt() {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return bytes
}

// The real scramble: PBKDF2, the standard way to turn a password into a key.
async function pbkdf2(password, saltBytes) {
  // TextEncoder turns text into the bytes the crypto functions work on.
  const passwordBytes = new TextEncoder().encode(password)

  // Step 1: hand the password to the crypto engine. extractable = false means the browser will.
  const key = await window.crypto.subtle.importKey(
    'raw',
    passwordBytes,
    'PBKDF2',
    false,
    ['deriveBits'],
  )

  // Step 2: stretch it into 256 bits, repeating ROUNDS times with the salt.
  const bits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: saltBytes, iterations: ROUNDS, hash: 'SHA-256' },
    key,
    256,
  )

  return toHex(new Uint8Array(bits))
}

// The stand-in used when crypto.subtle isn't available.
function weakHash(password, saltHex) {
  const text = `${saltHex}:${password}`

  // Two independent running values, combined at the end.
  let a = 0x811c9dc5
  let b = 0x1000193

  for (let round = 0; round < ROUNDS; round += 1) {
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i) + round

      // Math.imul multiplies as 32-bit integers.
      a = Math.imul(a ^ code, 0x01000193) >>> 0
      b = (Math.imul(b + code, 0x85ebca6b) ^ (b >>> 13)) >>> 0
    }
  }

  return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`
}

// Scrambles a password ready for storing.
export async function hashPassword(password) {
  const salt = randomSalt()
  const saltHex = toHex(salt)

  if (hasStrongCrypto()) {
    return {
      method: 'pbkdf2',
      rounds: ROUNDS,
      salt: saltHex,
      hash: await pbkdf2(password, salt),
    }
  }

  return {
    method: 'weak',
    rounds: ROUNDS,
    salt: saltHex,
    hash: weakHash(password, saltHex),
  }
}

// Compares two hashes without leaking WHERE they differ.
function sameHash(a, b) {
  if (a.length !== b.length) return false

  let difference = 0

  for (let i = 0; i < a.length; i += 1) {
    // ^ gives 0 only when the two characters are identical; |= collects any difference found.
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return difference === 0
}

// Checks a typed password against a stored record.
export async function verifyPassword(password, record) {
  if (!record || !record.hash) return false

  if (record.method === 'pbkdf2') {
    // Registered on https, now being checked somewhere without crypto.subtle.
    if (!hasStrongCrypto()) return false

    return sameHash(await pbkdf2(password, fromHex(record.salt)), record.hash)
  }

  return sameHash(weakHash(password, record.salt), record.hash)
}
