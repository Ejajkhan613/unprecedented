const nodemailer = require("nodemailer");
require('dotenv').config();

function generateOTP() {
    const digits = '0123456789';
    let OTP = '';

    for (let i = 0; i < 6; i++) {
        const randomIndex = Math.floor(Math.random() * 10);
        OTP += digits[randomIndex];
    }

    return OTP;
}


async function email_OTP_sending(email) {

    try {
        // Create a Nodemailer transporter
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        let OTP = generateOTP();


        // Send the email
        const mailOptions = {
            from: process.env.EMAIL_USERNAME,
            to: email,
            subject: `Email OTP <Unprecedented>`,
            html: `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <title>Email OTP</title>
            </head>
            <body>
                <h1>New Email OTP</h1>
                <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
                    <div style="margin:50px auto;width:70%;padding:20px 0">
                        <p style="font-size:1.1em">Hi,</p>
                        <p>Thank you for choosing Unprecedented. Use the following OTP to register. OTP is valid for next 5 minutes</p>
                        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${OTP}</h2>
                        <p style="font-size:0.9em;">Regards,<br />Unprecedented</p>
                        <hr style="border:none;border-top:1px solid #eee" />
                        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
                        <p>Unprecedented</p>
                        <p>India</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
            `,
        };

        const info = await transporter.sendMail(mailOptions);
        return { "status": true, "msg": info, "otp": OTP };
    } catch (error) {
        return { "status": false, "msg": error };
    }
}

module.exports = { email_OTP_sending };
