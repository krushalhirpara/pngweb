const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // ✅ VALIDATION
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        // ✅ EMAIL FORMAT CHECK
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email format",
            });
        }

        // ✅ SMTP SETUP (IMPORTANT FIX)
        const transporter = nodemailer.createTransport({
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

        // 🔥 DEBUG (VERY IMPORTANT)
        await transporter.verify();
        console.log("✅ SMTP connected");

        // ✅ EMAIL CONTENT
        const mailOptions = {
            from: `"PNGWALE" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact from ${name}`,
            html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b><br/>${message}</p>
      `,
        };

        // ✅ SEND MAIL
        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (err) {
        console.error("❌ ERROR:", err);

        return res.status(500).json({
            success: false,
            message: "Server error - mail not sent",
        });
    }
});

module.exports = router;