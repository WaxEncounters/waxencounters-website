/**
 * Wax Encounters - Server-Side Data Validation & Sanitization
 * Implements comprehensive data validation, sanitization, and security checks
 * Provides secure data transmission and processing
 */

class ServerValidation {
    constructor() {
        this.validationRules = {
            firstName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                sanitize: true
            },
            lastName: {
                required: true,
                minLength: 2,
                maxLength: 50,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                sanitize: true
            },
            username: {
                required: true,
                minLength: 3,
                maxLength: 30,
                pattern: /^[a-zA-Z0-9_-]+$/,
                sanitize: true
            },
            email: {
                required: true,
                pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
                maxLength: 254,
                sanitize: true
            },
            phone: {
                required: false,
                pattern: /^[\+]?[1-9][\d]{0,15}$/,
                maxLength: 20,
                sanitize: true
            },
            shippingAddress: {
                required: true,
                minLength: 10,
                maxLength: 200,
                pattern: /^[a-zA-Z0-9\s\.,\-'#\/]+$/,
                sanitize: true
            },
            iban: {
                required: true,
                pattern: /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/,
                sanitize: true
            },
            bic: {
                required: true,
                pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/,
                sanitize: true
            },
            bankAccountOwner: {
                required: true,
                minLength: 2,
                maxLength: 100,
                pattern: /^[a-zA-ZÀ-ÿ\s'-]+$/,
                sanitize: true
            },
            password: {
                required: true,
                minLength: 8,
                maxLength: 128,
                pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
                sanitize: false
            }
        };

        this.securityHeaders = {
            'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self'",
            'X-Content-Type-Options': 'nosniff',
            'X-Frame-Options': 'DENY',
            'X-XSS-Protection': '1; mode=block',
            'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
            'Referrer-Policy': 'strict-origin-when-cross-origin'
        };
    }

    /**
     * Validate user registration data
     */
    validateRegistrationData(data) {
        const errors = [];
        const sanitizedData = {};

        // Validate each field
        for (const [fieldName, rules] of Object.entries(this.validationRules)) {
            const value = data[fieldName];
            
            // Check required fields
            if (rules.required && (!value || value.trim() === '')) {
                errors.push(`${fieldName} is required`);
                continue;
            }

            // Skip validation for empty optional fields
            if (!rules.required && (!value || value.trim() === '')) {
                sanitizedData[fieldName] = '';
                continue;
            }

            // Sanitize input
            let sanitizedValue = rules.sanitize ? this.sanitizeInput(value) : value;

            // Check minimum length
            if (rules.minLength && sanitizedValue.length < rules.minLength) {
                errors.push(`${fieldName} must be at least ${rules.minLength} characters long`);
            }

            // Check maximum length
            if (rules.maxLength && sanitizedValue.length > rules.maxLength) {
                errors.push(`${fieldName} must not exceed ${rules.maxLength} characters`);
            }

            // Check pattern
            if (rules.pattern && !rules.pattern.test(sanitizedValue)) {
                errors.push(`${fieldName} format is invalid`);
            }

            // Additional field-specific validations
            if (fieldName === 'email') {
                if (!this.validateEmailDomain(sanitizedValue)) {
                    errors.push('Email domain is not valid');
                }
            }

            if (fieldName === 'iban') {
                if (!this.validateIBANChecksum(sanitizedValue)) {
                    errors.push('IBAN checksum is invalid');
                }
            }

            if (fieldName === 'password') {
                const passwordStrength = this.checkPasswordStrength(sanitizedValue);
                if (passwordStrength.score < 3) {
                    errors.push('Password is too weak. Please use a stronger password.');
                }
            }

            sanitizedData[fieldName] = sanitizedValue;
        }

        // Validate terms acceptance
        if (!data.termsAccepted) {
            errors.push('Terms of Service must be accepted');
        }

        if (!data.privacyAccepted) {
            errors.push('Privacy Policy must be accepted');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: sanitizedData
        };
    }

    /**
     * Sanitize user input to prevent XSS and injection attacks
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') return input;

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove potential HTML tags
            .replace(/['"]/g, '') // Remove quotes
            .replace(/[;]/g, '') // Remove semicolons
            .replace(/[()]/g, '') // Remove parentheses
            .replace(/[{}]/g, '') // Remove braces
            .replace(/[\[\]]/g, '') // Remove brackets
            .replace(/script/gi, '') // Remove script tags
            .replace(/javascript/gi, '') // Remove javascript
            .replace(/onload/gi, '') // Remove event handlers
            .replace(/onerror/gi, '')
            .replace(/onclick/gi, '')
            .replace(/onmouseover/gi, '')
            .replace(/onfocus/gi, '')
            .replace(/onblur/gi, '')
            .replace(/onchange/gi, '')
            .replace(/onsubmit/gi, '')
            .replace(/onreset/gi, '')
            .replace(/onselect/gi, '')
            .replace(/onkeydown/gi, '')
            .replace(/onkeyup/gi, '')
            .replace(/onkeypress/gi, '');
    }

    /**
     * Validate email domain
     */
    validateEmailDomain(email) {
        const domain = email.split('@')[1];
        const validDomains = [
            'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
            'icloud.com', 'protonmail.com', 'tutanota.com', 'fastmail.com',
            'zoho.com', 'mail.com', 'yandex.com', 'aol.com'
        ];
        
        // Allow common domains and custom domains
        return validDomains.includes(domain) || this.isValidCustomDomain(domain);
    }

    /**
     * Check if domain is a valid custom domain
     */
    isValidCustomDomain(domain) {
        const domainRegex = /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/;
        return domainRegex.test(domain);
    }

    /**
     * Validate IBAN checksum
     */
    validateIBANChecksum(iban) {
        // Remove spaces and convert to uppercase
        const cleanIban = iban.replace(/\s/g, '').toUpperCase();
        
        // Move first 4 characters to end
        const rearranged = cleanIban.slice(4) + cleanIban.slice(0, 4);
        
        // Convert letters to numbers (A=10, B=11, etc.)
        const numericString = rearranged.replace(/[A-Z]/g, (char) => {
            return (char.charCodeAt(0) - 55).toString();
        });
        
        // Calculate mod 97
        let remainder = 0;
        for (let i = 0; i < numericString.length; i++) {
            remainder = (remainder * 10 + parseInt(numericString[i])) % 97;
        }
        
        return remainder === 1;
    }

    /**
     * Check password strength
     */
    checkPasswordStrength(password) {
        const score = {
            length: password.length >= 8 ? 1 : 0,
            lowercase: /[a-z]/.test(password) ? 1 : 0,
            uppercase: /[A-Z]/.test(password) ? 1 : 0,
            numbers: /\d/.test(password) ? 1 : 0,
            special: /[@$!%*?&]/.test(password) ? 1 : 0
        };

        const totalScore = Object.values(score).reduce((sum, val) => sum + val, 0);
        
        let strength = 'weak';
        if (totalScore >= 4) strength = 'strong';
        else if (totalScore >= 3) strength = 'medium';

        return {
            score: totalScore,
            strength: strength,
            details: score
        };
    }

    /**
     * Validate login credentials
     */
    validateLoginData(data) {
        const errors = [];
        const sanitizedData = {};

        // Validate username/email
        if (!data.username || data.username.trim() === '') {
            errors.push('Username or email is required');
        } else {
            sanitizedData.username = this.sanitizeInput(data.username);
        }

        // Validate password
        if (!data.password || data.password.trim() === '') {
            errors.push('Password is required');
        } else {
            sanitizedData.password = data.password; // Don't sanitize password
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: sanitizedData
        };
    }

    /**
     * Generate secure headers for responses
     */
    getSecurityHeaders() {
        return this.securityHeaders;
    }

    /**
     * Validate session token
     */
    validateSessionToken(token) {
        if (!token || typeof token !== 'string') {
            return false;
        }

        // Check token format (64 character hex string)
        const tokenRegex = /^[a-f0-9]{64}$/;
        return tokenRegex.test(token);
    }

    /**
     * Rate limiting check (basic implementation)
     */
    checkRateLimit(identifier, action, limit = 5, windowMs = 60000) {
        const key = `rate_limit_${action}_${identifier}`;
        const now = Date.now();
        const windowStart = now - windowMs;

        // Get existing attempts
        let attempts = JSON.parse(localStorage.getItem(key) || '[]');
        
        // Filter attempts within the time window
        attempts = attempts.filter(timestamp => timestamp > windowStart);

        // Check if limit exceeded
        if (attempts.length >= limit) {
            return {
                allowed: false,
                remaining: 0,
                resetTime: attempts[0] + windowMs
            };
        }

        // Add current attempt
        attempts.push(now);
        localStorage.setItem(key, JSON.stringify(attempts));

        return {
            allowed: true,
            remaining: limit - attempts.length,
            resetTime: now + windowMs
        };
    }

    /**
     * Validate payment data
     */
    validatePaymentData(data) {
        const errors = [];
        const sanitizedData = {};

        // Validate payment method
        const validPaymentMethods = ['card', 'paypal'];
        if (!data.paymentMethod || !validPaymentMethods.includes(data.paymentMethod)) {
            errors.push('Invalid payment method');
        } else {
            sanitizedData.paymentMethod = data.paymentMethod;
        }

        // Validate card details if card payment
        if (data.paymentMethod === 'card') {
            if (!data.cardNumber || !this.validateCardNumber(data.cardNumber)) {
                errors.push('Invalid card number');
            }
            if (!data.expiryDate || !this.validateExpiryDate(data.expiryDate)) {
                errors.push('Invalid expiry date');
            }
            if (!data.cvv || !this.validateCVV(data.cvv)) {
                errors.push('Invalid CVV');
            }
            if (!data.cardholderName || data.cardholderName.trim() === '') {
                errors.push('Cardholder name is required');
            } else {
                sanitizedData.cardholderName = this.sanitizeInput(data.cardholderName);
            }
        }

        // Validate billing address
        if (!data.billingAddress || data.billingAddress.trim() === '') {
            errors.push('Billing address is required');
        } else {
            sanitizedData.billingAddress = this.sanitizeInput(data.billingAddress);
        }

        if (!data.city || data.city.trim() === '') {
            errors.push('City is required');
        } else {
            sanitizedData.city = this.sanitizeInput(data.city);
        }

        if (!data.postalCode || data.postalCode.trim() === '') {
            errors.push('Postal code is required');
        } else {
            sanitizedData.postalCode = this.sanitizeInput(data.postalCode);
        }

        // Validate terms acceptance
        if (!data.termsAccepted) {
            errors.push('Terms of Service must be accepted');
        }

        return {
            isValid: errors.length === 0,
            errors: errors,
            sanitizedData: sanitizedData
        };
    }

    /**
     * Validate card number using Luhn algorithm
     */
    validateCardNumber(cardNumber) {
        const cleanNumber = cardNumber.replace(/\s/g, '');
        const cardRegex = /^[0-9]{13,19}$/;
        
        if (!cardRegex.test(cleanNumber)) {
            return false;
        }

        // Luhn algorithm
        let sum = 0;
        let isEven = false;

        for (let i = cleanNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cleanNumber[i]);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    }

    /**
     * Validate expiry date
     */
    validateExpiryDate(expiryDate) {
        const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
        if (!expiryRegex.test(expiryDate)) {
            return false;
        }

        const [month, year] = expiryDate.split('/');
        const currentDate = new Date();
        const currentYear = currentDate.getFullYear() % 100;
        const currentMonth = currentDate.getMonth() + 1;

        const expiryYear = parseInt(year);
        const expiryMonth = parseInt(month);

        if (expiryYear < currentYear || (expiryYear === currentYear && expiryMonth < currentMonth)) {
            return false;
        }

        return true;
    }

    /**
     * Validate CVV
     */
    validateCVV(cvv) {
        const cvvRegex = /^[0-9]{3,4}$/;
        return cvvRegex.test(cvv);
    }

    /**
     * Log security events
     */
    logSecurityEvent(event, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            event: event,
            details: details,
            userAgent: navigator.userAgent,
            url: window.location.href
        };

        // In a real implementation, this would be sent to a secure logging service
        console.log('Security Event:', logEntry);
    }
}

// Initialize server validation
window.ServerValidation = new ServerValidation();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ServerValidation;
}
