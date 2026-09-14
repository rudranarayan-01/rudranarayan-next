---
title: "Mastering Node.js: 50 Core to Advanced Interview Questions & Architectural Patterns"
excerpt: "A comprehensive guide covering 50 essential Node.js interview questions, deep-diving into the event loop, asynchronous design patterns, performance tuning, memory management, and scalable backend architecture."
date: "2026-09-14"
tags: ["Node.js", "Backend Development", "JavaScript", "System Design", "Interview Prep"]
---
# Node.js & JavaScript Backend Interview Guide (50 Questions)
### Calibrated for Intermediate Engineers (1 yr exp) growing toward Senior

Each answer includes: a plain-language explanation first (so the concept is solid), a code example, and a **Senior Note** — what an interviewer at the next level up would expect you to also know. Don't worry about mastering every Senior Note on your first pass; they're there to show you where the depth goes.

---

## Part 1: Questions 1–25 — Core JS, Engine Internals, Event Loop, Async Basics

## Question 1: What is the JavaScript Call Stack, and how does it relate to "stack overflow"?

The call stack is a LIFO (last-in, first-out) structure that tracks function calls. When a function is invoked, a new frame is pushed; when it returns, the frame is popped.

```javascript
function a() { b(); }
function b() { c(); }
function c() { console.log('deep'); }
a(); // stack: a -> b -> c -> (pops back down)
```

If functions call themselves without a base case (or too deeply), frames pile up until the stack's memory limit is hit — a `RangeError: Maximum call stack size exceeded`.

```javascript
function recurse() { return recurse(); } // no base case
recurse(); // RangeError
```

**Senior Note:** V8 doesn't do tail-call optimization in practice (despite being in the ES6 spec, no major engine ships it), so deep recursion in Node should often be rewritten iteratively or trampolined for large inputs — this matters when processing large trees/JSON recursively on a server.

---

## Question 2: Explain the V8 Memory Heap and Generational Garbage Collection.

V8 splits the heap into generations based on the empirical observation that **most objects die young**:
- **Young Generation (Scavenge/New Space):** small, fast-collected. New objects start here.
- **Old Generation:** objects that survive a couple of GC cycles get "promoted" here. Collected less often, but the collection is more expensive (Mark-Sweep-Compact).

```javascript
// Short-lived - collected quickly in Young Gen
function processRequest(req) {
  const tempData = { ...req.body }; // dies after function returns
  return transform(tempData);
}

// Long-lived - eventually promoted to Old Gen
const cache = new Map(); // lives for the app's lifetime
```

