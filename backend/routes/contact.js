const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ Create transporter (Gmail SMTP - stable config)
const createTransporter = () => {
    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // App Password
        },
        connectionTimeout: 10000, // 10 sec
        greetingTimeout: 10000,
        socketTimeout: 15000,
    });
};

// 🧪 TEST ROUTE: GET /api/test-email
router.get("/test-email", async (req, res) => {
    try {
        console.log("🧪 TEST EMAIL TRIGGERED");

        const transporter = createTransporter();

        // Verify SMTP
        await transporter.verify();
        console.log("✅ SMTP VERIFIED");

        const info = await transporter.sendMail({
            from: `"PNGWALE System" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "✅ SMTP Test Success",
            text: "SMTP is working perfectly!",
            html: `
                <div style="font-family: sans-serif; padding: 20px;">
                    <h2 style="color: green;">SMTP Connected Successfully 🚀</h2>
                    <p>Your email system is now fully working.</p>
                </div>
            `,
        });

        console.log("📨 TEST EMAIL SENT:", info.messageId);

        res.json({
            success: true,
            message: "Test email sent successfully",
        });

    } catch (err) {
        console.error("❌ TEST EMAIL ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// 🚀 CONTACT ROUTE: POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        console.log("📩 Incoming Contact:", { name, email });

        // ✅ Validation
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
                message: "Invalid email address",
            });
        }

        const transporter = createTransporter();

        // 🔍 Verify SMTP before sending
        await transporter.verify();
        console.log("✅ SMTP READY");

        const mailOptions = {
            from: `"PNGWALE Contact" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact Message from ${name}`,
            html: `
                <div style="max-width:600px;margin:auto;font-family:sans-serif;border:1px solid #eee;border-radius:12px;overflow:hidden;">
                    <div style="background:#2563eb;padding:20px;color:white;">
                        <h2>New Contact Message</h2>
                    </div>
                    <div style="padding:20px;">
                        <p><strong>Name:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <hr/>
                        <p><strong>Message:</strong></p>
                        <p style="white-space:pre-wrap;">${message}</p>
                    </div>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);

        console.log("✅ EMAIL SENT SUCCESSFULLY");

        res.json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("🔥 CONTACT ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message || "Email failed",
        });
    }
});

module.exports = router;