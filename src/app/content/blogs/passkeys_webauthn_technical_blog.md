---
title: "Passkeys and WebAuthn Under the Hood: Architecture, Ceremonies, and Cross-Platform Implementation"
excerpt: "An in-depth engineering playbook into the internal architecture of Passkeys and WebAuthn—covering COSE asymmetric cryptography, binary authenticatorData structures, registration and authentication ceremonies, Relying Party origin binding, and production Node.js/Express implementation across web and mobile."
date: "2026-11-20"
tags: ["Authentication", "Passkeys", "WebAuthn", "Security", "Backend Engineering", "Node.js"]
---

Passwords have long been the weakest link in modern application security. Even when paired with SMS or TOTP multi-factor authentication (MFA), traditional shared-secret systems remain vulnerable to credential stuffing, database breaches, SIM swapping, and real-time adversary-in-the-middle (AiTM) reverse-proxy phishing kits.

**Passkeys**—built on the W3C **WebAuthn** (Web Authentication) standard and the FIDO2 Client-to-Authenticator Protocol (**CTAP**)—eliminate shared secrets entirely. Instead of transmitting a static password over the network, the user's device generates an asymmetric cryptographic key pair. The **private key** never leaves the hardware secure enclave or end-to-end encrypted credential manager, while the **public key** is stored on your backend server.

This guide provides a comprehensive, developer-level deep dive into how Passkeys and WebAuthn operate internally: the binary data structures exchanged during ceremonies, why cryptographic origin binding makes phishing mathematically impossible, how synced passkeys differ from hardware keys, and how to build a complete Node.js/Express + TypeScript architecture supporting both a website and native mobile apps.

---

## 1. The Architectural Triad: Relying Party, Client, and Authenticator

Every WebAuthn operation—called a **ceremony**—is a three-party protocol between your backend, the user's OS/browser, and a cryptographic authenticator:

1. **The Relying Party (RP):** Your backend server and web domain (e.g., `example.com`). The RP generates high-entropy random challenges, stores public keys and credential metadata, and verifies cryptographic signatures.
2. **The Client (User Agent / OS API):** The web browser (exposing `navigator.credentials`) or native mobile operating system framework (Apple `AuthenticationServices` on iOS/macOS, Google `Credential Manager` on Android). The client acts as a trusted mediator that enforces origin rules before passing requests to an authenticator.
3. **The Authenticator:** A cryptographic module capable of generating key pairs and signing challenges. Authenticators fall into two architectural categories:
   * **Platform Authenticators:** Built directly into the user's device—such as Apple Touch ID / Face ID (Secure Enclave), Windows Hello (TPM), or Android Biometrics (StrongBox / TEE). Modern OS credential managers (iCloud Keychain, Google Password Manager, 1Password) synchronize these private keys end-to-end encrypted across the user's devices, creating **multi-device passkeys**.
   * **Roaming (Cross-Platform) Authenticators:** External hardware security keys (such as YubiKeys) or a nearby smartphone communicating with a desktop browser over Bluetooth Low Energy (BLE) + encrypted tunnel (**CTAP2 Hybrid Transport / QR code flow**).

```text
+-------------------+      HTTPS (JSON Challenges/Assertions)     +--------------------+
|   Relying Party   | <-----------------------------------------> |   Client (Web/App) |
| (Node.js/Express) |                                             |  navigator.creds / |
+-------------------+                                             |  CredentialManager |
         |                                                        +--------------------+
         | Persists:                                                        ^
         | - credentialId (Base64URL)                                       | CTAP2 / OS IPC
         | - publicKey (COSE bytes)                                         | (Local Biometric / PIN)
         | - signCount & backup flags                                       v
         v                                                        +--------------------+
+-------------------+                                             |   Authenticator    |
|     Database      |                                             | (Secure Enclave /  |
|  (Mongo / SQL)    |                                             |  TPM / Synced Vault)
+-------------------+                                             +--------------------+
```

### User Presence (UP) vs. User Verification (UV)