**Senior Note:** Young-gen collection ("Scavenge") uses a copying algorithm (Cheney's algorithm) and is fast but pauses the main thread briefly. Old-gen uses Mark-Sweep-Compact and can cause longer pauses ("stop-the-world"), which is why memory-heavy Node services can show latency spikes correlated with GC — visible in `--trace-gc` output or via `perf_hooks`' `PerformanceObserver` for GC entries.

---

## Question 3: Walk through the Node.js Event Loop phases.

Node's event loop (via libuv) cycles through distinct phases each tick:

1. **Timers** — `setTimeout`/`setInterval` callbacks whose threshold has passed.
2. **Pending callbacks** — I/O callbacks deferred from the previous cycle.
3. **Poll** — retrieves new I/O events, executes I/O callbacks (most work happens here).
4. **Check** — `setImmediate()` callbacks.
5. **Close callbacks** — e.g. `socket.on('close', ...)`.

```javascript
setTimeout(() => console.log('timer'), 0);
setImmediate(() => console.log('immediate'));

// Order is NOT guaranteed at top-level (depends on process startup timing)
// but INSIDE an I/O callback, immediate always fires before timer:
const fs = require('fs');
fs.readFile(__filename, () => {
  setTimeout(() => console.log('timeout'), 0);
  setImmediate(() => console.log('immediate')); // always first here
});
```

**Senior Note:** Between every phase transition, Node drains the **microtask queue** (Promises, `process.nextTick`) completely before moving to the next macrotask phase. This is why heavy `.then()` chaining can starve I/O — a common production incident cause.

---

## Question 4: What is libuv, and why does Node need a thread pool?

libuv is the C library that gives Node its event loop and async I/O. JavaScript itself is single-threaded, but many OS operations (file system, DNS lookups, some crypto) are **not** natively async at the OS level on all platforms — so libuv offloads them to a background **thread pool** (default size: 4).

```javascript
// These use the libuv thread pool:
const crypto = require('crypto');
crypto.pbkdf2('password', 'salt', 100000, 64, 'sha512', (err, key) => {
  console.log('done'); // ran on a worker thread, callback fires on main thread
});
```

**Senior Note:** Network I/O (sockets, HTTP) does NOT use the thread pool — it uses the OS's native async mechanisms (epoll/kqueue/IOCP) directly. Only `fs`, DNS lookups (`dns.lookup`, not `dns.resolve`), and some `crypto` functions use the pool. If you have CPU-bound crypto work saturating 4 threads, tune with `UV_THREADPOOL_SIZE` (max 128) — a classic senior-level production tuning question.

---

## Question 5: Microtasks vs. Macrotasks — what's the priority order?

**Microtasks** (Promise callbacks, `queueMicrotask`) run to completion before the event loop proceeds to the next **macrotask** (timers, I/O, `setImmediate`).

```javascript
console.log('1: sync');

setTimeout(() => console.log('2: macrotask (timer)'), 0);

Promise.resolve().then(() => console.log('3: microtask'));

console.log('4: sync');

// Output: 1, 4, 3, 2
// All microtasks drain BEFORE the next macrotask runs
```

**Senior Note:** A microtask that queues another microtask keeps draining — infinitely resolving promises in a loop can starve the event loop entirely, blocking timers and I/O forever (a real, subtle production bug pattern, distinct from a blocking synchronous loop).

---

## Question 6: `process.nextTick()` vs `setImmediate()` vs `setTimeout(fn, 0)` — precisely.

- `process.nextTick()`: not technically part of the event loop at all — it runs **after the current operation completes**, before the event loop continues, and even before other microtasks (it has its own queue, processed first).
- `setImmediate()`: runs in the **check** phase, once per event loop iteration.
- `setTimeout(fn, 0)`: runs in the **timers** phase; effectively `~1ms` minimum in practice.

```javascript
process.nextTick(() => console.log('nextTick'));       // fires first
Promise.resolve().then(() => console.log('promise'));   // fires second
setImmediate(() => console.log('immediate'));            // fires later
setTimeout(() => console.log('timeout'), 0);              // order vs immediate varies at top-level
```

**Senior Note:** Overusing `process.nextTick()` recursively (e.g., in a retry loop) can starve the event loop — Node calls this "nextTick recursion" and it will block I/O indefinitely, unlike `setImmediate` which always yields back to the loop first.

---

## Question 7: Explain closures with a practical backend example.

A closure is a function that retains access to variables from its enclosing scope, even after that outer function has returned.

```javascript
function createRateLimiter(maxRequests, windowMs) {
  let requestCount = 0;
  let windowStart = Date.now();

  return function isAllowed() {
    const now = Date.now();
    if (now - windowStart > windowMs) {
      requestCount = 0;
      windowStart = now;
    }
    requestCount++;
    return requestCount <= maxRequests;
  };
}

const limiter = createRateLimiter(5, 60000);
console.log(limiter()); // true — requestCount/windowStart persist via closure
```

**Senior Note:** Closures are a common, subtle memory leak source — if a closure captures a large object (e.g., a full `req` object) and that closure is stored long-term (e.g., in an event listener that's never removed), the captured object can never be garbage collected.

---

## Question 8: What is Lexical Scope, and how does it differ from dynamic scope?

Lexical (static) scope means variable resolution is determined by **where a function is defined in the source code**, not where it's called from. JavaScript is lexically scoped.

```javascript
let x = 'global';

function outer() {
  let x = 'outer';
  function inner() {
    console.log(x); // 'outer' — resolved based on where inner() is WRITTEN
  }
  return inner;
}

const fn = outer();
fn(); // still logs 'outer', even called from global scope
```

**Senior Note:** This is precisely what enables closures to work reliably — lexical scoping is resolved once at parse/compile time (into a "scope chain"), which is part of why closures don't need to re-look-up variables at call time.

---

## Question 9: Explain Prototypal Inheritance and the prototype chain.

Every JS object has an internal `[[Prototype]]` link to another object. Property lookups walk up this chain until found or `null` is reached.

```javascript
function Animal(name) {
  this.name = name;
}
Animal.prototype.speak = function () {
  return `${this.name} makes a sound.`;
};

function Dog(name) {
  Animal.call(this, name);
}
Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;
Dog.prototype.speak = function () {
  return `${this.name} barks.`;
};

const d = new Dog('Rex');
console.log(d.speak()); // 'Rex barks.'
console.log(d.__proto__.__proto__ === Animal.prototype); // true
```

**Senior Note:** `class` syntax is syntactic sugar over this exact mechanism. Understanding the raw prototype chain matters for debugging `instanceof` failures across module boundaries (e.g., differing `node_modules` copies of the same package creating two distinct prototypes), and for prototype pollution vulnerabilities (see Q32).

---

## Question 10: Explain the four rules of `this` binding.

1. **Default binding** — plain function call, `this` is `undefined` in strict mode (or global object in sloppy mode).
2. **Implicit binding** — called as a method, `this` is the object before the dot.
3. **Explicit binding** — `call`/`apply`/`bind`.
4. **`new` binding** — `this` is the newly created object.

```javascript
const obj = {
  name: 'server',
  greet() { console.log(this.name); },
};

const fn = obj.greet;
fn(); // undefined (default binding — lost the object context)
obj.greet(); // 'server' (implicit binding)
fn.call(obj); // 'server' (explicit binding)
```

Arrow functions don't have their own `this` — they inherit it lexically from the enclosing scope, which is why they're preferred for callbacks inside class methods.

```javascript
class RequestHandler {
  constructor() { this.count = 0; }
  onRequest = () => { this.count++; }; // arrow: 'this' is always the instance
}
```

**Senior Note:** This is a very common Express.js bug source — passing `this.someMethod` as a route handler without binding loses `this`, causing `this.something` to be `undefined` inside the handler at runtime, not at definition time.

---

## Question 11: ES Modules vs. CommonJS — key differences that matter in Node.

| | CommonJS | ES Modules |
|---|---|---|
| Loading | Synchronous, runtime | Static, can be async |
| Syntax | `require()` / `module.exports` | `import` / `export` |
| Resolution | Dynamic (can be conditional) | Static (analyzed before execution) |
| `this` at top level | `module.exports` | `undefined` |
| Caching | By resolved file path | By URL/specifier |

```javascript
// CommonJS
const express = require('express');
module.exports = { handler };

// ESM
import express from 'express';
export { handler };
```

**Senior Note:** ESM's static structure enables tree-shaking (unused exports can be eliminated at bundle time) — impossible with CommonJS since `require()` calls can be conditional/dynamic. In Node, mixing them requires care: a CJS module `require()`-ing an ESM module doesn't work directly (must use dynamic `import()`), while ESM can import CJS.

---

## Question 12: `var` vs `let`/`const`, and the Temporal Dead Zone (TDZ).

`var` is function-scoped and hoisted with an initial value of `undefined`. `let`/`const` are block-scoped and hoisted too, but stay in the **Temporal Dead Zone** — inaccessible — until their declaration line executes.

```javascript
console.log(a); // undefined (var hoisted, initialized to undefined)
var a = 1;

console.log(b); // ReferenceError: Cannot access 'b' before initialization
let b = 2;
```

A classic interview trap — the closure-in-a-loop bug:

```javascript
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 10); // logs 3, 3, 3 — var is shared
}
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 10); // logs 0, 1, 2 — let creates a new binding per iteration
}
```

**Senior Note:** `let` in a `for` loop creates a fresh lexical binding per iteration under the hood — this is spec-mandated behavior, not just "let is block scoped," and is exactly why it fixes the classic closure bug above.

---

## Question 13: Explain Hoisting for functions, `var`, and classes.

- **Function declarations** are fully hoisted (name AND body) — callable before their line.
- **`var`** is hoisted but only the declaration (value is `undefined` until assignment).
- **`let`/`const`/`class`** are hoisted but stay in the TDZ.

```javascript
sayHi(); // works — function declarations are fully hoisted
function sayHi() { console.log('hi'); }

sayBye(); // TypeError: sayBye is not a function (var hoisted as undefined)
var sayBye = function () { console.log('bye'); };
```

**Senior Note:** This is why style guides often ban function expressions being relied upon before definition — but more importantly, understanding hoisting is essential for debugging module load-order bugs, where a circular `require()` returns a partially-populated `module.exports`.

---

## Question 14: Explain the internal states of a Promise and the resolution procedure.

A Promise has three states: `pending`, `fulfilled`, `rejected` — and once settled (fulfilled/rejected), it's **immutable** forever.

```javascript
const p = new Promise((resolve, reject) => {
  setTimeout(() => resolve('done'), 100);
});

p.then((val) => console.log(val)); // 'done', once, ever
```

If a promise resolves with another "thenable" (an object with a `.then` method), the spec's Promise Resolution Procedure ("thenable assimilation") unwraps it recursively before settling:

```javascript
const inner = Promise.resolve(42);
const outer = new Promise((resolve) => resolve(inner));
outer.then((val) => console.log(val)); // 42, not the inner Promise object
```

**Senior Note:** `.then()` callbacks are always scheduled as microtasks, even if the promise is already settled — this guarantees consistent async behavior (never synchronously calling your `.then` handler), which prevents Zalgo-style bugs (functions that are sometimes sync, sometimes async).

---

## Question 15: How does `async`/`await` work under the hood?

`async`/`await` is syntactic sugar over generator functions + an automatic driver that resumes the generator on each promise resolution — all still running on the microtask queue.

```javascript
// Roughly equivalent conceptually:
async function fetchUser(id) {
  const res = await fetch(`/users/${id}`);
  const data = await res.json();
  return data;
}

// Desugars conceptually to:
function fetchUser(id) {
  return new Promise((resolve, reject) => {
    const gen = function* () {
      const res = yield fetch(`/users/${id}`);
      const data = yield res.json();
      return data;
    }();
    // a "driver" resumes gen.next() each time a yielded promise resolves
  });
}
```

**Senior Note:** Every `await` is a microtask boundary — even `await` on an already-resolved value yields control back to the event loop at least once. This matters for tight loops: `for (const x of arr) { await doWork(x); }` yields to the event loop `arr.length` times, which is usually fine (and desirable, prevents blocking) but can matter for ordering guarantees with concurrent timers.

---

## Question 16: How should you handle errors in async code, including unhandled rejections?

```javascript
// Always wrap awaits in try/catch at the boundary that can meaningfully handle the error
async function getUser(id) {
  try {
    const user = await db.users.findById(id);
    if (!user) throw new NotFoundError(`User ${id} not found`);
    return user;
  } catch (err) {
    logger.error('getUser failed', { id, err });
    throw err; // re-throw so the caller (e.g., Express error middleware) can respond
  }
}
```

Unhandled rejections — a Promise that rejects with no `.catch()` anywhere in its chain — should always be monitored:

```javascript
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection:', reason);
  // In modern Node, unhandled rejections terminate the process by default
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  process.exit(1); // don't trust process state after an uncaught sync exception — restart
});
```

**Senior Note:** Since Node 15, unhandled promise rejections crash the process by default (matching `uncaughtException` behavior) — a deliberate breaking change because "silently swallowed rejection" was a top cause of zombie/broken production processes that looked alive but were in a corrupted state.

---

## Question 17: What are the most common sources of memory leaks in a Node.js server?

1. **Global variables/caches that grow unbounded:**
```javascript
const cache = {}; // never evicted — grows forever
app.get('/user/:id', (req, res) => {
  cache[req.params.id] = fetchUser(req.params.id); // leak
});
```
Fix: use an LRU cache with a max size (`lru-cache` package) or a TTL.

2. **Event listeners never removed:**
```javascript
function subscribe(emitter) {
  emitter.on('data', handleData); // if subscribe() is called repeatedly without removeListener, listeners pile up
}
```

3. **Closures capturing large objects** held by long-lived references (timers, module-level arrays).

4. **Detached objects in `setInterval`** that never gets `clearInterval`'d.

**Senior Note:** Node will warn `MaxListenersExceededWarning` at 11 listeners on a single EventEmitter by default — often the first visible symptom of leak #2 in production logs, and a genuinely useful early signal, not just noise to suppress.

---

## Question 18: How do you profile CPU usage in a Node.js production process?

```bash
# Built-in V8 profiler
node --prof app.js
# generates isolate-0x...-v8.log
node --prof-process isolate-0x...-v8.log > processed.txt
```

Or programmatically, for on-demand profiling without a restart:

```javascript
const inspector = require('inspector');
const fs = require('fs');
const session = new inspector.Session();
session.connect();

session.post('Profiler.enable', () => {
  session.post('Profiler.start', () => {
    setTimeout(() => {
      session.post('Profiler.stop', (err, { profile }) => {
        fs.writeFileSync('profile.cpuprofile', JSON.stringify(profile));
      });
    }, 10000); // profile for 10 seconds
  });
});
```

The resulting `.cpuprofile` opens directly in Chrome DevTools' Performance tab for flame-graph analysis.

**Senior Note:** `clinic.js` (`clinic doctor`, `clinic flame`) wraps this into a much friendlier workflow and is the de facto standard tool for diagnosing production Node performance issues without deep manual V8 flag knowledge.

---

## Question 19: How do you find a memory leak using heap snapshots?

```javascript
const v8 = require('v8');
const fs = require('fs');

function takeSnapshot(label) {
  const snapshotStream = v8.getHeapSnapshot();
  const fileStream = fs.createWriteStream(`${label}.heapsnapshot`);
  snapshotStream.pipe(fileStream);
}

// Take one under normal load, then again after suspected leak triggers, compare in Chrome DevTools
takeSnapshot('before');
// ... trigger suspected leaky operation many times ...
takeSnapshot('after');
```

Load both `.heapsnapshot` files in Chrome DevTools' Memory tab, use the **Comparison** view — it shows exactly which object types grew between snapshots and their retaining paths (what's holding a reference to them, preventing GC).

**Senior Note:** The retaining path is the actual debugging payoff — it literally shows the reference chain from a GC root down to the leaked object, telling you exactly which variable/closure/listener to fix, rather than just "you have a leak somewhere."

---

## Question 20: What's the difference between synchronous and asynchronous error handling patterns, and why does it matter for Express?

```javascript
// Synchronous throw — Express catches this automatically
app.get('/sync', (req, res) => {
  throw new Error('boom'); // Express's default error handler catches it
});

// Async throw in older Express (<5) — NOT caught automatically, crashes silently or hangs
app.get('/async-bad', async (req, res) => {
  throw new Error('boom'); // unhandled rejection, request hangs, no response ever sent
});

// Must wrap or use a helper
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

app.get('/async-good', asyncHandler(async (req, res) => {
  throw new Error('boom'); // properly forwarded to Express error middleware
}));
```

**Senior Note:** Express 5 (finally) natively supports async route handlers and forwards rejected promises to `next(err)` automatically — a long-standing pain point. Know which major version you're on, since this changes whether you need the wrapper pattern at all.

---

## Question 21: Explain `call`, `apply`, and `bind` with a real use case.

All three let you explicitly control `this`.

```javascript
function logRequest(method, path) {
  console.log(`[${this.serviceName}] ${method} ${path}`);
}

const context = { serviceName: 'AuthService' };

logRequest.call(context, 'GET', '/login');       // args individually
logRequest.apply(context, ['GET', '/login']);     // args as array
const boundLog = logRequest.bind(context);         // returns a new function, permanently bound
boundLog('POST', '/logout');
```

**Senior Note:** `bind` is commonly used to pre-configure a function with partial context/args (a form of partial application) — e.g., binding a logger instance's context once at module load so call sites don't need to pass it repeatedly.

---

## Question 22: What is currying, and where is it genuinely useful in backend code?

Currying transforms a function taking multiple arguments into a sequence of functions each taking one (or a subset).

```javascript
const curry = (fn) => (...args) =>
  args.length >= fn.length
    ? fn(...args)
    : (...more) => curry(fn)(...args, ...more);

const authorize = curry((role, resource, action) =>
  `Checking if ${role} can ${action} on ${resource}`
);

const adminCheck = authorize('admin'); // partially applied
console.log(adminCheck('users', 'delete'));
```

A more realistic backend pattern — building configured middleware:

```javascript
const requireRole = (role) => (req, res, next) => {
  if (req.user?.role !== role) return res.status(403).end();
  next();
};

app.delete('/users/:id', requireRole('admin'), deleteUserHandler);
```

**Senior Note:** This second example — a function returning a configured middleware — is currying in practice, even if nobody calls it that in the codebase. Recognizing this pattern (higher-order functions producing specialized functions) is more valuable than memorizing the formal `curry()` utility.

---

## Question 23: `Object.freeze()` vs `Object.seal()` — and their limitations.

- `Object.freeze()`: no new properties, no deleting, no reassigning existing values. Fully immutable at the top level.
- `Object.seal()`: no new/deleted properties, but existing values **can** be reassigned.

```javascript
const config = Object.freeze({ maxRetries: 3, timeout: 5000 });
config.maxRetries = 10; // silently fails (throws in strict mode)
console.log(config.maxRetries); // still 3

const nested = Object.freeze({ inner: { count: 1 } });
nested.inner.count = 99; // WORKS — freeze is shallow!
console.log(nested.inner.count); // 99
```

**Senior Note:** `Object.freeze` is shallow — a common gotcha for anyone assuming it deeply locks a config object. Deep-freezing requires a recursive helper, and even then it doesn't prevent `Map`/`Set` mutation methods, which aren't plain-object properties.

---

## Question 24: What are `WeakMap` and `WeakSet`, and why do they matter for memory management?

Unlike `Map`/`Set`, `WeakMap`/`WeakSet` hold their keys (objects only, not primitives) **weakly** — meaning the presence of a key in a WeakMap does NOT prevent that object from being garbage collected if there are no other references to it.

```javascript
let user = { id: 1, name: 'Alice' };
const metadata = new WeakMap();
metadata.set(user, { lastLogin: Date.now() });

user = null; // the object is now eligible for GC — 
             // metadata's entry disappears too, automatically, no leak
```

Compare to a regular `Map`, which would keep `user` alive forever just by holding it as a key, even after all other references are gone — a classic caching-related leak.

**Senior Note:** WeakMaps are also not iterable and have no `.size` — a deliberate spec design, since their contents can change unpredictably as GC runs, so exposing a stable size/iteration would be meaningless. This makes them a poor fit for anything you need to enumerate — only for associating metadata with objects you don't own the lifecycle of.

---

## Question 25: What are `Symbol`s used for in real backend code?

Symbols are unique, primitive values often used to avoid property name collisions — especially useful for adding metadata to objects without risking clashing with user-defined or future property names.

```javascript
const REQUEST_ID = Symbol('requestId');

function attachRequestId(req) {
  req[REQUEST_ID] = crypto.randomUUID();
}

// Guaranteed not to collide with any string key a library or user might add,
// and won't show up in for...in, JSON.stringify, or Object.keys()
attachRequestId(myReq);
console.log(JSON.stringify(myReq)); // REQUEST_ID is NOT included
```

Node itself uses this pattern internally (e.g., `Symbol.asyncIterator` for defining custom async-iterable protocols on your own classes).

**Senior Note:** Symbols are the mechanism behind implementing the iterator protocols (`Symbol.iterator`, `Symbol.asyncIterator`) that make custom classes work with `for...of` / `for await...of` — relevant when building custom stream-like or paginated data-access abstractions.

---

*Questions 26–50 continue in the second half of this guide, covering Streams, Buffers, Worker Threads, Atomics, Security (Prototype Pollution, ReDoS), AsyncLocalStorage, production debugging, and core design patterns.*

---

## Part 2: Questions 26–50 — Streams, Concurrency, Security, Production Debugging, Design Patterns

## Question 26: Explain the four types of Node.js Streams.

- **Readable** — source of data (e.g., `fs.createReadStream`, an HTTP request body).
- **Writable** — destination for data (e.g., `fs.createWriteStream`, an HTTP response).
- **Duplex** — both readable and writable, independently (e.g., a TCP socket).
- **Transform** — a duplex stream that modifies data as it passes through (e.g., `zlib.createGzip()`).

```javascript
const fs = require('fs');
const zlib = require('zlib');

// Classic backend pattern: stream a large file, compress it, write to disk —
// without ever loading the whole file into memory
fs.createReadStream('large-export.csv')
  .pipe(zlib.createGzip())
  .pipe(fs.createWriteStream('large-export.csv.gz'));
```

**Senior Note:** Streams are Node's answer to processing data that's too large to fit in memory comfortably — a 2GB file read via `fs.readFile` loads the whole thing into a Buffer in RAM; the same file via `createReadStream` processes it in small chunks (default 64KB), keeping memory flat regardless of file size.

---

## Question 27: What is backpressure, and why does `.pipe()` handle it automatically?

Backpressure happens when a Writable stream can't consume data as fast as a Readable stream produces it. Without handling this, the Readable would keep pushing data into memory, causing unbounded buffering — a memory leak under load.

```javascript
// .pipe() handles backpressure FOR you:
readable.pipe(writable); // if writable's internal buffer fills, pipe automatically pauses readable

// Manual backpressure handling (what pipe() does internally):
readable.on('data', (chunk) => {
  const canContinue = writable.write(chunk);
  if (!canContinue) {
    readable.pause();
    writable.once('drain', () => readable.resume());
  }
});
```

**Senior Note:** This is a very common real production bug: piping a fast database read stream into a slow network write (e.g., a slow client downloading a large export) without backpressure handling can spike server memory as Node buffers unsent data. Always prefer `.pipe()` or the promise-based `stream/promises` `pipeline()` over manual `.on('data')` handling unless you have a specific reason not to.

---

## Question 28: What is a `Buffer`, and how does it differ from a regular array?

A `Buffer` is Node's way of handling raw binary data — a fixed-size chunk of memory allocated outside the V8 heap (in earlier Node versions) or as a special typed-array-backed structure (modern Node), used for things like file I/O, network protocols, and binary parsing.

```javascript
const buf = Buffer.from('hello', 'utf8');
console.log(buf); // <Buffer 68 65 6c 6c 6f> — raw bytes, not characters
console.log(buf.toString('utf8')); // 'hello'
console.log(buf.length); // 5 (byte length, not "character count" for multi-byte encodings)

// Buffers are fixed-length and don't auto-resize like arrays
const buf2 = Buffer.alloc(10); // 10 zero-filled bytes
buf2.write('hi'); // writes only 2 bytes, rest stays zero
```

**Senior Note:** `Buffer.allocUnsafe()` skips zero-filling for performance — faster, but can expose old memory contents if you don't immediately overwrite the whole buffer. Using it incorrectly is a real (if now well-known) security footgun; prefer `Buffer.alloc()` unless you've profiled and genuinely need the speed, and even then, only when you're certain the buffer will be fully overwritten.

---

## Question 29: How should errors be handled when chaining piped streams?

```javascript
// BAD: .pipe() does NOT forward errors between streams automatically
readable.pipe(transform).pipe(writable);
readable.on('error', handleErr); // must attach to EVERY stream in the chain manually — easy to miss one

// GOOD: use pipeline() (from stream/promises or stream.pipeline callback form)
const { pipeline } = require('stream/promises');

async function processFile() {
  try {
    await pipeline(
      fs.createReadStream('input.csv'),
      zlib.createGzip(),
      fs.createWriteStream('output.csv.gz')
    );
    console.log('Pipeline succeeded');
  } catch (err) {
    console.error('Pipeline failed:', err); // ANY stream's error lands here
    // pipeline() also automatically destroys all streams in the chain on failure —
    // preventing file descriptor / socket leaks
  }
}
```

**Senior Note:** Before `pipeline()` existed (Node 10+), a very common production bug was leaked file descriptors from a mid-chain stream erroring out without being explicitly `.destroy()`'d — `pipeline()` guarantees cleanup of every stream in the chain regardless of where the failure occurs.

---

## Question 30: Worker Threads vs. `cluster` vs. `child_process` — when do you use each?

- **`cluster`**: forks multiple full Node **processes**, each with its own event loop, sharing the same server port (load-balanced by the OS/master). Best for scaling an HTTP server across CPU cores.
- **Worker Threads**: run JS in parallel **threads within the same process**, can share memory via `SharedArrayBuffer`. Best for CPU-bound work (image processing, heavy computation) without spinning up a whole new process.
- **`child_process`**: spawns an entirely separate OS process (can even run non-Node executables). Best for running external programs or fully isolating untrusted/crash-prone code.

```javascript
// Worker Threads — CPU-bound task, same process, can share memory
const { Worker } = require('worker_threads');

function runHeavyComputation(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./heavy-task.js', { workerData: data });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

```javascript
// cluster — scale an HTTP server across CPU cores
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  os.cpus().forEach(() => cluster.fork());
} else {
  require('./server'); // each worker process runs its own copy of the server
}
```

**Senior Note:** Worker Threads have ~5-10ms startup overhead and their own V8 instance/heap (not free) — for short-lived tasks, a worker pool (reusing workers) is essential; spawning a new Worker per request is a common performance anti-pattern. Libraries like `piscina` implement this pooling correctly.

---

## Question 31: What are `SharedArrayBuffer` and `Atomics`, and when are they necessary?

`SharedArrayBuffer` allows genuine shared memory between the main thread and Worker Threads — unlike `postMessage` (which copies/structured-clones data), both threads see the *same* underlying memory. `Atomics` provides thread-safe operations on that shared memory, preventing race conditions.

```javascript
// main.js
const { Worker } = require('worker_threads');
const sab = new SharedArrayBuffer(4); // 4 bytes = one Int32
const sharedArray = new Int32Array(sab);
Atomics.store(sharedArray, 0, 0);

