require("dotenv").config();

const otpService = {
    generateOTP: () => {
        // Generate a 4-digit random number
        const otp = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;

        return otp.toString();
    },

    sendOTP: async (phoneNumber, otp) => {
        const accountSid = process.env.TWILIO_ACCOUNT_SID;
        const authToken = process.env.TWILIO_AUTH_TOKEN;
        const twilioClient = require("twilio")(accountSid, authToken);

        try {
            const messageResult = await twilioClient.messages.create({
                body: `Hi,

                Thank you for choosing Assetorix, your ultimate platform for real estate & asset Investment! We're excited to have you on board.
                
                To complete your registration and access our powerful tools, please verify your account by entering the OTP code below:
                
                Your OTP code: ${otp}
                
                This code is only valid for a limited time, so make sure to enter it promptly. If you didn't request this OTP, please ignore this message.
                
                If you need any assistance or have questions about our services, feel free to reach out to our support team at support@assetorix.com or call us at ------------.
                
                Welcome to the Assetorix family!
                
                Best regards,
                The Assetorix Team`,
                from: process.env.TWILIO_PHONE_NUMBER,
                to: phoneNumber,
            });
            console.log(messageResult.sid);
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    },
};

module.exports = { otpService };