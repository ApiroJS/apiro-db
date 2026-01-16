const { readFile, writeFile } = require("./file");
const { encrypt, decrypt } = require("./crypto");

class SecureStore {
  constructor(options = {}) {
    if (!options.secret) {
      throw new Error("SecureStore requires a secret key");
    }

    this.file = options.file || "./apiro.db";
    this.secret = options.secret;
    this.data = {};
    this.ready = this._load();
  }

  async _load() {
    const encrypted = await readFile(this.file);
    if (!encrypted) return;

    try {
      const decrypted = decrypt(encrypted, this.secret);
      this.data = JSON.parse(decrypted);
    } catch {
      throw new Error("Failed to decrypt data store. Invalid secret?");
    }
  }

  async _save() {
    const json = JSON.stringify(this.data);
    const encrypted = encrypt(json, this.secret);
    await writeFile(this.file, encrypted);
  }

  async get(key) {
    await this.ready;
    return this.data[key];
  }

  async set(key, value) {
    await this.ready;
    this.data[key] = value;
    await this._save();
    return value;
  }

  async delete(key) {
    await this.ready;
    const existed = key in this.data;
    delete this.data[key];
    await this._save();
    return existed;
  }

  async add(key, amount) {
    await this.ready;
    if (typeof this.data[key] !== "number") {
      this.data[key] = 0;
    }
    this.data[key] += amount;
    await this._save();
    return this.data[key];
  }

  async subtract(key, amount) {
    return this.add(key, -amount);
  }

  async push(key, value) {
    await this.ready;
    if (!Array.isArray(this.data[key])) {
      this.data[key] = [];
    }
    this.data[key].push(value);
    await this._save();
    return this.data[key];
  }
}

module.exports = { SecureStore };