Inside the authenticator, every ceremony enforces two distinct physical security checks:

* **User Presence (UP):** Confirms a human is physically interacting with the device right now (e.g., touching a capacitive sensor or tapping a prompt), blocking silent background malware invocations.
* **User Verification (UV):** Confirms *who* is interacting with the device via biometrics (fingerprint, face scan) or local device PIN/passcode. Because passkeys combine **something you have** (the private key inside the device enclave) with **something you are or know** (biometric/PIN UV), a single passkey ceremony satisfies multi-factor authentication requirements in one step.

---

## 2. Inside the Cryptographic Payloads: `clientDataJSON`, `authenticatorData`, and COSE

To debug WebAuthn issues effectively in production, you need to understand what the authenticator actually signs and returns.

### A. `clientDataJSON` (Client-Side Context)

Before invoking the authenticator, the browser or mobile OS constructs a UTF-8 JSON object containing the exact web/app context:

```json
{
  "type": "webauthn.get",
  "challenge": "dGhpcyBpcyBhIHJhbmRvbSBzZXJ2ZXIgY2hhbGxlbmdl",
  "origin": "https://app.example.com",
  "crossOrigin": false
}
```

The client hashes this JSON using SHA-256 (`clientDataHash`) and passes only the hash to the authenticator. Notice that the **browser/OS—not your JavaScript code—populates `origin`**.

### B. `authenticatorData` (Binary Authenticator State)

The authenticator constructs a compact binary byte array (`authenticatorData`) with the following exact layout:

| Byte Offset | Length | Field | Description |
| :--- | :--- | :--- | :--- |
| `0` | 32 bytes | `rpIdHash` | SHA-256 hash of the Relying Party ID (e.g., `SHA256("example.com")`). |
| `32` | 1 byte | `flags` | Bitfield indicating `UP` (bit 0), `UV` (bit 2), `BE` (Backup Eligible, bit 3), `BS` (Backed Up, bit 4), `AT` (Attested Credential Data included, bit 6), and `ED` (Extension Data, bit 7). |
| `33` | 4 bytes | `signCount` | 32-bit big-endian unsigned signature counter. |
| `37` | Variable | `attestedCredentialData` | Present only during registration (`AT` flag = 1). Contains the 16-byte AAGUID, `credentialIdLength`, `credentialId`, and **COSE-encoded Public Key**. |

### C. COSE Public Key Encoding

Unlike PEM/X.509 certificates commonly used in TLS, WebAuthn encodes public keys using **COSE (CBOR Object Signing and Encryption)**—a compact binary representation based on Concise Binary Object Representation (CBOR). Most passkeys use **ES256** (ECDSA with P-256 curve and SHA-256, COSE algorithm `-7`) or **RS256** (RSASSA-PKCS1-v1_5 with SHA-256, COSE algorithm `-257`). Libraries like `@simplewebauthn/server` parse these COSE bytes automatically during verification.

### D. Why Phishing Is Mathematically Impossible

During authentication, the authenticator signs the concatenation of `authenticatorData || SHA256(clientDataJSON)` using the private key:


Suppose a user clicks a phishing link pointing to `https://app-example.com` (or a reverse proxy at `https://login.evil-proxy.com`).

