# Email Setup Guide - Wax Encounters

## 📧 EmailJS Configuration (FREE - No Credit Card Required!)

To enable real email sending for verification emails, you need to set up EmailJS. This is completely FREE and doesn't require a credit card!

### 1. **Create EmailJS Account**

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" (it's completely free!)
3. Sign up with your email address
4. Verify your email address
5. **No credit card required!**

### 2. **Set Up Email Service**

1. **Add Email Service:**
   - Go to "Email Services" in your dashboard
   - Click "Add New Service"
   - Choose your email provider:
     - **Gmail** (recommended for testing)
     - **Outlook**
     - **Yahoo**
     - **Custom SMTP**
   - Follow the setup instructions for your chosen provider

2. **For Gmail (Easiest):**
   - Select "Gmail"
   - Enter your Gmail address
   - Click "Connect Account"
   - Authorize EmailJS to send emails from your Gmail

### 3. **Create Email Templates**

1. **Go to "Email Templates":**
   - Click "Create New Template"
   - Create these templates:

2. **Verification Email Template:**
   - **Template ID:** `verification_template`
   - **Subject:** `Verify Your Wax Encounters Account`
   - **Content:**
   ```
   Hello {{to_name}},
   
   Welcome to Wax Encounters! Please verify your email address by clicking the link below:
   
   {{verification_link}}
   
   If you didn't create an account, please ignore this email.
   
   Best regards,
   The Wax Encounters Team
   ```

3. **Welcome Email Template:**
   - **Template ID:** `welcome_template`
   - **Subject:** `Welcome to Wax Encounters!`
   - **Content:**
   ```
   Hello {{to_name}},
   
   Your email has been verified! Welcome to the Wax Encounters community.
   
   You can now:
   - Support vinyl crowdfunding campaigns
   - Browse our collection of records
   - Create your own vinyl projects
   
   Best regards,
   The Wax Encounters Team
   ```

### 4. **Get Your Credentials**

1. **Go to "Account" → "General":**
   - Copy your **Public Key**
   - Copy your **Service ID**
   - Copy your **Template IDs**

2. **Update Your Website:**
   - Open `js/email-service.js`
   - Replace the following values:
   ```javascript
   this.serviceId = 'your_service_id_here';
   this.templateId = 'your_template_id_here';
   this.publicKey = 'your_public_key_here';
   ```

### 5. **Test the Setup**

1. Open your website
2. Try creating a test account
3. Check your email inbox
4. You should receive a verification email!

## 🔧 Configuration Example

```javascript
class EmailService {
    constructor() {
        // EmailJS configuration
        this.serviceId = 'service_abc123'; // Your EmailJS service ID
        this.templateId = 'template_xyz789'; // Your EmailJS template ID
        this.publicKey = 'user_def456'; // Your EmailJS public key
        this.fromEmail = 'noreply@waxencounters.com';
        this.fromName = 'Wax Encounters';
        
        // Initialize EmailJS
        this.initializeEmailJS();
    }
}
```

## 🚨 Important Notes

1. **Free Tier:** 200 emails/month (completely free!)
2. **No Credit Card:** Required for signup
3. **Easy Setup:** Works directly from your website
4. **Professional:** Used by many websites
5. **Reliable:** Good deliverability rates

## 🔍 Troubleshooting

### **Emails Not Received:**
1. Check spam/junk folder
2. Verify EmailJS configuration
3. Check browser console for errors
4. Test with different email providers

### **Configuration Issues:**
1. Verify Service ID is correct
2. Check Template ID matches your template
3. Ensure Public Key is correct
4. Test with EmailJS dashboard

### **Service Not Working:**
1. Verify all credentials are correct
2. Check email service is connected
3. Test with EmailJS dashboard
4. Check browser console for errors

## 📞 Support

For EmailJS support:
- [EmailJS Documentation](https://www.emailjs.com/docs/)
- [EmailJS Support](https://www.emailjs.com/support/)

For Wax Encounters support:
- Email: waxencounters@gmail.com

## 🎯 Alternative FREE Services

If you need more emails per month, consider:

### **Resend:**
- **Free Tier:** 3,000 emails/month
- **No Credit Card:** Required
- **Professional:** Yes, modern API
- **Setup:** Easy, developer-friendly

### **Brevo (formerly Sendinblue):**
- **Free Tier:** 300 emails/day (9,000/month)
- **No Credit Card:** Required
- **Professional:** Yes, used by major companies
- **Setup:** Easy, good documentation

### **Amazon SES:**
- **Free Tier:** 62,000 emails/month (if sent from EC2)
- **Pay-per-use:** $0.10 per 1,000 emails after free tier
- **Professional:** Used by Netflix, Airbnb, Dropbox
- **Setup:** More complex but very powerful

## 🔐 Security Best Practices

1. **Never share your credentials publicly**
2. **Don't commit credentials to version control**
3. **Use environment variables in production**
4. **Monitor email delivery and bounce rates**
5. **Set up rate limiting to prevent abuse**

## 🎉 Why EmailJS is Perfect for You

- ✅ **Completely FREE** (200 emails/month)
- ✅ **No Credit Card Required**
- ✅ **Easy Setup** (5 minutes)
- ✅ **Professional Service**
- ✅ **Good Deliverability**
- ✅ **Works from Frontend**
- ✅ **No Server Required**

Once you complete these steps, your website will be sending real verification emails through EmailJS's free service! 🎉