const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// POST /api/contact
router.post("/contact", async (req, res) => {
    try {
        const { name, email, message } = req.body;

        // 1. Basic Validation
        if (!name || !email || !message) {
            return res.status(400).json({ 
                success: false, 
                message: "Please provide name, email and message" 
            });
        }

        console.log(`📩 New contact inquiry from: ${email}`);

        // 2. Create Nodemailer Transporter
        const transporter = nodemailer.createTransport({
            host: "smtp.hostinger.com",
            port: 465,
            secure: true, // Use SSL/TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // 3. Prepare Email Options
        const mailOptions = {
            from: `"PNGWALE Contact Form" <${process.env.EMAIL_USER}>`,
            to: process.env.EMAIL_USER, // Send to your business email
            replyTo: email, // Allow replying directly to the user
            subject: `New Inquiry from ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <h2 style="color: #2563eb;">New Contact Message</h2>
                    <p><strong>Name:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <hr style="border: 0; border-top: 1px solid #eee;" />
                    <p><strong>Message:</strong></p>
                    <div style="background: #f9fafb; padding: 15px; border-radius: 8px; border: 1px solid #e5e7eb;">
                        ${message.replace(/\n/g, '<br>')}
                    </div>
                    <p style="font-size: 12px; color: #6b7280; margin-top: 20px;">
                        This message was sent from the PNGWALE contact form.
                    </p>
                </div>
            `,
        };

        // 4. Send Email
        await transporter.sendMail(mailOptions);
        
        console.log("✅ Email sent successfully");
        res.json({ success: true, message: "Message sent successfully" });

    } catch (err) {
        console.error("❌ Nodemailer Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Failed to send email. Please try again later." 
        });
    }
});

module.exports = router;