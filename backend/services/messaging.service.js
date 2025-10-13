// backend/services/messaging.service.js
import twilio from 'twilio';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

export const sendSms = async (to, body) => {
    try {
        // IMPORTANT: Twilio requires phone numbers in E.164 format (e.g., +919876543210)
        const formattedTo = to.startsWith('+') ? to : `+91${to}`;

        console.log(`Sending SMS to ${formattedTo}: "${body}"`);
        
        await client.messages.create({
            body: body,
            from: twilioPhone,
            to: formattedTo
        });

        console.log(`SMS sent successfully to ${formattedTo}`);
        return { success: true };
    } catch (error) {
        console.error(`Failed to send SMS to ${to}. Error:`, error.message);
        return { success: false, error: error.message };
    }
};