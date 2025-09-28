/**
 * Wax Encounters - Secure Storage System
 * Implements secure data storage with encryption and integrity checks
 * Provides secure session management and data persistence
 */

class SecureStorageManager {
    constructor() {
        this.storagePrefix = 'wax_encounters_';
        this.sessionKey = 'user_session';
        this.userDataKey = 'user_data';
        this.encryptionKey = 'encryption_key';
        this.maxStorageAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds
        this.security = window.WaxEncountersSecurity;
    }

    /**
     * Initialize secure storage system
     */
    async initialize() {
        try {
            // Check if storage is available
            if (!this.isStorageAvailable()) {
                throw new Error('Local storage not available');
            }

            // Clean up expired data
            await this.cleanupExpiredData();

            // Initialize session if needed
            await this.initializeSession();

            return true;
        } catch (error) {
            console.error('Storage initialization error:', error);
            return false;
        }
    }

    /**
     * Check if local storage is available
     */
    isStorageAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * Initialize user session
     */
    async initializeSession() {
        const existingSession = this.getSession();
        if (!existingSession) {
            const newSession = {
                sessionId: this.security.generateSessionToken(),
                createdAt: Date.now(),
                lastActivity: Date.now(),
                isActive: false
            };
            this.setSession(newSession);
        }
    }