const worker = new Worker('./increment.js', { workerData: sab });

// increment.js
const sharedArray = new Int32Array(workerData);
for (let i = 0; i < 1000; i++) {
  Atomics.add(sharedArray, 0, 1); // atomic increment — safe even with concurrent access
}
// Without Atomics.add, a plain sharedArray[0]++ from multiple threads
// would race and lose increments (read-modify-write is NOT atomic by default)
```

**Senior Note:** This is genuinely advanced/rare in typical backend work — most Node concurrency needs are solved by `cluster` (process isolation, no shared state needed) rather than true shared-memory threading. Reach for `SharedArrayBuffer`/`Atomics` only when you specifically need high-throughput shared state across threads (e.g., a shared counter/buffer in a high-performance computation pipeline), since it reintroduces classic multi-threaded race-condition risk that Node's single-threaded model otherwise avoids entirely.

---

## Question 32: What is Prototype Pollution, and how do you defend against it?

Prototype pollution occurs when untrusted input is used to set properties on `Object.prototype` itself (usually via `__proto__`, `constructor.prototype`, or unsafe deep-merge/clone utilities) — which then affects **every object** in the application, since they all inherit from `Object.prototype`.

```javascript
// VULNERABLE: naive deep merge
function merge(target, source) {
  for (const key in source) {
    if (typeof source[key] === 'object') {
      target[key] = merge(target[key] || {}, source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

const malicious = JSON.parse('{"__proto__": {"isAdmin": true}}');
merge({}, malicious);

console.log({}.isAdmin); // true — EVERY plain object now has isAdmin!
console.log(({}).isAdmin); // still true, application-wide contamination
```

**Defenses:**
```javascript
// 1. Guard against dangerous keys explicitly
function safeMerge(target, source) {
  const DANGEROUS_KEYS = ['__proto__', 'constructor', 'prototype'];
  for (const key in source) {
    if (DANGEROUS_KEYS.includes(key)) continue; // skip
    // ... rest of merge logic
  }
  return target;
}

// 2. Use Object.create(null) for objects that will hold untrusted keys — no prototype to pollute
const safeMap = Object.create(null);

// 3. Use Map instead of plain objects for untrusted key-value data
const safeStore = new Map();
```

**Senior Note:** This was a real, high-severity vulnerability class found in popular npm packages (`lodash.merge`, `minimist`, others had CVEs for exactly this). Always keep dependencies patched, and treat any function that recursively merges user-controlled JSON as a security-sensitive code path requiring explicit key filtering — not just a convenience utility.

---

## Question 33: What is ReDoS (Regular Expression Denial of Service)?

Certain regex patterns have **catastrophic backtracking** — their matching time grows exponentially with input length for specific "evil" inputs, allowing an attacker to freeze your single-threaded event loop with a small malicious string.

```javascript
// VULNERABLE: nested quantifiers cause catastrophic backtracking
const evilRegex = /^(a+)+$/;

const maliciousInput = 'a'.repeat(30) + '!'; // just 31 characters
evilRegex.test(maliciousInput); // can take seconds to minutes — blocks the ENTIRE event loop
                                   // no other request can be processed on this process during this time
```

**Defenses:**
```javascript
// 1. Avoid nested/overlapping quantifiers — rewrite to be unambiguous
const safeRegex = /^a+$/; // no ambiguity in how 'a's are grouped, no backtracking blowup

// 2. Use a regex complexity linter
// npm install eslint-plugin-security — flags common ReDoS patterns automatically

// 3. For untrusted input, enforce a length limit BEFORE regex testing
function safeTest(regex, input, maxLength = 1000) {
  if (input.length > maxLength) throw new Error('Input too long');
  return regex.test(input);
}
```

**Senior Note:** Because JS is single-threaded, a ReDoS attack doesn't just slow down one request — it freezes the *entire process*, taking down every concurrent request being served by that worker. This is precisely why it's rated as a serious vulnerability class (CWE-1333) rather than a minor performance nuisance, and why regex used on any user-controllable input (email validation, search queries) deserves real scrutiny.

---

## Question 34: How and when would you tune `UV_THREADPOOL_SIZE`?

Recall from Q4 that `fs`, DNS lookups, and some `crypto` operations share a libuv thread pool, default size **4**. If your app does heavy concurrent file I/O or CPU-bound crypto (like `bcrypt` or `pbkdf2` hashing), requests can queue up waiting for a free thread pool slot even though your CPU has more cores available.

```javascript
// Must be set BEFORE any part of Node that initializes the thread pool runs —
// typically as an environment variable, not inside your app code
// UV_THREADPOOL_SIZE=8 node server.js

// Diagnosing the problem: if bcrypt calls start queueing under load,
// you'll see growing latency on hash operations even though CPU usage is well under 100%
const bcrypt = require('bcrypt');

async function hashPasswords(passwords) {
  // With pool size 4, only 4 of these run concurrently — the rest QUEUE, even if idle CPU cores exist
  return Promise.all(passwords.map((p) => bcrypt.hash(p, 10)));
}
```

**Senior Note:** Don't blindly max this out — the thread pool competes for the same CPU cores as your main event loop thread and any Worker Threads you've spun up. Tune it based on actual profiling (are thread-pool-bound ops queueing under real load?) rather than guessing, and remember it must be set via environment variable before the Node process starts, not via `process.env` inside your script (too late — the pool's already initialized).

---

## Question 35: What is `AsyncLocalStorage`, and what problem does it solve?

`AsyncLocalStorage` lets you maintain context (like a request ID or user session) across an entire async call chain — without manually threading a parameter through every function call. It's Node's answer to "thread-local storage" for async code.

```javascript
const { AsyncLocalStorage } = require('async_hooks');
const asyncLocalStorage = new AsyncLocalStorage();

function middleware(req, res, next) {
  const store = { requestId: crypto.randomUUID(), userId: req.user?.id };
  asyncLocalStorage.run(store, () => next()); // everything inside next()'s async chain sees this store
}

function logger(message) {
  const store = asyncLocalStorage.getStore();
  console.log(`[${store?.requestId}] ${message}`); // works even deep inside nested async calls,
                                                       // with NO requestId parameter passed anywhere
}

// Deep in some service, 3 layers of async calls away from the middleware:
async function processOrder(orderId) {
  logger(`Processing order ${orderId}`); // still has the correct requestId, automatically
}
```

**Senior Note:** Before `AsyncLocalStorage`, achieving request-scoped context in Node required either manually passing a context object through every function signature (invasive) or fragile workarounds using `domain` (deprecated) or continuation-local-storage packages built on hacky monkey-patching. This is now the standard, correct way to implement per-request logging/tracing context in production Node services — used internally by many APM tools.

---

## Question 36: What's the correct production strategy for `uncaughtException` and `unhandledRejection`?

The safe default: **log, and then exit the process** — don't try to "recover" and keep running, because after an uncaught synchronous exception, the process is in an unknown, potentially corrupted state.

```javascript
process.on('uncaughtException', (err, origin) => {
  logger.fatal('Uncaught Exception', { err, origin });
  // Give logs time to flush, then exit — let your process manager (PM2, Kubernetes) restart it
  gracefulShutdown(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  logger.fatal('Unhandled Rejection', { reason });
  gracefulShutdown(() => process.exit(1));
});

function gracefulShutdown(callback) {
  server.close(() => callback()); // stop accepting new connections, let in-flight ones finish
  setTimeout(() => callback(), 10000); // force-exit if shutdown hangs too long
}
```

**Senior Note:** Relying on these handlers as a primary safety net is itself an anti-pattern — they're a last-resort catch, not a substitute for proper `try/catch` and `.catch()` at the actual error sites. In a load-balanced/clustered production setup (Q30, Q50), one process crashing and restarting is fine — the load balancer routes around it — which is precisely why "log and exit" beats "log and pray it still works."

---

## Question 37: How do you take a heap dump from a live production process without restarting it?

```javascript
// Option 1: trigger via a Unix signal, no code changes needed if you set this up ahead of time
process.on('SIGUSR2', () => {
  const v8 = require('v8');
  const fs = require('fs');
  const filename = `heapdump-${Date.now()}.heapsnapshot`;
  const stream = v8.getHeapSnapshot();
  const file = fs.createWriteStream(filename);
  stream.pipe(file);
  console.log(`Heap dump written to ${filename}`);
});

// Trigger from the shell without stopping the process:
// kill -USR2 <pid>
```

```javascript
// Option 2: the heapdump npm package (older Node versions, simpler API)
const heapdump = require('heapdump');
heapdump.writeSnapshot('/tmp/heapdump.heapsnapshot');
```

**Senior Note:** Being able to capture diagnostics from a live, misbehaving production process — without restarting it and losing the exact leaking state you're trying to catch — is a core production-debugging skill. Combine this with a memory-threshold watchdog (e.g., trigger a dump automatically if RSS exceeds a threshold) for catching leaks that only manifest under real production load, which is often impossible to reproduce locally.

---

## Question 38: What does a proper graceful shutdown look like, and why does it matter?

When a process receives `SIGTERM` (what Kubernetes/Docker/PM2 send before killing a container), abruptly exiting drops any in-flight requests and can leave database connections/transactions in a bad state.

```javascript
const server = app.listen(3000);
let isShuttingDown = false;

process.on('SIGTERM', async () => {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log('SIGTERM received, starting graceful shutdown');

  // 1. Stop accepting NEW connections
  server.close(async () => {
    console.log('HTTP server closed — no more new requests');

    // 2. Close DB pools, message queue connections, etc. cleanly
    await dbPool.end();
    await redisClient.quit();

    console.log('Cleanup complete, exiting');
    process.exit(0);
  });

  // 3. Force-exit safety net if shutdown hangs (e.g., a stuck connection)
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 15000);
});
```

Health check endpoints should also reflect shutdown state so a load balancer stops routing new traffic immediately:

```javascript
app.get('/health', (req, res) => {
  if (isShuttingDown) return res.status(503).send('Shutting down');
  res.status(200).send('OK');
});
```

**Senior Note:** In Kubernetes specifically, there's a race condition to be aware of: the pod is removed from the Service's endpoint list asynchronously with the `SIGTERM` being sent, so a brief window exists where new traffic can still arrive after shutdown begins — which is exactly why `server.close()` (finish in-flight, refuse new) rather than an immediate `process.exit()` is essential, not optional polish.

---

## Question 39: Implement and explain the Factory Pattern in a Node.js context.

A Factory centralizes object creation logic — useful when construction is conditional or involves setup logic you don't want scattered across the codebase.

```javascript
class PostgresConnector { connect() { console.log('Connecting to Postgres...'); } }
class MongoConnector { connect() { console.log('Connecting to MongoDB...'); } }

class DatabaseFactory {
  static create(type) {
    switch (type) {
      case 'postgres': return new PostgresConnector();
      case 'mongo': return new MongoConnector();
      default: throw new Error(`Unknown database type: ${type}`);
    }
  }
}

const db = DatabaseFactory.create(process.env.DB_TYPE);
db.connect();
```

**Senior Note:** This pattern is genuinely everywhere in backend frameworks — think of Express's `express()` call itself, or an ORM's connection creation based on a config-driven dialect. The value is decoupling "what gets created" from "how the caller uses it" — callers depend only on the common interface (`.connect()`), never on the concrete class.

---

## Question 40: Implement the Singleton Pattern, and explain why Node modules are singletons by default.

```javascript
class DatabasePool {
  static #instance;

  constructor() {
    if (DatabasePool.#instance) {
      throw new Error('Use DatabasePool.getInstance()');
    }
    this.connections = [];
  }

  static getInstance() {
    if (!DatabasePool.#instance) {
      DatabasePool.#instance = new DatabasePool();
    }
    return DatabasePool.#instance;
  }
}

const pool1 = DatabasePool.getInstance();
const pool2 = DatabasePool.getInstance();
console.log(pool1 === pool2); // true — same instance
```

In practice, you rarely need this class-based pattern in Node, because CommonJS modules are cached by file path — `require()`-ing the same module twice returns the exact same object reference:

```javascript
// db.js
module.exports = { connections: [] }; // module.exports object is created ONCE

// fileA.js
const db = require('./db'); // same object reference
// fileB.js
const db = require('./db'); // same object reference — Node's module cache IS the singleton
```

**Senior Note:** This module-caching-as-singleton behavior is exactly why a naive in-memory rate limiter or cache "just works" across your whole app without extra plumbing — but it's also why the same pattern breaks silently in a multi-process `cluster` setup (Q30, Q50): each process has its OWN module cache, so "singleton" only holds true within a single process, not across your whole running application.

---

## Question 41: How does JavaScript's `Proxy` object work, and where is it useful in backend code?

`Proxy` lets you intercept and customize fundamental operations (property get/set, deletion, function calls) on an object via "traps."

```javascript
function createValidatedConfig(target) {
  return new Proxy(target, {
    set(obj, prop, value) {
      if (prop === 'port' && (typeof value !== 'number' || value < 1 || value > 65535)) {
        throw new TypeError('port must be a number between 1 and 65535');
      }
      obj[prop] = value;
      return true;
    },
    get(obj, prop) {
      if (!(prop in obj)) {
        console.warn(`Warning: accessing undefined config key "${String(prop)}"`);
      }
      return obj[prop];
    },
  });
}

const config = createValidatedConfig({ port: 3000 });
config.port = 8080; // fine
config.port = 'oops'; // throws TypeError immediately
config.missingKey; // logs a warning, returns undefined
```

**Senior Note:** ORMs and validation libraries use this pattern extensively for building "magic" model objects — e.g., intercepting property access to lazily load a related database record only when actually accessed. It's powerful but has a real performance cost (every property access now runs through the trap function) — profile before using it on hot-path objects accessed millions of times per second.

---

## Question 42: Implement a Decorator Pattern for adding behavior (like logging or caching) to functions.

```javascript
// A decorator (higher-order function) that adds logging without modifying the original function
function withLogging(fn) {
  return async function (...args) {
    const start = Date.now();
    console.log(`Calling ${fn.name} with`, args);
    try {
      const result = await fn(...args);
      console.log(`${fn.name} completed in ${Date.now() - start}ms`);
      return result;
    } catch (err) {
      console.log(`${fn.name} failed after ${Date.now() - start}ms`);
      throw err;
    }
  };
}

function withCache(fn) {
  const cache = new Map();
  return async function (...args) {
    const key = JSON.stringify(args);
    if (cache.has(key)) return cache.get(key);
    const result = await fn(...args);
    cache.set(key, result);
    return result;
  };
}

async function fetchUser(id) { /* expensive DB call */ }

// Decorators compose cleanly — order matters (outermost runs first)
const enhancedFetchUser = withLogging(withCache(fetchUser));
```

**Senior Note:** This is functionally identical in spirit to Express middleware chains and to real TC39 decorator syntax (`@logged` class method decorators, now stable in recent JS) — recognizing "wrap a function, preserve its interface, add cross-cutting behavior" as the core idea is more valuable than any specific syntax, since you'll see this pattern under many different names across frameworks.

---

## Question 43: How does Node's `EventEmitter` work internally, and what are common pitfalls?

`EventEmitter` maintains a map of event names to arrays of listener functions. `.emit()` synchronously calls each registered listener, in registration order.

```javascript
const EventEmitter = require('events');

class OrderService extends EventEmitter {
  async createOrder(data) {
    const order = await db.orders.create(data);
    this.emit('order:created', order); // synchronous — all listeners run before this line returns
    return order;
  }
}

const orders = new OrderService();
orders.on('order:created', (order) => sendConfirmationEmail(order));
orders.on('order:created', (order) => updateInventory(order));
```

**Common pitfalls:**
```javascript
// 1. Unhandled 'error' events THROW and crash the process — a special-cased event name
const emitter = new EventEmitter();
emitter.emit('error', new Error('boom')); // throws uncaught if no 'error' listener exists!

// 2. Memory leak via unremoved listeners (Q17)
function handleRequest(req) {
  someEmitter.on('data', () => processData(req)); // never removed — accumulates forever
}
// Fix: use .once() if it should only fire once, or explicitly .removeListener()

// 3. Async listeners don't block emit() or propagate errors back to the emitter
emitter.on('order:created', async (order) => {
  throw new Error('this becomes an unhandled rejection, NOT caught by emit()');
});
```

**Senior Note:** The `'error'` event special-case (pitfall #1) trips up even experienced engineers — it's a deliberate Node design choice (borrowed from EventEmitter's original C++/Java-influenced design intent) meaning "errors must always be handled," but it's surprising if you don't know it, and has caused real production crashes from a single missing `.on('error', ...)`.

---

## Question 44: Explain Node's module caching (`require.cache`) and its practical implications.

The first time a module is `require()`'d, Node executes it and caches the resulting `module.exports` keyed by the resolved absolute file path. Every subsequent `require()` of that same path returns the cached object instantly — the file is never re-executed.

```javascript
// counter.js
let count = 0;
module.exports = {
  increment: () => ++count,
  getCount: () => count,
};

// a.js
const counter = require('./counter');
counter.increment();

// b.js
const counter = require('./counter'); // SAME cached instance as in a.js
console.log(counter.getCount()); // 1 — state persisted across files, because it's the same object
```

You can inspect/manipulate the cache directly (mainly useful for testing):

```javascript
console.log(Object.keys(require.cache)); // all currently cached module paths

// Force re-execution of a module (e.g., in tests needing a fresh instance)
delete require.cache[require.resolve('./counter')];
const freshCounter = require('./counter'); // re-executes counter.js from scratch
```

**Senior Note:** Circular `require()` dependencies exploit (and are limited by) this exact caching mechanism — if `a.js` requires `b.js` which requires `a.js` back, the second require of `a.js` returns whatever `module.exports` had been set to *at that point in a.js's execution* (possibly incomplete/partial), not the final version — a classic source of "why is this import undefined" bugs in larger codebases with tangled dependencies.

---

## Question 45: How does the Express.js middleware pattern work, and how would you implement it yourself?

Middleware is a chain of functions, each receiving `(req, res, next)`, where calling `next()` passes control to the next function in the chain — effectively the Chain of Responsibility design pattern.

```javascript
// A minimal middleware engine, to show what Express does conceptually
class MiniApp {
  constructor() { this.middlewares = []; }

  use(fn) { this.middlewares.push(fn); }

  async handle(req, res) {
    let index = 0;
    const next = async (err) => {
      if (err) return this.handleError(err, res);
      const middleware = this.middlewares[index++];
      if (!middleware) return; // end of chain
      try {
        await middleware(req, res, next);
      } catch (e) {
        next(e); // sync AND async throws both route to error handling
      }
    };
    await next();
  }

  handleError(err, res) {
    res.statusCode = 500;
    res.end(`Error: ${err.message}`);
  }
}

const app = new MiniApp();
app.use(async (req, res, next) => { console.log('Logging request'); await next(); });
app.use(async (req, res, next) => { req.user = { id: 1 }; await next(); }); // "auth"
app.use(async (req, res) => { res.end(`Hello, user ${req.user.id}`); });
```

**Senior Note:** Understanding this pattern deeply means understanding *why* middleware order matters (auth middleware must run before the handler that needs `req.user`), why a forgotten `next()` call hangs the request forever, and why error-handling middleware in real Express (`(err, req, res, next)` — 4 args) is specially recognized by the framework based purely on function arity.

---

## Question 46: What is Dependency Injection, and how is it typically done in Node without a heavy framework?

Dependency Injection means a component receives its dependencies from outside, rather than constructing them itself — improving testability (you can inject mocks) and decoupling.

```javascript
// WITHOUT DI - tightly coupled, hard to test (can't easily swap the real DB)
class UserService {
  constructor() {
    this.db = new PostgresClient(process.env.DATABASE_URL); // hardcoded dependency
  }
  async getUser(id) { return this.db.query('SELECT * FROM users WHERE id = $1', [id]); }
}

// WITH DI - dependencies passed in, easy to test with a mock db
class UserService {
  constructor(db) { this.db = db; } // injected
  async getUser(id) { return this.db.query('SELECT * FROM users WHERE id = $1', [id]); }
}

// Production wiring:
const db = new PostgresClient(process.env.DATABASE_URL);
const userService = new UserService(db);

// Test wiring — no real database needed:
const mockDb = { query: jest.fn().mockResolvedValue({ id: 1, name: 'Test User' }) };
const testUserService = new UserService(mockDb);
```

**Senior Note:** Node doesn't need a heavyweight DI container (like Java's Spring) for most apps — a simple "composition root" (one file that constructs all your real dependencies and wires them together at startup) achieves the same testability benefit with far less magic/indirection. Reach for a DI framework (`inversify`, `tsyringe`) only once manual wiring genuinely becomes unwieldy across a large codebase — not as a default starting point.

---

## Question 47: Implement a basic Circuit Breaker pattern for calling an unreliable downstream service.

A circuit breaker stops calling a failing downstream service after repeated failures — "opening the circuit" — to avoid piling up slow/failing requests and to give the downstream service time to recover.

```javascript
class CircuitBreaker {
  constructor(fn, { failureThreshold = 5, resetTimeoutMs = 30000 } = {}) {
    this.fn = fn;
    this.failureThreshold = failureThreshold;
    this.resetTimeoutMs = resetTimeoutMs;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED = normal, OPEN = failing fast, HALF_OPEN = testing recovery
    this.nextAttempt = Date.now();
  }

  async call(...args) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit is OPEN — failing fast without calling downstream');
      }
      this.state = 'HALF_OPEN'; // allow one test request through
    }

    try {
      const result = await this.fn(...args);
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  onSuccess() {
    this.failureCount = 0;
    this.state = 'CLOSED';
  }

  onFailure() {
    this.failureCount++;
    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttempt = Date.now() + this.resetTimeoutMs;
    }
  }
}

const breaker = new CircuitBreaker(callPaymentGateway, { failureThreshold: 3, resetTimeoutMs: 10000 });
await breaker.call(orderData);
```

**Senior Note:** This pattern is essential in microservice architectures specifically because without it, a single slow/failing downstream dependency can cause cascading failure — your service's threads/connections pile up waiting on the slow dependency, exhausting your own resources and taking YOUR service down too, even though the actual root cause is elsewhere.

---

## Question 48: What is `AbortController`, and how do you use it to make async operations cancellable?

`AbortController` provides a standard way to signal cancellation to an in-progress async operation (originally designed for `fetch`, now supported broadly across Node's APIs).

```javascript
const controller = new AbortController();
const { signal } = controller;

async function fetchWithTimeout(url, timeoutMs) {
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId);
    return response;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Request to ${url} timed out after ${timeoutMs}ms`);
    }
    throw err;
  }
}

// Cancelling a long-running database query or a manual promise chain:
function cancellableDelay(ms, signal) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Operation was aborted'));
    });
  });
}
```

**Senior Note:** Before `AbortController` was standardized in Node, cancellation was handled with ad-hoc flags/callbacks per-library, with no consistent interface. Now it's used across `fetch`, streams, and many database drivers — recognizing it as the standard cancellation primitive (rather than reinventing a `cancelled` boolean flag pattern) is expected at the senior level.

---

## Question 49: What are Async Generators, and where would you use `for await...of` in backend code?

Async generators (`async function*`) produce a stream of values over time, each potentially requiring an `await` — ideal for paginated API consumption or processing large datasets without loading everything into memory at once.

```javascript
async function* fetchAllUsersPaginated(apiClient) {
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await apiClient.get(`/users?page=${page}`);
    yield* response.data.users; // yield each user individually, not the whole page array
    hasMore = response.data.hasNextPage;
    page++;
  }
}

// Consumer code stays simple, and only holds ONE page in memory at a time:
async function processAllUsers(apiClient) {
  for await (const user of fetchAllUsersPaginated(apiClient)) {
    await sendNewsletter(user); // processes one user at a time, across all pages, transparently
  }
}
```

This also composes naturally with Node streams, since Readable streams themselves are async-iterable:

```javascript
const readline = require('readline');
const fileStream = fs.createReadStream('huge-log-file.txt');
const rl = readline.createInterface({ input: fileStream });

for await (const line of rl) {
  if (line.includes('ERROR')) processErrorLine(line); // one line in memory at a time
}
```

**Senior Note:** This pattern directly solves a common real-world problem — consuming a paginated third-party API or processing a huge log/CSV file — without either loading everything into memory (`Array.prototype` methods) or manually managing page/offset state in imperative loops scattered throughout your codebase. It's the cleanest way to express "a sequence of values that arrive over time" in modern JS.

---

## Question 50: Design a strategy for scaling a Node.js API server across multiple CPU cores in production.

Since a single Node process only uses one CPU core (JS main thread), fully utilizing a multi-core server requires running multiple processes — typically via `cluster` or, more commonly in modern deployments, external orchestration.

```javascript
// Approach A: Node's built-in cluster module
const cluster = require('cluster');
const os = require('os');

if (cluster.isPrimary) {
  const numCPUs = os.cpus().length;
  console.log(`Primary ${process.pid} forking ${numCPUs} workers`);

  for (let i = 0; i < numCPUs; i++) cluster.fork();

  cluster.on('exit', (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died, forking a replacement`);
    cluster.fork(); // self-healing — replace crashed workers automatically
  });
} else {
  require('./server'); // each worker is a full, independent copy of your app
}
```

```yaml
# Approach B: let the orchestrator handle it (far more common in real production today)
# Kubernetes Deployment - run N single-process Pods instead of clustering inside one process
apiVersion: apps/v1
kind: Deployment
spec:
  replicas: 4  # 4 separate Pods, each a plain single-process Node server
  template:
    spec:
      containers:
        - name: api
          image: my-api:latest
          resources:
            limits: { cpu: "1" } # one Pod per core, scheduled by Kubernetes across nodes
