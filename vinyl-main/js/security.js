/**
 * Wax Encounters - Data Security & Encryption System
 * Implements AES-256-GCM encryption for user data protection
 * Complies with GDPR, CCPA, and international privacy standards
 */

class WaxEncountersSecurity {
    constructor() {
        this.algorithm = 'AES-GCM';
        this.keyLength = 256;
        this.ivLength = 12;
        this.tagLength = 128;
        this.iterations = 100000; // PBKDF2 iterations
        this.saltLength = 32;
    }

    /**
     * Generate a cryptographically secure random key
     */
    async generateKey() {
        return await window.crypto.subtle.generateKey(
            {
                name: this.algorithm,
                length: this.keyLength
            },
            true, // extractable
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Derive key from password using PBKDF2
     */
    async deriveKeyFromPassword(password, salt) {
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            'PBKDF2',
            false,
            ['deriveBits', 'deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: this.iterations,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: this.algorithm, length: this.keyLength },
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Generate random salt
     */
    generateSalt() {
        return window.crypto.getRandomValues(new Uint8Array(this.saltLength));
    }

    /**
     * Generate random IV
     */
    generateIV() {
        return window.crypto.getRandomValues(new Uint8Array(this.ivLength));
    }

    /**
     * Encrypt sensitive user data
     */
    async encryptUserData(data, password) {
        try {
            const encoder = new TextEncoder();
            const salt = this.generateSalt();
            const iv = this.generateIV();
            
            // Derive key from password
            const key = await this.deriveKeyFromPassword(password, salt);
            
            // Encrypt data
            const encryptedData = await window.crypto.subtle.encrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                    tagLength: this.tagLength
                },
                key,
                encoder.encode(JSON.stringify(data))
            );

            // Combine salt, iv, and encrypted data
            const combined = new Uint8Array(salt.length + iv.length + encryptedData.byteLength);
            combined.set(salt, 0);
            combined.set(iv, salt.length);
            combined.set(new Uint8Array(encryptedData), salt.length + iv.length);

            // Convert to base64 for storage
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt user data');
        }
    }

    /**
     * Decrypt user data
     */
    async decryptUserData(encryptedData, password) {
        try {
            const decoder = new TextDecoder();
            
            // Convert from base64
            const combined = new Uint8Array(
                atob(encryptedData).split('').map(char => char.charCodeAt(0))
            );

            // Extract salt, iv, and encrypted data
            const salt = combined.slice(0, this.saltLength);
            const iv = combined.slice(this.saltLength, this.saltLength + this.ivLength);
            const encrypted = combined.slice(this.saltLength + this.ivLength);

            // Derive key from password
            const key = await this.deriveKeyFromPassword(password, salt);

            // Decrypt data
            const decryptedData = await window.crypto.subtle.decrypt(
                {
                    name: this.algorithm,
                    iv: iv,
                    tagLength: this.tagLength
                },
                key,
                encrypted
            );

            return JSON.parse(decoder.decode(decryptedData));
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt user data');
        }
    }

    /**
     * Hash password securely
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Generate secure session token
     */
    generateSessionToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Sanitize user input to prevent XSS
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    }

    /**
     * Validate IBAN format
     */
    validateIBAN(iban) {
        const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/;
        return ibanRegex.test(iban.replace(/\s/g, ''));
    }

    /**
     * Validate BIC/SWIFT format
     */
    validateBIC(bic) {
        const bicRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
        return bicRegex.test(bic);
    }

    /**
     * Secure data transmission preparation
     */
    async prepareSecureData(userData, password) {
        // Separate sensitive and non-sensitive data
        const sensitiveData = {
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            shippingAddress: userData.shippingAddress,
            iban: userData.iban,
            bic: userData.bic,
            bankAccountOwner: userData.bankAccountOwner
        };

        const nonSensitiveData = {
            registrationDate: new Date().toISOString(),
            termsAccepted: userData.termsAccepted,
            privacyAccepted: userData.privacyAccepted,
            emailVerified: false,
            accountStatus: 'pending_verification'
        };

        // Encrypt sensitive data
        const encryptedSensitiveData = await this.encryptUserData(sensitiveData, password);
        
        // Hash password
        const hashedPassword = await this.hashPassword(password);

        return {
            encryptedData: encryptedSensitiveData,
            nonSensitiveData: nonSensitiveData,
            hashedPassword: hashedPassword,
            securityMetadata: {
                encryptionAlgorithm: this.algorithm,
                keyDerivation: 'PBKDF2',
                iterations: this.iterations,
                saltLength: this.saltLength,
                ivLength: this.ivLength,
                tagLength: this.tagLength,
                encryptedAt: new Date().toISOString()
            }
        };
    }

    /**
     * Secure local storage with encryption
     */
    async storeSecureData(key, data, password) {
        try {
            const encryptedData = await this.encryptUserData(data, password);
            const storageData = {
                encrypted: encryptedData,
                timestamp: Date.now(),
                version: '1.0'
            };
            
            localStorage.setItem(key, JSON.stringify(storageData));
            return true;
        } catch (error) {
            console.error('Secure storage error:', error);
            return false;
        }
    }

    /**
     * Retrieve and decrypt data from secure storage
     */
    async retrieveSecureData(key, password) {
        try {
            const storedData = localStorage.getItem(key);
            if (!storedData) return null;

            const parsedData = JSON.parse(storedData);
            return await this.decryptUserData(parsedData.encrypted, password);
        } catch (error) {
            console.error('Secure retrieval error:', error);
            return null;
        }
    }

    /**
     * Clear secure data from storage
     */
    clearSecureData(key) {
        localStorage.removeItem(key);
    }

    /**
     * Generate data integrity hash
     */
    async generateDataHash(data) {
        const encoder = new TextEncoder();
        const dataBuffer = encoder.encode(JSON.stringify(data));
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', dataBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Verify data integrity
     */
    async verifyDataIntegrity(data, expectedHash) {
        const actualHash = await this.generateDataHash(data);
        return actualHash === expectedHash;
    }
}

// Initialize security system
window.WaxEncountersSecurity = new WaxEncountersSecurity();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WaxEncountersSecurity;
}