    /**
     * Store user data securely
     */
    async storeUserData(userData, password) {
        try {
            // Validate input data
            if (!this.validateUserData(userData)) {
                throw new Error('Invalid user data provided');
            }

            // Prepare secure data
            const secureData = await this.security.prepareSecureData(userData, password);
            
            // Create storage object with metadata
            const storageObject = {
                ...secureData,
                storedAt: Date.now(),
                version: '1.0'
            };
            
            // Generate data integrity hash AFTER adding metadata
            const dataHash = await this.security.generateDataHash(storageObject);
            
            // Add hash to storage object
            storageObject.dataHash = dataHash;

            // Store in localStorage
            const storageKey = this.storagePrefix + this.userDataKey;
            localStorage.setItem(storageKey, JSON.stringify(storageObject));

            // Update session
            await this.updateSession(true);

            return {
                success: true,
                sessionId: this.getSession().sessionId,
                message: 'User data stored securely'
            };
        } catch (error) {
            console.error('User data storage error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Retrieve user data securely
     */
    async retrieveUserData(password) {
        try {
            const storageKey = this.storagePrefix + this.userDataKey;
            const storedData = localStorage.getItem(storageKey);
            
            if (!storedData) {
                return {
                    success: false,
                    error: 'No user data found'
                };
            }

            const parsedData = JSON.parse(storedData);
            
            // Verify data integrity
            const { dataHash, ...dataToVerify } = parsedData;
            const isValid = await this.security.verifyDataIntegrity(dataToVerify, dataHash);
            
            if (!isValid) {
                throw new Error('Data integrity check failed');
            }

            // Decrypt sensitive data
            const decryptedData = await this.security.decryptUserData(parsedData.encryptedData, password);
            
            // Update session activity
            await this.updateSession(true);

            return {
                success: true,
                data: {
                    ...decryptedData,
                    ...parsedData.nonSensitiveData
                }
            };
        } catch (error) {
            console.error('User data retrieval error:', error);
            return {
                success: false,
                error: 'Failed to retrieve user data'
            };
        }
    }

    /**
     * Update user data
     */
    async updateUserData(updatedData, password) {
        try {
            // Retrieve existing data
            const existingData = await this.retrieveUserData(password);
            if (!existingData.success) {
                throw new Error('Cannot retrieve existing data');
            }

            // Merge with updated data
            const mergedData = {
                ...existingData.data,
                ...updatedData
            };

            // Store updated data
            return await this.storeUserData(mergedData, password);
        } catch (error) {
            console.error('User data update error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Delete user data
     */
    deleteUserData() {
        try {
            const storageKey = this.storagePrefix + this.userDataKey;
            localStorage.removeItem(storageKey);
            
            // Clear session
            this.clearSession();
            
            return {
                success: true,
                message: 'User data deleted successfully'
            };
        } catch (error) {
            console.error('User data deletion error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Session management
     */
    setSession(sessionData) {
        const sessionKey = this.storagePrefix + this.sessionKey;
        localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }

    getSession() {
        const sessionKey = this.storagePrefix + this.sessionKey;
        const sessionData = localStorage.getItem(sessionKey);
        return sessionData ? JSON.parse(sessionData) : null;
    }

    async updateSession(isActive = true) {
        const session = this.getSession();
        if (session) {
            session.lastActivity = Date.now();
            session.isActive = isActive;
            this.setSession(session);
        }
    }

    clearSession() {
        const sessionKey = this.storagePrefix + this.sessionKey;
        localStorage.removeItem(sessionKey);
    }

    isSessionValid() {
        const session = this.getSession();
        if (!session) return false;

        const now = Date.now();
        const sessionAge = now - session.lastActivity;
        
        // Session expires after 24 hours of inactivity
        return session.isActive && sessionAge < (24 * 60 * 60 * 1000);
    }

    /**
     * Validate user data structure
     */
    validateUserData(userData) {
        const requiredFields = [
            'firstName', 'lastName', 'email', 'shippingAddress',
            'iban', 'bic', 'bankAccountOwner', 'password'
        ];

        for (const field of requiredFields) {
            if (!userData[field] || typeof userData[field] !== 'string') {
                return false;
            }
        }

        // Validate email format
        if (!this.security.validateEmail(userData.email)) {
            return false;
        }

        // Validate IBAN format
        if (!this.security.validateIBAN(userData.iban)) {
            return false;
        }

        // Validate BIC format
        if (!this.security.validateBIC(userData.bic)) {
            return false;
        }

        return true;
    }

    /**
     * Clean up expired data
     */
    async cleanupExpiredData() {
        try {
            const now = Date.now();
            const keysToRemove = [];

            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.storagePrefix)) {
                    try {
                        const data = JSON.parse(localStorage.getItem(key));
                        if (data.storedAt && (now - data.storedAt) > this.maxStorageAge) {
                            keysToRemove.push(key);
                        }
                    } catch (e) {
                        // If data is corrupted, remove it
                        keysToRemove.push(key);
                    }
                }
            }

            keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Get storage statistics
     */
    getStorageStats() {
        const stats = {
            totalKeys: 0,
            waxEncountersKeys: 0,
            totalSize: 0,
            waxEncountersSize: 0
        };

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            const value = localStorage.getItem(key);
            const size = new Blob([value]).size;

            stats.totalKeys++;
            stats.totalSize += size;

            if (key && key.startsWith(this.storagePrefix)) {
                stats.waxEncountersKeys++;
                stats.waxEncountersSize += size;
            }
        }

        return stats;
    }

    /**
     * Export user data (for GDPR compliance)
     */
    async exportUserData(password) {
        try {
            const userData = await this.retrieveUserData(password);
            if (!userData.success) {
                throw new Error('Cannot retrieve user data');
            }

            const exportData = {
                userData: userData.data,
                exportDate: new Date().toISOString(),
                version: '1.0',
                format: 'JSON'
            };

            return {
                success: true,
                data: exportData
            };
        } catch (error) {
            console.error('Data export error:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Check if user data exists
     */
    hasUserData() {
        const storageKey = this.storagePrefix + this.userDataKey;
        return localStorage.getItem(storageKey) !== null;
    }

    /**
     * Get user data metadata (without decryption)
     */
    getUserDataMetadata() {
        try {
            const storageKey = this.storagePrefix + this.userDataKey;
            const storedData = localStorage.getItem(storageKey);
            
            if (!storedData) {
                return null;
            }

            const parsedData = JSON.parse(storedData);
            return {
                storedAt: parsedData.storedAt,
                version: parsedData.version,
                nonSensitiveData: parsedData.nonSensitiveData,
                securityMetadata: parsedData.securityMetadata
            };
        } catch (error) {
            console.error('Metadata retrieval error:', error);
            return null;
        }
    }
}

// Initialize secure storage manager
window.SecureStorageManager = new SecureStorageManager();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    await window.SecureStorageManager.initialize();
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SecureStorageManager;
}
