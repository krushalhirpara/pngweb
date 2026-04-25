const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// 🚀 CONTACT ROUTE
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        console.log("📩 Incoming:", name, email);

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }

        const response = await resend.emails.send({
            from: "PNGWALE <onboarding@resend.dev>", // later custom domain use kari sakay
            to: process.env.EMAIL_USER, // tamaru email
            subject: `New Contact from ${name}`,
            reply_to: email,
            html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
        });

        console.log("✅ Email Sent:", response);

        res.json({
            success: true,
            message: "Message sent successfully",
        });

    } catch (err) {
        console.error("🔥 ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;