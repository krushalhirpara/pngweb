const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ Gmail Transporter (FINAL FIX)
const getTransporter = () => {
    console.log("🛠️ Initializing Gmail Transporter...");

    return nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Gmail App Password
        },
    });
};

// 🧪 TEST ROUTE
router.get("/test-email", async (req, res) => {
    try {
        const transporter = getTransporter();

        await transporter.verify();
        console.log("✅ Gmail SMTP Connected");

        const info = await transporter.sendMail({
            from: `"PNGWALE Test" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            subject: "Test Email Success",
            text: "Gmail SMTP working successfully 🚀",
        });

        res.json({
            success: true,
            message: "Test email sent",
            id: info.messageId,
        });

    } catch (err) {
        console.error("❌ TEST FAILED:", err);
        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// 🚀 CONTACT ROUTE
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        const transporter = getTransporter();

        await transporter.verify();
        console.log("✅ SMTP Ready");

        const info = await transporter.sendMail({
            from: `"PNGWALE Support" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact: ${name}`,
            html: `
                <div style="font-family:sans-serif;padding:20px">
                    <h2>New Contact Message</h2>
                    <p><b>Name:</b> ${name}</p>
                    <p><b>Email:</b> ${email}</p>
                    <hr/>
                    <p>${message}</p>
                </div>
            `,
        });

        console.log("✅ Mail Sent:", info.messageId);

        res.json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("🔥 ERROR:", err);

        res.status(500).json({
            success: false,
            message: "Mail failed: " + err.message,
        });
    }
});

module.exports = router;