1. Even if the attacker relays your server's challenge to the victim's browser, the victim's browser constructs `clientDataJSON` with `"origin": "https://login.evil-proxy.com"` and hashes `"login.evil-proxy.com"` as the `rpIdHash`.
2. Even if the authenticator had a key for `evil-proxy.com` (it doesn't), the signature covers `clientDataHash`.
3. If the attacker tampers with `clientDataJSON` to rewrite `origin` back to `"https://app.example.com"`, `SHA256(clientDataJSON)` changes, invalidating the cryptographic signature.
4. If the attacker forwards the unmodified `clientDataJSON`, your backend rejects it because `"https://login.evil-proxy.com"` is not in your `ALLOWED_ORIGINS` list.

---

## 3. Relying Party ID (`rpID`) and Origin Architecture

Misconfiguring `rpID` and `origin` is the most common source of WebAuthn errors in multi-domain and mobile architectures.

### How `rpID` Scoping Works

* `rpID` must be a registrable domain suffix of the origin's host (e.g., if the page is hosted at `https://portal.staging.example.com`, valid `rpID` values are `"portal.staging.example.com"`, `"staging.example.com"`, or `"example.com"`).
* **Best Practice:** Always anchor `rpID` to your **apex/root domain** (e.g., `"example.com"`). This ensures a passkey registered on `https://example.com` works seamlessly on `https://app.example.com`, `https://admin.example.com`, and your iOS/Android mobile apps.
* **Public Suffix Rule:** Browsers forbid setting `rpID` to public suffixes like `"com"`, `"co.in"`, or `"herokuapp.com"` / `"vercel.app"` (if listed on the Public Suffix List) so one tenant cannot impersonate sibling subdomains.
* **Local Development:** In local development, `rpID` must be `"localhost"` and `origin` must be `"http://localhost:3000"` (WebAuthn treats `localhost` as a secure context even over HTTP; raw IP addresses like `127.0.0.1` are rejected by browsers).

---

## 4. Database Schema & Ephemeral Challenge Architecture

A production passkey implementation requires two distinct persistence layers:

1. **Persistent Credential Store (`PasskeyCredential`):** Stores one or more public keys per user so a user can enroll a laptop, a phone, and a backup hardware key.
2. **Ephemeral Challenge Store (`ChallengeStore`):** Stores single-use challenges with a strict TTL (2–5 minutes) in Redis or a MongoDB TTL collection.

### A. Credential Model (TypeScript / Mongoose)

```ts
import mongoose, { Schema, type Document } from "mongoose";

export interface IPasskeyCredential extends Document {
  userId: mongoose.Types.ObjectId;
  credentialId: string;        // Base64URL-encoded credential ID
  publicKey: Buffer;           // Raw COSE public key bytes
  counter: number;             // Signature counter for clone detection
  deviceType: "singleDevice" | "multiDevice";
  backedUp: boolean;           // True when synced via iCloud/Google/1Password
  transports?: string[];       // ["internal", "hybrid", "usb", "nfc", "ble"]
  aaguid?: string;             // Authenticator Attestation GUID (identifies provider)
  deviceName?: string;         // User-editable label (e.g., "Work MacBook Pro")
  lastUsedAt?: Date;
  createdAt: Date;
}

const PasskeyCredentialSchema = new Schema<IPasskeyCredential>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    credentialId: { type: String, required: true, unique: true, index: true },
    publicKey: { type: Buffer, required: true },
    counter: { type: Number, required: true, default: 0 },
    deviceType: {
      type: String,
      enum: ["singleDevice", "multiDevice"],
      required: true,
    },
    backedUp: { type: Boolean, default: false },
    transports: [{ type: String }],
    aaguid: { type: String },
    deviceName: { type: String, default: "Passkey" },
    lastUsedAt: { type: Date },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

export const PasskeyCredential =
  mongoose.models.PasskeyCredential ||
  mongoose.model<IPasskeyCredential>("PasskeyCredential", PasskeyCredentialSchema);
```

### B. Atomic Challenge Store (Preventing Replay Attacks)

Never trust a challenge sent back in an unsigned cookie or client-controlled state without server-side invalidation. Use atomic `GETDEL` in Redis (or `findOneAndDelete` in MongoDB) so a challenge can be verified **at most once**:

```ts
import crypto from "node:crypto";
import mongoose, { Schema } from "mongoose";

const WebAuthnChallengeSchema = new Schema({
  challengeId: { type: String, required: true, unique: true, index: true },
  challenge: { type: String, required: true },
  userId: { type: String }, // Optional: bound to user during registration
  expiresAt: { type: Date, required: true, expires: 0 }, // MongoDB TTL index
});

const WebAuthnChallenge =
  mongoose.models.WebAuthnChallenge ||
  mongoose.model("WebAuthnChallenge", WebAuthnChallengeSchema);

export const ChallengeStore = {
  async save(challenge: string, ttlSeconds = 180, userId?: string): Promise<string> {
    const challengeId = crypto.randomBytes(24).toString("base64url");
    const expiresAt = new Date(Date.now() + ttlSeconds * 1000);

    await WebAuthnChallenge.create({
      challengeId,
      challenge,
      ...(userId ? { userId } : {}),
      expiresAt,
    });

    return challengeId;
  },

  async consume(challengeId: string, expectedUserId?: string): Promise<string | null> {
    const query: Record<string, unknown> = {
      challengeId,
      expiresAt: { $gt: new Date() },
    };
    if (expectedUserId) {
      query.userId = expectedUserId;
    }

    // Atomic lookup + delete prevents concurrent replay attacks
    const record = await WebAuthnChallenge.findOneAndDelete(query).lean();
    return record?.challenge ?? null;
  },
};
```

---

## 5. Deep Dive: The Registration Ceremony (`navigator.credentials.create`)

Registration must only occur when the user has already established identity (e.g., inside an authenticated account settings page, or right after verifying a magic link/OTP during signup).

```text
Authenticated Client                 Express Backend                     Authenticator
       |                                    |                                  |
       |--- POST /passkeys/register/options ->                                 |
       |    (Authorization: Bearer <JWT>)   |-- Verify JWT & load user         |
       |                                    |-- Query user's existing passkeys |
       |                                    |-- Generate 32-byte challenge     |
       |                                    |-- Save challenge (TTL 180s)      |
       |<-- { challengeId, options } -------|                                  |
       |                                    |                                  |
       |--- startRegistration(options) --------------------------------------->|
       |                                    |        Verify RP ID & Origin     |
       |                                    |        Prompt Biometric / PIN    |
       |                                    |        Mint ECDSA P-256 Key Pair |
       |<-- RegistrationResponseJSON ------------------------------------------|
       |                                    |                                  |
       |--- POST /passkeys/register/verify ->                                  |
       |    { challengeId, credential }     |-- Atomically consume challenge   |
       |                                    |-- Verify attestation & origin    |
       |                                    |-- Store credentialId + publicKey |
       |<-- 201 Created --------------------|                                  |
```

### Critical Registration Options Explained

* **`excludeCredentials`:** You pass all `credentialId`s already registered to this user. If the user tries to register a passkey on a device that already holds one for your `rpID`, the OS returns an `InvalidStateError` cleanly instead of creating confusing duplicate entries.
* **`residentKey: "required"` & `requireResidentKey: true`:** Instructs the authenticator to store the credential on the authenticator itself (**discoverable credential**), along with `user.id` and `user.name`. This allows users to sign in later without typing their email or username first.
* **`user.id`:** Must be an opaque, random byte buffer (e.g., 16–32 random bytes or a UUID)—**never** an email address, phone number, or personally identifiable information (PII), because `user.id` is stored inside the authenticator and exposed during credential selection.
* **`attestation: "none"`:** Skips hardware manufacturer certificate validation, avoiding intrusive browser privacy warnings while keeping full cryptographic proof of key possession.

### Express Registration Controller (`src/controllers/passkeyRegisterController.ts`)

```ts
import type { Request, Response } from "express";
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { PasskeyCredential } from "../models/PasskeyCredential";
import { ChallengeStore } from "../services/challengeStore";

const RP_NAME = process.env.RP_NAME || "AIAMS";
const RP_ID = process.env.RP_ID || "example.com";
const ALLOWED_ORIGINS = [
  "https://app.example.com",
  "http://localhost:3000",
  "ios:bundle-id:com.example.app",
  "android:apk-key-hash:YOUR_BASE64URL_SHA256_CERT_HASH",
];

export async function getRegistrationOptions(req: Request, res: Response) {
  const user = (req as Request & { user: { id: string; email: string; name?: string } }).user;

  const existingPasskeys = await PasskeyCredential.find({ userId: user.id }).lean();

  const options = await generateRegistrationOptions({
    rpName: RP_NAME,
    rpID: RP_ID,
    userID: new TextEncoder().encode(user.id),
    userName: user.email,
    userDisplayName: user.name || user.email,
    attestationType: "none",
    excludeCredentials: existingPasskeys.map((pk) => ({
      id: pk.credentialId,
      transports: pk.transports as AuthenticatorTransportFuture[] | undefined,
    })),
    authenticatorSelection: {
      residentKey: "required",
      userVerification: "preferred",
    },
  });

  const challengeId = await ChallengeStore.save(options.challenge, 180, user.id);

  return res.json({ challengeId, options });
}

export async function verifyRegistration(req: Request, res: Response) {
  const user = (req as Request & { user: { id: string } }).user;
  const { challengeId, credential, deviceName } = req.body;

  const expectedChallenge = await ChallengeStore.consume(challengeId, user.id);
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Registration challenge expired or invalid." });
  }

  const verification = await verifyRegistrationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: ALLOWED_ORIGINS,
    expectedRPID: RP_ID,
    requireUserVerification: false,
  });

  if (!verification.verified || !verification.registrationInfo) {
    return res.status(400).json({ message: "Passkey registration verification failed." });
  }

  const { credential: verifiedCred, credentialDeviceType, credentialBackedUp, aaguid } =
    verification.registrationInfo;

  const created = await PasskeyCredential.create({
    userId: user.id,
    credentialId: verifiedCred.id,
    publicKey: Buffer.from(verifiedCred.publicKey),
    counter: verifiedCred.counter,
    deviceType: credentialDeviceType,
    backedUp: credentialBackedUp,
    transports: verifiedCred.transports,
    aaguid,
    deviceName: deviceName || "Passkey",
  });

  return res.status(201).json({
    verified: true,
    passkey: {
      id: created._id,
      deviceName: created.deviceName,
      deviceType: created.deviceType,
      backedUp: created.backedUp,
      createdAt: created.createdAt,
    },
  });
}
```

---

## 6. Deep Dive: The Authentication Ceremony (`navigator.credentials.get`)

WebAuthn supports two distinct UX patterns during sign-in:

1. **Discoverable / Usernameless Flow (Recommended):** The client calls `/passkeys/login/options` with no email address. `allowCredentials` is omitted (`[]`), so the OS authenticator displays a native account chooser listing all passkeys saved for `rpID`. Once the user picks an account and completes biometric verification, the authenticator returns `response.userHandle` (the `userId` encoded during registration) alongside `credential.id`.
2. **Identifier-First Flow:** The user enters their email first; the server looks up their `PasskeyCredential` records and populates `allowCredentials` so the browser only prompts for keys belonging to that account.

### Express Authentication Controller (`src/controllers/passkeyLoginController.ts`)

```ts
import type { Request, Response } from "express";
import {
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
  type AuthenticatorTransportFuture,
} from "@simplewebauthn/server";
import { PasskeyCredential } from "../models/PasskeyCredential";
import { ChallengeStore } from "../services/challengeStore";
import { issueSessionTokens } from "../services/tokenService";

const RP_ID = process.env.RP_ID || "example.com";
const ALLOWED_ORIGINS = [
  "https://app.example.com",
  "http://localhost:3000",
  "ios:bundle-id:com.example.app",
  "android:apk-key-hash:YOUR_BASE64URL_SHA256_CERT_HASH",
];

export async function getLoginOptions(req: Request, res: Response) {
  const options = await generateAuthenticationOptions({
    rpID: RP_ID,
    userVerification: "preferred",
    // Empty allowCredentials enables native account picker & Conditional UI autofill
  });

  const challengeId = await ChallengeStore.save(options.challenge, 180);

  return res.json({ challengeId, options });
}

export async function verifyLogin(req: Request, res: Response) {
  const { challengeId, credential } = req.body;

  // 1. Consume challenge atomically (blocks replay attacks)
  const expectedChallenge = await ChallengeStore.consume(challengeId);
  if (!expectedChallenge) {
    return res.status(400).json({ message: "Authentication challenge expired or invalid." });
  }

  // 2. Look up the public key by Base64URL credentialId
  const passkey = await PasskeyCredential.findOne({ credentialId: credential.id });
  if (!passkey) {
    return res.status(401).json({ message: "Unrecognized passkey credential." });
  }

  // 3. Verify cryptographic signature, origin, rpID, and counter
  const verification = await verifyAuthenticationResponse({
    response: credential,
    expectedChallenge,
    expectedOrigin: ALLOWED_ORIGINS,
    expectedRPID: RP_ID,
    requireUserVerification: false,
    credential: {
      id: passkey.credentialId,
      publicKey: new Uint8Array(passkey.publicKey),
      counter: passkey.counter,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    },
  });

  if (!verification.verified) {
    return res.status(401).json({ message: "Passkey signature verification failed." });
  }

  // 4. Clone detection & counter update
  const { newCounter } = verification.authenticationInfo;
  if (passkey.counter > 0 && newCounter <= passkey.counter) {
    // Hardware authenticator counter failed to advance — potential cloned authenticator
    return res.status(401).json({ message: "Authenticator counter anomaly detected." });
  }

  passkey.counter = newCounter;
  passkey.lastUsedAt = new Date();
  await passkey.save();

  // 5. Mint short-lived Access JWT + rotating Refresh Token
  const tokens = await issueSessionTokens(String(passkey.userId), req);
  return res.json(tokens);
}
```

### Frontend Client Flow with Conditional UI (Autofill)

On the web client (`@simplewebauthn/browser`), you can trigger passkey autofill inside a standard `<input autocomplete="username webauthn" />` so users see their saved passkeys directly in the browser's dropdown menu:

```ts
import { startAuthentication, browserSupportsWebAuthnAutofill } from "@simplewebauthn/browser";

export async function initPasskeyAutofill(onSuccess: (tokens: unknown) => void) {
  if (!(await browserSupportsWebAuthnAutofill())) return;

  const { challengeId, options } = await fetch("/api/auth/passkeys/login/options", {
    method: "POST",
  }).then((r) => r.json());

  // Suspends quietly until the user selects a passkey from the input autofill menu
  const credential = await startAuthentication({
    optionsJSON: options,
    useBrowserAutofill: true,
  });

  const result = await fetch("/api/auth/passkeys/login/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, credential }),
  }).then((r) => r.json());

  onSuccess(result);
}
```

---

## 7. Cross-Platform Architecture: Web + Native iOS & Android Apps

When your platform serves both a **website** and **native mobile apps**, passkeys created on the web can automatically sign the user into the mobile app (and vice versa) because both share the same `rpID` (`example.com`). However, mobile operating systems strictly verify that your domain actually owns those native apps before allowing them to use `rpID: "example.com"`.

### 1. iOS & macOS (`apple-app-site-association`)

Host a static JSON file at `https://example.com/.well-known/apple-app-site-association`:

* Must be served over HTTPS with `Content-Type: application/json`.
* Must return HTTP `200` directly with **no HTTP redirects**.
* Format: `<TEAM_ID>.<BUNDLE_ID>`

```json
{
  "webcredentials": {
    "apps": [
      "9JA89QQLNQ.com.example.app"
    ]
  }
}
```

In Xcode, add the **Associated Domains** capability to your app target with the entitlement:

```text
webcredentials:example.com
```

### 2. Android Digital Asset Links (`assetlinks.json`)

Host a static JSON file at `https://example.com/.well-known/assetlinks.json`:

```json
[
  {
    "relation": [
      "delegate_permission/common.get_login_creds"
    ],
    "target": {
      "namespace": "android_app",
      "package_name": "com.example.app",
      "sha256_cert_fingerprints": [
        "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5"
      ]
    }
  }
]
```

*(Note: When publishing to Google Play with Play App Signing enabled, make sure you include the **Google Play App Signing certificate SHA-256 fingerprint**, not just your local debug keystore fingerprint.)*

### 3. Understanding Native Origin Strings on the Backend

During mobile passkey ceremonies, the OS constructs special origin strings inside `clientDataJSON`:

* **iOS:** Sends `https://example.com` (matching the Associated Domain).
* **Android:** Sends `android:apk-key-hash:<base64url-encoded-sha256-of-signing-cert>`.

You can compute the exact Android origin string from your colon-separated hex SHA-256 fingerprint in Node.js:

```ts
const hexFingerprint = "14:6D:E9:83:C5:73:06:50:D8:EE:B9:95:2F:34:FC:64:16:A0:83:42:E6:1D:BE:A8:8A:04:96:B2:3F:CF:44:E5";
const base64UrlHash = Buffer.from(hexFingerprint.replace(/:/g, ""), "hex").toString("base64url");
const androidOrigin = `android:apk-key-hash:${base64UrlHash}`;
```

---

## 8. Bridging Passkeys to Session Management: Rotating Refresh Tokens

WebAuthn proves identity at the moment of sign-in, while your token architecture governs ongoing API requests. Pairing Passkeys with a **short-lived Access JWT + Rotating Refresh Token** gives you both fast stateless API checks and immediate server-side revocation:

```text
1. Passkey Verify Succeeds
      │
      ├──▶ Access Token (JWT, 15 min TTL) ──▶ Sent in Authorization: Bearer <token>
      │
      └──▶ Refresh Token (Opaque 256-bit random, 30 day TTL)
             ├── Web:    HttpOnly; Secure; SameSite=Lax cookie
             ├── Mobile: iOS Keychain / Android EncryptedSharedPreferences
             └── DB:     Stores SHA-256(refreshToken), userId, familyId, expiresAt
```

### Refresh Token Rotation & Reuse Detection

1. When the 15-minute Access Token expires, the client calls `POST /api/auth/refresh`.
2. The server hashes the incoming Refresh Token with SHA-256 and looks up the active session record.
3. **Token Family Reuse Detection:** If a client presents a Refresh Token that was *already marked as rotated/used*, an attacker may have stolen the token. The server immediately revokes **all active refresh tokens in that `familyId`**, forcing a fresh passkey sign-in.
4. Otherwise, the server marks the current Refresh Token as rotated, mints a new Refresh Token in the same family, and returns a fresh 15-minute Access JWT.

---

## 9. Production Edge Cases & Security Hardening Checklist

Before rolling out passkeys to production users, account for these real-world operational edge cases:

1. **Synced Passkeys & Signature Counters (`signCount === 0`):**
   Multi-device synced passkeys (Apple iCloud Keychain, Google Password Manager) intentionally keep `signCount` at `0` because synchronizing a mutable counter across concurrent offline devices would cause false positives. Only enforce monotonic counter increments (`newCounter > passkey.counter`) when `passkey.counter > 0` (typically hardware security keys).
2. **Preventing Account Lockout:**
   Users lose devices, reset phones, or switch ecosystems (e.g., moving from iOS to Android). Encourage users to register at least two passkeys (e.g., phone + laptop), surface clear device labels (`credentialBackedUp` status), and block deletion of a user's final passkey unless they have an active fallback method (password + MFA, enterprise SSO, or verified recovery codes).
3. **Step-Up Authentication for High-Risk Actions:**
   Even when a user already holds a valid session, require a fresh passkey assertion (`userVerification: "required"`) before allowing sensitive operations such as exporting API keys, changing payout accounts, or deleting passkeys.
4. **Endpoint Rate Limiting & Audit Trail:**
   Apply strict per-IP and per-account rate limits to `/passkeys/login/options`, `/passkeys/login/verify`, and `/passkeys/register/*` to prevent challenge-table exhaustion, and record every passkey enrollment, rename, and deletion in your security audit log with IP, user-agent, and timestamp.