const express = require("express");
const router = express.Router();
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

// ================= TEST ROUTE =================
router.get("/test-email", async (req, res) => {
    try {
        console.log("🧪 TEST EMAIL TRIGGERED");

        const response = await resend.emails.send({
            from: "PNGWALE <onboarding@resend.dev>",
            to: [process.env.EMAIL_USER], // your email
            subject: "✅ Email Test Success",
            html: `
                <div style="font-family:sans-serif;padding:20px;">
                    <h2 style="color:green;">Email Working 🚀</h2>
                    <p>Your contact system is fully working now.</p>
                </div>
            `,
        });

        console.log("📨 TEST EMAIL SENT:", response);

        res.json({
            success: true,
            message: "Test email sent successfully",
        });

    } catch (err) {
        console.error("❌ TEST ERROR:", err);

        res.status(500).json({
            success: false,
            message: err.message,
        });
    }
});

// ================= CONTACT ROUTE =================
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

        // ✅ SEND EMAIL (NO SMTP)
        await resend.emails.send({
            from: "PNGWALE <onboarding@resend.dev>",
            to: [process.env.EMAIL_USER], // where you receive message
            reply_to: email,
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
        });

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