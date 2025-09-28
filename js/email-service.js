/**
 * Wax Encounters - Email Service
 * Handles real email sending for verification and notifications
 * Uses EmailJS for reliable email delivery
 */

class EmailService {
    constructor() {
        // EmailJS configuration
        this.serviceId = 'service_et7wg4d'; // You'll need to set this up
        this.templateId = 'verification_template'; // You'll need to set this up
        this.publicKey = 'efrT_nBy5QaUJR45K'; // You'll need to set this up
        this.fromEmail = 'noreply@waxencounters.com'; // Your verified sender email
        this.fromName = 'Wax Encounters';
        
        // Initialize EmailJS
        this.initializeEmailJS();
    }

    /**
     * Initialize EmailJS service
     */
    initializeEmailJS() {
        if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
            console.warn('EmailJS not configured. Emails will not be sent.');
        } else {
            // Initialize EmailJS with the public key
            if (typeof emailjs !== 'undefined') {
                emailjs.init(this.publicKey);
                console.log('EmailJS email service initialized');
            } else {
                console.warn('EmailJS library not loaded');
            }
        }
    }

    /**
     * Send profile change verification email
     */
    async sendProfileChangeVerificationEmail(userEmail, verificationCode) {
        try {
            if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
                console.warn('EmailJS not configured - simulating email send');
                return {
                    success: true,
                    message: 'Email service not configured - simulation mode',
                    simulated: true
                };
            }

            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS library not loaded');
            }

            // Initialize EmailJS if not already done
            if (!this.initialized) {
                emailjs.init(this.publicKey);
                this.initialized = true;
            }

            const templateParams = {
                to_email: userEmail,
                verification_code: verificationCode,
                user_name: userEmail.split('@')[0], // Use email username as name
                service_name: 'Wax Encounters'
            };

            console.log('Sending profile change verification email to:', userEmail);
            console.log('Template params:', templateParams);

            const result = await emailjs.send(
                this.serviceId,
                'template_d273flu', // Your profile change verification template ID
                templateParams
            );

            console.log('Profile change verification email sent successfully:', result);
            return {
                success: true,
                message: 'Profile change verification email sent successfully',
                result: result
            };

        } catch (error) {
            console.error('Error sending profile change verification email:', error);
            return {
                success: false,
                error: error.message,
                message: 'Failed to send profile change verification email'
            };
        }
    }

    /**
     * Send verification email
     */
    async sendVerificationEmail(userEmail, userName, verificationLink) {
        try {
            if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
                console.warn('EmailJS not configured - simulating email send');
                return {
                    success: true,
                    message: 'Email service not configured - simulation mode',
                    simulated: true
                };
            }

            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                throw new Error('EmailJS library not loaded. Please check if the EmailJS script is included.');
            }

            // Use EmailJS to send email
            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                from_name: this.fromName,
                verification_link: verificationLink,
                subject: 'Verify Your Wax Encounters Account',
                // Alternative parameter names that might work better
                user_email: userEmail,
                user_name: userName,
                verification_url: verificationLink,
                message: `Hello ${userName}, please verify your email by clicking: ${verificationLink}`
            };

            // Try sending with EmailJS
            let response;
            try {
                response = await emailjs.send(
                    this.serviceId,
                    this.templateId,
                    templateParams,
                    this.publicKey
                );
            } catch (emailError) {
                console.error('EmailJS send error:', emailError);
                // Try with simpler parameters
                const simpleParams = {
                    to_email: userEmail,
                    to_name: userName,
                    message: `Hello ${userName}, please verify your email by clicking: ${verificationLink}`
                };
                response = await emailjs.send(
                    this.serviceId,
                    this.templateId,
                    simpleParams,
                    this.publicKey
                );
            }

            if (response.status === 200) {
                console.log('Verification email sent successfully');
                return {
                    success: true,
                    message: 'Verification email sent successfully',
                    response: response
                };
            } else {
                throw new Error(`EmailJS API error: ${response.status}`);
            }

        } catch (error) {
            console.error('Failed to send verification email:', error);
            console.error('Error details:', {
                serviceId: this.serviceId,
                templateId: this.templateId,
                publicKey: this.publicKey ? 'Set' : 'Not set',
                errorMessage: error.message,
                errorStack: error.stack
            });
            return {
                success: false,
                message: 'Failed to send verification email',
                error: error.message,
                details: {
                    serviceId: this.serviceId,
                    templateId: this.templateId,
                    publicKey: this.publicKey ? 'Set' : 'Not set'
                }
            };
        }
    }

    /**
     * Get verification email template
     */
    getVerificationEmailTemplate(userName, verificationLink) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification - Wax Encounters</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #c77ab4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #c77ab4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .link-box { background: #eee; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Wax Encounters</h1>
            <p>Verify Your Email Address</p>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>Thank you for creating an account with Wax Encounters. To complete your registration and start supporting vinyl campaigns, please verify your email address.</p>
            
            <p>Click the button below to verify your email:</p>
            
            <a href="${verificationLink}" class="button">Verify Email Address</a>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-box">${verificationLink}</div>
            
            <p><strong>Important:</strong> This verification link will expire in 24 hours for security reasons.</p>
            
            <p>If you didn't create an account with Wax Encounters, please ignore this email.</p>
            
            <p>Best regards,<br>The Wax Encounters Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Wax Encounters. All rights reserved.</p>
            <p>For support, contact us at waxencounters@gmail.com</p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Send welcome email after verification
     */
    async sendWelcomeEmail(userEmail, userName) {
        try {
            if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
                console.warn('EmailJS not configured - simulating welcome email');
                return { success: true, message: 'Welcome email simulated', simulated: true };
            }

            // Use EmailJS to send welcome email
            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                from_name: this.fromName,
                subject: 'Welcome to Wax Encounters!'
            };

            const response = await emailjs.send(
                this.serviceId,
                'welcome_template', // You'll need to create this template
                templateParams,
                this.publicKey
            );

            if (response.status === 200) {
                console.log('Welcome email sent successfully');
                return {
                    success: true,
                    message: 'Welcome email sent successfully',
                    response: response
                };
            } else {
                throw new Error(`EmailJS API error: ${response.status}`);
            }

        } catch (error) {
            console.error('Failed to send welcome email:', error);
            return {
                success: false,
                message: 'Failed to send welcome email',
                error: error.message
            };
        }
    }

    /**
     * Get welcome email template
     */
    getWelcomeEmailTemplate(userName) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Welcome - Wax Encounters</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #c77ab4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #c77ab4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { padding: 8px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Wax Encounters</h1>
            <p>Welcome to the Community!</p>
        </div>
        <div class="content">
            <h2>Welcome ${userName}!</h2>
            <p>Your email has been successfully verified! You're now part of the Wax Encounters community.</p>
            
            <p>Here's what you can do now:</p>
            <ul class="feature-list">
                <li>🎵 Support vinyl crowdfunding campaigns</li>
                <li>🛒 Browse our collection of ready-to-ship records</li>
                <li>🎨 Create your own vinyl projects</li>
                <li>📱 Track your orders and campaigns</li>
            </ul>
            
            <a href="${window.location.origin}/account.html" class="button">Access Your Account</a>
            
            <p>Thank you for joining us in supporting independent artists and the vinyl community!</p>
            
            <p>Best regards,<br>The Wax Encounters Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Wax Encounters. All rights reserved.</p>
            <p>For support, contact us at waxencounters@gmail.com</p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Send order confirmation email
     */
    async sendOrderConfirmation(userEmail, userName, orderDetails) {
        try {
            if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
                console.warn('EmailJS not configured - simulating order confirmation email');
                return { success: true, message: 'Order confirmation email simulated', simulated: true };
            }

            // Use EmailJS to send order confirmation
            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                from_name: this.fromName,
                product_name: orderDetails.productName,
                order_number: orderDetails.orderNumber,
                total_amount: orderDetails.totalAmount,
                subject: `Order Confirmation - ${orderDetails.productName}`
            };

            const response = await emailjs.send(
                this.serviceId,
                'order_template', // You'll need to create this template
                templateParams,
                this.publicKey
            );

            if (response.status === 200) {
                console.log('Order confirmation email sent successfully');
                return {
                    success: true,
                    message: 'Order confirmation email sent successfully',
                    response: response
                };
            } else {
                throw new Error(`EmailJS API error: ${response.status}`);
            }

        } catch (error) {
            console.error('Failed to send order confirmation email:', error);
            return {
                success: false,
                message: 'Failed to send order confirmation email',
                error: error.message
            };
        }
    }

    /**
     * Get order confirmation email template
     */
    getOrderConfirmationTemplate(userName, orderDetails) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Order Confirmation - Wax Encounters</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #c77ab4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .order-details { background: white; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Wax Encounters</h1>
            <p>Order Confirmation</p>
        </div>
        <div class="content">
            <h2>Thank you for your order, ${userName}!</h2>
            <p>Your order has been confirmed and is being processed.</p>
            
            <div class="order-details">
                <h3>Order Details:</h3>
                <p><strong>Order Number:</strong> ${orderDetails.orderNumber}</p>
                <p><strong>Product:</strong> ${orderDetails.productName}</p>
                <p><strong>Total Amount:</strong> €${orderDetails.totalAmount}</p>
            </div>
            
            <p>You will receive another email when your order ships.</p>
            <p>Thank you for supporting independent artists and the vinyl community!</p>
            
            <p>Best regards,<br>The Wax Encounters Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Wax Encounters. All rights reserved.</p>
            <p>For support, contact us at waxencounters@gmail.com</p>
        </div>
    </div>
