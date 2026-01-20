# Apiro DB

A **fast**, **dependency-free**, **encrypted**, file-backed data store for Node.js.

Apiro DB is designed as a lightweight alternative to industry standard packages, without pulling in heavy native dependencies such as SQLite. All data is stored **encrypted at rest**, kept **in-memory for speed**, and written to disk using a **write-behind engine** for optimal performance.

---

## ✨ Features

* 🔐 **Encrypted at rest** (AES-based, Node crypto only)
* 🚀 **In-memory reads and writes** (sub-millisecond)
* 🧠 **Write-behind disk persistence** (debounced)
* 🧩 **Path-based access** (`"users.123.profile.name"`)
* 🪶 **Zero runtime dependencies**
* ⚙️ **Async-only API**
* 🔑 **Automatically generated master key**
* 📁 **Single-file database**
* 🧼 **Simple, predictable API**

---

## 📦 Installation

```bash
npm install apiro-db
```

---

## 🚀 Quick Start

```js
import { SecureStore } from "apiro-db";

const db = new SecureStore({
  file: "./data.db"
});

await db.set("users.1.name", "Alice");
await db.add("users.1.balance", 50);

console.log(await db.get("users.1"));
// { name: 'Alice', balance: 50 }
```

---

## 🗂 Path-Based Storage

All keys are treated as **paths by default**.

```js
await db.set("pages.404.title", "Page Not Found");
await db.set("pages.404.content", "<h1>404</h1>");

await db.get("pages.404.title");
// "Page Not Found"
```

Nested objects are created automatically when missing.

---

## 📘 API Reference

### `new SecureStore(options)`

```js
const db = new SecureStore({
  file: "./secure.db" // optional
});
```

| Option | Description        | Default       |
| ------ | ------------------ | ------------- |
| `file` | Database file path | `./secure.db` |

---

### `await db.get(path)`

Returns the value at the given path.

```js
await db.get("settings.theme");
```

---

### `await db.set(path, value)`

Sets a value at the given path.

```js
await db.set("settings.theme", "dark");
```

---

### `await db.has(path)`

Checks if a path exists.

```js
await db.has("users.123"); // true / false
```

---

### `await db.delete(path)`

Deletes a value at the given path.

```js
await db.delete("sessions.old");
```

Returns `true` if the value existed.

---

### `await db.add(path, number)`

Adds a number to the existing value (or initializes to `0`).

```js
await db.add("stats.visits", 1);
```

---

### `await db.subtract(path, number)`

Subtracts a number from the existing value.

```js
await db.subtract("stats.visits", 1);
```

---

### `await db.push(path, value)`

Pushes a value into an array (or initializes one).

```js
await db.push("logs", { event: "login" });
```

---

### `await db.close()`

Forces a final write to disk. Useful on shutdown.

```js
await db.close();
```

---

## 🔐 Security Model

* A **256-bit master key** is generated automatically on first run
* The master key is **encrypted and stored inside the database**
* All data payloads are encrypted using the master key
* No plaintext data is ever written to disk
* No user-supplied keys required

If the database file is copied or stolen, its contents remain unreadable.

---

## ⚡ Performance Model

* Reads and writes operate **entirely in memory**
* Disk writes are **debounced and batched**
* Encryption occurs **only on flush**
* Typical read/write latency: **sub-millisecond**
* Disk writes: **~50ms debounce window**

### Optional micro-optimization (already applied)

Path handling is always routed through internal helpers (`getByPath`, `setByPath`, `deleteByPath`) with **no conditional branching**, ensuring consistent hot-path performance.

---

## 🧠 Design Philosophy

Apiro DB prioritizes:

* Predictable behavior
* Minimal surface area
* No native dependencies
* Clear ownership of data
* Explicit async boundaries

It is ideal for:

* Bots
* Small services
* Internal tools
* Local state persistence
* Secure configuration storage

---

## 📄 License

MIT
