const crypto = require("crypto");
const { readFile, writeFile } = require("./file");
const { encrypt, decrypt } = require("./crypto");
const { generateMasterKey, encryptMasterKey, decryptMasterKey } = require("./masterKey");

class SecureStore {
  constructor(options = {}) {
    this.file = options.file || "./secure.db";
    this.data = {};
    this.masterKey = null;
    this.ready = this._init();
  }

  async _init() {
    const existing = await readFile(this.file);

    if (!existing) {
      this.masterKey = crypto.randomBytes(32);
      const encryptedKey = encryptMasterKey(this.masterKey);

      const payload = encrypt(JSON.stringify({}), this.masterKey);

      await writeFile(this.file, JSON.stringify({
        _meta: { key: encryptedKey },
        payload
      }));

      return;
    }

    const parsed = JSON.parse(existing);
    this.masterKey = decryptMasterKey(parsed._meta.key);
    const decrypted = decrypt(parsed.payload, this.masterKey);
    this.data = JSON.parse(decrypted);
  }

  async _save() {
    const payload = encrypt(JSON.stringify(this.data), this.masterKey);

    await writeFile(this.file, JSON.stringify({
      _meta: { key: encryptMasterKey(this.masterKey) },
      payload
    }));
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
    if (typeof this.data[key] !== "number") this.data[key] = 0;
    this.data[key] += amount;
    await this._save();
    return this.data[key];
  }

  async subtract(key, amount) {
    return this.add(key, -amount);
  }

  async push(key, value) {
    await this.ready;
    if (!Array.isArray(this.data[key])) this.data[key] = [];
    this.data[key].push(value);
    await this._save();
    return this.data[key];
  }
}

module.exports = { SecureStore };