</body>
</html>`;
    }

    /**
     * Generate verification link
     */
    generateVerificationLink(userEmail, token) {
        // Check if we're running locally
        if (window.location.protocol === 'file:') {
            // For local testing, use file:// with proper path
            const currentPath = window.location.pathname;
            const basePath = currentPath.substring(0, currentPath.lastIndexOf('/'));
            return `file://${basePath}/verify-email.html?email=${encodeURIComponent(userEmail)}&token=${token}`;
        } else {
            // For production, use the actual domain
            const baseUrl = `https://${WaxEncounters}.github.io/vinyl-main`;
            return `${baseUrl}/verify-email.html?email=${encodeURIComponent(userEmail)}&token=${token}`;
        }
    }

    /**
     * Generate verification token
     */
    generateVerificationToken() {
        const array = new Uint8Array(32);
        window.crypto.getRandomValues(array);
        return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Send password reset email
     */
    async sendPasswordResetEmail(userEmail, userName, resetLink) {
        try {
            if (!this.serviceId || this.serviceId === 'YOUR_EMAILJS_SERVICE_ID') {
                console.warn('EmailJS not configured - simulating password reset email');
                return { success: true, message: 'Password reset email simulated', simulated: true };
            }

            // Use EmailJS to send password reset email
            const templateParams = {
                to_email: userEmail,
                to_name: userName,
                from_name: this.fromName,
                reset_link: resetLink,
                subject: 'Reset Your Wax Encounters Password'
            };

            const response = await emailjs.send(
                this.serviceId,
                'password_reset_template', // You'll need to create this template
                templateParams,
                this.publicKey
            );

            if (response.status === 200) {
                console.log('Password reset email sent successfully');
                return {
                    success: true,
                    message: 'Password reset email sent successfully',
                    response: response
                };
            } else {
                throw new Error(`EmailJS API error: ${response.status}`);
            }

        } catch (error) {
            console.error('Failed to send password reset email:', error);
            return {
                success: false,
                message: 'Failed to send password reset email',
                error: error.message
            };
        }
    }

    /**
     * Get password reset email template
     */
    getPasswordResetTemplate(userName, resetLink) {
        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Password Reset - Wax Encounters</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #c77ab4, #8b5cf6); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; background: #c77ab4; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .link-box { background: #eee; padding: 15px; border-radius: 5px; word-break: break-all; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎵 Wax Encounters</h1>
            <p>Password Reset Request</p>
        </div>
        <div class="content">
            <h2>Hello ${userName}!</h2>
            <p>We received a request to reset your password for your Wax Encounters account.</p>
            
            <p>Click the button below to reset your password:</p>
            
            <a href="${resetLink}" class="button">Reset Password</a>
            
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <div class="link-box">${resetLink}</div>
            
            <p><strong>Important:</strong> This password reset link will expire in 1 hour for security reasons.</p>
            
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            
            <p>Best regards,<br>The Wax Encounters Team</p>
        </div>
        <div class="footer">
            <p>© 2024 Wax Encounters. All rights reserved.</p>
            <p>For support, contact us at waxencounters@gmail.com</p>
        </div>
    </div>
</body>
</html>`;
    }
}

// Initialize email service
window.EmailService = new EmailService();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailService;
}
