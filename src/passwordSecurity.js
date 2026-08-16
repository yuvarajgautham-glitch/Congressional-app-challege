// ============================================================================
// passwordSecurity.js — scrambling the password so it is never stored as typed.
//
// THE PROBLEM THIS SOLVES. The account is kept on the phone, in localStorage,
// which is plain readable text that anyone who opens the browser's developer
// tools can look at. This app used to put the password straight in there. That
// meant a borrowed phone, a shared laptop or a curious sibling could read it —
// and because people reuse passwords, a password read here is often a password
// that works somewhere that actually matters.
//
// THE FIX. Store a HASH instead of the password. A hash is a one-way scramble:
// easy to work out from the password, effectively impossible to reverse. To
// check a login, scramble what was typed and compare the two scrambles. The
// real password is never written down anywhere, so there is nothing to read.
//
// Two details that turn a weak hash into a strong one:
//
//   SALT      A random value mixed in, different for every account. Without it,
//             identical passwords produce identical hashes, and an attacker can
//             look yours up in a precomputed table of common passwords.
//
//   ROUNDS    The scramble is repeated 100,000 times. That's a few hundredths
//             of a second when you log in, and it multiplies the cost of
//             guessing passwords one by one by the same 100,000.
//
// WHAT THIS IS STILL NOT. Hashing protects the password. It does not turn a
// phone-only login into a real one: anyone who can edit localStorage can still
// mark themselves as signed in, because there is no server to say otherwise.
// This is a school project, not a bank. But the password itself is now safe,
// which is the part that could hurt someone outside this app.
// ============================================================================

// 100,000 rounds of PBKDF2 is the low end of current guidance and is chosen so
// that logging in on an old phone still feels instant.
const ROUNDS = 100000

// Whether this browser can do proper cryptography.
//
// crypto.subtle only exists in a "secure context" — an https page, or
// localhost. It is deliberately missing over plain http, which is what you get
// opening the app by its 192.168.x.x address from another device on your
// Wi-Fi. Everything below checks first rather than crashing there.
function hasStrongCrypto() {
  return Boolean(window.crypto && window.crypto.subtle)
}

// Bytes → text, so the result can be stored as JSON.
// Each byte becomes two hex characters, e.g. 255 → "ff".
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

// A fresh random salt. crypto.getRandomValues is a proper random source — the
// kind used for keys — unlike Math.random(), which is predictable and must
// never be used for anything security-related. It works everywhere, including
// the plain-http case where crypto.subtle doesn't.
function randomSalt() {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return bytes
}

// The real scramble: PBKDF2, the standard way to turn a password into a key.
async function pbkdf2(password, saltBytes) {
  // TextEncoder turns text into the bytes the crypto functions work on.
  const passwordBytes = new TextEncoder().encode(password)

  // Step 1: hand the password to the crypto engine. extractable = false means
  // the browser will not let any code read it back out again.
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
//
// It is NOT as strong — this is ordinary arithmetic, not a vetted algorithm,
// and a determined attacker with the file could work through a list of common
// passwords faster than PBKDF2 would allow. It is here so that the password is
// never stored as typed even on a plain-http connection, which is still a large
// improvement on what was there before. The record says which was used, so the
// app never has to guess.
function weakHash(password, saltHex) {
  const text = `${saltHex}:${password}`

  // Two independent running values, combined at the end. One alone collides far
  // too easily — different passwords producing the same result.
  let a = 0x811c9dc5
  let b = 0x1000193

  for (let round = 0; round < ROUNDS; round += 1) {
    for (let i = 0; i < text.length; i += 1) {
      const code = text.charCodeAt(i) + round

      // Math.imul multiplies as 32-bit integers, which is what keeps these
      // numbers from drifting into the imprecise range of ordinary JavaScript
      // numbers. >>> 0 forces the result back to a positive 32-bit value.
      a = Math.imul(a ^ code, 0x01000193) >>> 0
      b = (Math.imul(b + code, 0x85ebca6b) ^ (b >>> 13)) >>> 0
    }
  }

  return `${a.toString(16).padStart(8, '0')}${b.toString(16).padStart(8, '0')}`
}

// Scrambles a password ready for storing. Returns the record to save — the
// salt and the method go with it, because both are needed to check a login and
// neither is a secret.
//
// "async" because the crypto engine returns a promise; callers use "await".
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
//
// The obvious a === b stops at the first character that doesn't match, so a
// wrong password takes very slightly longer to reject the more of it is right.
// Measured across many attempts, that timing gives a password away one letter
// at a time. This checks every character regardless, taking the same time
// either way. It is overkill for a phone-only app, and it is the correct habit.
function sameHash(a, b) {
  if (a.length !== b.length) return false

  let difference = 0

  for (let i = 0; i < a.length; i += 1) {
    // ^ gives 0 only when the two characters are identical; |= collects any
    // difference found, so the total is 0 only if every character matched.
    difference |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }

  return difference === 0
}

// Checks a typed password against a stored record.
export async function verifyPassword(password, record) {
  if (!record || !record.hash) return false

  if (record.method === 'pbkdf2') {
    // Registered on https, now being checked somewhere without crypto.subtle.
    // Rare, and refusing is the only honest answer — there is no way to
    // recompute the hash here.
    if (!hasStrongCrypto()) return false

    return sameHash(await pbkdf2(password, fromHex(record.salt)), record.hash)
  }

  return sameHash(weakHash(password, record.salt), record.hash)
}
