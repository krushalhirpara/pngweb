const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ Helper to create transporter
const getTransporter = () => {
    console.log("🛠️ Initializing Transporter...");
    console.log("📧 EMAIL_USER:", process.env.EMAIL_USER ? "DEFINED" : "MISSING");
    console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "DEFINED" : "MISSING");

    return nodemailer.createTransport({
        host: "smtp.hostinger.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
        tls: {
            rejectUnauthorized: false,
        },
    });
};

// 🏁 TEST ROUTE: GET /api/test-email
router.get("/test-email", async (req, res) => {
    try {
        console.log("🏁 TEST EMAIL ROUTE HIT");
        const transporter = getTransporter();

        await transporter.verify();
        console.log("✅ SMTP Verification Successful");

        const info = await transporter.sendMail({
            from: `"PNGWALE Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Backend Test Email",
            text: "If you see this, Nodemailer is working perfectly on Railway!",
            html: "<b>Backend Test Email:</b> If you see this, Nodemailer is working perfectly on Railway!",
        });

        res.json({
            success: true,
            message: "Test email sent successfully",
            messageId: info.messageId,
        });

    } catch (err) {
        console.error("❌ TEST EMAIL FAILED:", err);
        res.status(500).json({
            success: false,
            message: "Test failed: " + err.message,
            stack: err.stack,
        });
    }
});

// 🚀 PRODUCTION ROUTE: POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;
        console.log("📩 New Contact Request:", { name, email });

        if (!name || !email || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const transporter = getTransporter();

        // Verify connection before sending
        try {
            await transporter.verify();
            console.log("✅ SMTP Connected for contact form");
        } catch (verifyErr) {
            console.error("❌ SMTP Verification Failed:", verifyErr);
            throw new Error("SMTP connection failed: " + verifyErr.message);
        }

        const mailOptions = {
            from: `"PNGWALE Support" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `Contact Form: ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2 style="color: #2563eb;">New Contact Message</h2>
                    <p><strong>From:</strong> ${name} (${email})</p>
                    <hr/>
                    <p><strong>Message:</strong></p>
                    <p style="white-space: pre-wrap;">${message}</p>
                </div>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email Sent:", info.messageId);

        return res.json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("🔥 CONTACT FORM ERROR:", err);
        return res.status(500).json({
            success: false,
            message: err.message || "Failed to send email",
        });
    }
});

module.exports = router;