```

**Senior Note:** In modern cloud-native deployments, Approach B (external orchestration: Kubernetes replicas, or PM2 in cluster mode on a single VM) is usually preferred over Node's built-in `cluster` module — it decouples scaling from your application code, works uniformly whether you're scaling across cores on one machine or across entire machines, and lets the orchestrator handle health checks, rolling restarts, and auto-healing rather than reimplementing that logic in `cluster.on('exit', ...)`. Know `cluster` conceptually (it WILL come up in interviews), but be ready to explain why most teams now reach for it less often than they did five years ago.

---

## Final Notes for Interview Prep

- **Don't just memorize these answers** — for each one, be ready to explain it in your own words and connect it to a real bug or decision you've made, even a small one from personal projects. Interviewers can tell memorized answers apart from understood ones by asking one follow-up "why" question.
- **The Senior Notes are a roadmap, not a requirement** — at 1 year of experience, solid command of the core explanation + code example for each question is a strong showing. Being aware of the Senior Note territory (even if you can't go deep yet) signals growth trajectory, which interviewers value highly at your level.
- **Practice explaining out loud**, not just reading — technical interviews test communication as much as knowledge. Try explaining Q3 (event loop) and Q17 (memory leaks) to a rubber duck or a friend; they're the two most commonly asked in practice.
