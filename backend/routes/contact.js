const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ GMAIL SMTP TRANSPORTER
const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true, // Use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // App Password
    },
});

// 🧪 TEST ROUTE: GET /api/test-email
// Verify SMTP connection and send a test email
router.get("/test-email", async (req, res) => {
    try {
        console.log("🏁 Testing SMTP connection...");
        await transporter.verify();
        console.log("✅ SMTP connection verified!");

        const info = await transporter.sendMail({
            from: `"PNGWALE System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "🚀 SMTP Test Success",
            text: "Your contact form email system is ready for production!",
            html: `<div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
                    <h2 style="color: #2563eb;">SMTP Connected!</h2>
                    <p>If you received this, your Gmail SMTP is working perfectly on Railway.</p>
                  </div>`,
        });

        res.json({
            success: true,
            message: "Test email sent successfully",
            messageId: info.messageId,
        });

    } catch (err) {
        console.error("❌ SMTP TEST FAILED:", err);
        res.status(500).json({
            success: false,
            message: "SMTP Failed: " + err.message,
        });
    }
});

// 🚀 PRODUCTION CONTACT ROUTE: POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log(`📩 New message received from: ${name} (${email})`);

        // 1. Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address",
            });
        }

        // 2. Prepare Email
        const mailOptions = {
            from: `"PNGWALE Support" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Receives the contact message
            replyTo: email, // Admin can reply directly to the user
            subject: `New Inquiry: ${name}`,
            html: `
                <div style="max-width: 600px; margin: auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #1e293b; line-height: 1.6; border: 1px solid #f1f5f9; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
                    <div style="background: #2563eb; padding: 30px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">New Contact Message</h1>
                    </div>
                    <div style="padding: 30px; background: white;">
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 5px;">Sender Details</label>
                            <p style="margin: 0; font-size: 16px;"><strong>Name:</strong> ${name}</p>
                            <p style="margin: 0; font-size: 16px;"><strong>Email:</strong> ${email}</p>
                        </div>
                        <div style="margin-bottom: 25px;">
                            <label style="display: block; font-size: 12px; font-weight: 700; text-transform: uppercase; color: #64748b; margin-bottom: 5px;">Message Content</label>
                            <div style="background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${message}</div>
                        </div>
                        <p style="font-size: 14px; color: #94a3b8; margin: 0;">This email was sent from the contact form on pngwale.com</p>
                    </div>
                </div>
            `,
        };

        // 3. Send Email
        await transporter.sendMail(mailOptions);
        console.log("✅ Email sent successfully to admin");

        return res.json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("🔥 CONTACT ROUTE ERROR:", err);
        return res.status(500).json({
            success: false,
            message: "Failed to send email: " + err.message,
        });
    }
});

module.exports = router;