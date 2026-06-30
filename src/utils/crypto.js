// Utility to encrypt and decrypt sensitive data stored in local storage
// to ensure compliance with LGPDPPSO (confidentiality in storage).

const ENCRYPTION_KEY = 'mg_lgpdppso_storage_security_key_2026'

/**
 * Encrypts a value (object or string) into a base64 encrypted string.
 * @param {any} data
 * @returns {string}
 */
export function encrypt(data) {
  if (data === null || data === undefined) return ''
  const plainText = typeof data === 'object' ? JSON.stringify(data) : String(data)

  let cipherText = ''
  for (let i = 0; i < plainText.length; i++) {
    const charCode = plainText.charCodeAt(i)
    const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
    // XOR character with key character
    const encryptedChar = charCode ^ keyChar
    cipherText += String.fromCharCode(encryptedChar)
  }

  // Safe base64 encoding for unicode characters
  return btoa(unescape(encodeURIComponent(cipherText)))
}

/**
 * Decrypts an encrypted base64 string back to its original value.
 * @param {string} cipherText
 * @returns {any}
 */
export function decrypt(cipherText) {
  if (!cipherText) return null
  try {
    // Decode base64
    const raw = decodeURIComponent(escape(atob(cipherText)))
    let plainText = ''
    for (let i = 0; i < raw.length; i++) {
      const charCode = raw.charCodeAt(i)
      const keyChar = ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length)
      const decryptedChar = charCode ^ keyChar
      plainText += String.fromCharCode(decryptedChar)
    }

    // Attempt parsing as JSON, fallback to plain string
    try {
      return JSON.parse(plainText)
    } catch {
      return plainText
    }
  } catch (err) {
    console.error('Error decrypting local storage data:', err)
    return null
  }
}
