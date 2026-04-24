const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// ✅ Gmail transporter (FINAL WORKING)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 🚀 CONTACT ROUTE
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            return res.status(400).json({
                success: false,
                message: "All fields required",
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            replyTo: email,
            subject: `New Contact: ${name}`,
            html: `
        <h2>New Contact Message</h2>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `,
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (err) {
        console.error("MAIL ERROR:", err);

        return res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

module.exports = router;