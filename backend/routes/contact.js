const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // ✅ 1. Validation
        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
            });
        }

        console.log("📩 Contact Request:", { name, email });

        // ✅ 2. Transporter (Hostinger SMTP)
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // ✅ 3. Verify SMTP (IMPORTANT DEBUG)
        await transporter.verify();
        console.log("✅ SMTP connected");

        // ✅ 4. Mail content
        const mailOptions = {
            from: `"PNGWALE" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact from ${name}`,
            html: `
                <h2>New Contact Message</h2>
                <p><b>Name:</b> ${name}</p>
                <p><b>Email:</b> ${email}</p>
                <p><b>Message:</b></p>
                <p>${message}</p>
            `,
        };

        // ✅ 5. Send mail
        const info = await transporter.sendMail(mailOptions);

        console.log("📧 Email Sent:", info.messageId);

        return res.status(200).json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("❌ ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message || "Server error",
        });
    }
});

module.exports = router;