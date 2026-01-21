/**
 * 加密密鑰管理
 * 簡化的密鑰派生和管理系統
 * 使用 Web Crypto API（原生支援，無依賴）
 */

const CRYPTO_CONFIG = {
  // 主密鑰衍生參數
  SALT: 'hkjra-rs-system-2025',
  ITERATIONS: 100000,
  KEY_LENGTH: 32, // 256 bits
  
  // 儲存密鑰位置
  KEY_STORAGE: 'rs-system-encryption-key'
};

class CryptoKeyManager {
  constructor() {
    this.masterKey = null;
    this.isReady = false;
  }

  /**
   * 初始化密鑰系統
   * 從密碼派生主密鑰
   */
  async init(password = null) {
    try {
      // 如果沒有提供密碼，使用預設值（開發用）
      const pwd = password || 'default-rs-system-key';
      
      // 使用 PBKDF2 派生密鑰
      this.masterKey = await this._deriveKey(pwd);
      this.isReady = true;
      
      console.log('✅ 加密系統已初始化');
      return true;
    } catch (err) {
      console.error('❌ 密鑰初始化失敗:', err);
      return false;
    }
  }

  /**
   * 從密碼派生密鑰
   * @private
   */
  async _deriveKey(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const saltData = encoder.encode(CRYPTO_CONFIG.SALT);
    
    const key = await window.crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    const bits = await window.crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: saltData,
        iterations: CRYPTO_CONFIG.ITERATIONS,
        hash: 'SHA-256'
      },
      key,
      CRYPTO_CONFIG.KEY_LENGTH * 8
    );
    
    return await window.crypto.subtle.importKey(
      'raw',
      bits,
      { name: 'AES-GCM' },
      true,
      ['encrypt', 'decrypt']
    );
  }

  /**
   * 加密數據
   * @param {*} plaintext - 要加密的數據
   * @return {string} Base64 編碼的加密數據
   */
  async encrypt(plaintext) {
    if (!this.isReady || !this.masterKey) {
      console.warn('⚠️ 密鑰系統未初始化，使用 Base64 編碼');
      return btoa(JSON.stringify(plaintext));
    }

    try {
      const encoder = new TextEncoder();
      const iv = window.crypto.getRandomValues(new Uint8Array(12)); // GCM IV
      const data = encoder.encode(JSON.stringify(plaintext));
      
      const ciphertext = await window.crypto.subtle.encrypt(
        { name: 'AES-GCM', iv: iv },
        this.masterKey,
        data
      );
      
      // 結合 IV 和密文
      const combined = new Uint8Array(iv.length + ciphertext.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(ciphertext), iv.length);
      
      // 轉換為 Base64
      return btoa(String.fromCharCode(...combined));
    } catch (err) {
      console.error('❌ 加密失敗:', err);
      return btoa(JSON.stringify(plaintext)); // 降級到 Base64
    }
  }

  /**
   * 解密數據
   * @param {string} ciphertext - Base64 編碼的加密數據
   * @return {*} 解密後的數據
   */
  async decrypt(ciphertext) {
    if (!this.isReady || !this.masterKey) {
      try {
        return JSON.parse(atob(ciphertext));
      } catch {
        return null;
      }
    }

    try {
      const combined = new Uint8Array(
        atob(ciphertext).split('').map(c => c.charCodeAt(0))
      );
      
      const iv = combined.slice(0, 12);
      const encrypted = combined.slice(12);
      
      const plaintext = await window.crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: iv },
        this.masterKey,
        encrypted
      );
      
      return JSON.parse(new TextDecoder().decode(plaintext));
    } catch (err) {
      console.error('❌ 解密失敗:', err);
      return null;
    }
  }

  /**
   * 獲取系統狀態
   */
  getStatus() {
    return {
      isReady: this.isReady,
      hasKey: this.masterKey !== null,
      algorithm: 'AES-256-GCM',
      keyDerivation: 'PBKDF2-SHA256'
    };
  }
}

// 創建全局實例
const cryptoManager = new CryptoKeyManager();

// 自動初始化（使用預設密碼以相容性考慮）
document.addEventListener('DOMContentLoaded', async () => {
  await cryptoManager.init();
  console.log('🔐 加密系統狀態:', cryptoManager.getStatus());
});
