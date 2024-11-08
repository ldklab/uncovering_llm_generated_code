// Require the nodemailer package
const nodemailer = require('nodemailer');

// Function to send an email asynchronously
async function sendEmail() {
    // Configure the transporter with SMTP server details
    let transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // Replace with the actual SMTP server
        port: 587, // Common SMTP port, secure if 465
        secure: false, // Use 'true' if secure port is 465
        auth: {
            user: 'your_username', // Your SMTP username
            pass: 'your_password'  // Your SMTP password
        },
        tls: {
            rejectUnauthorized: true, // Reject invalid certificates
            minVersion: 'TLSv1.2'
        }
    });

    // Define the email to be sent
    let mailOptions = {
        from: '"Sender Name" <sender@example.com>', // Sender details
        to: 'recipient@example.com', // Receiver email
        subject: 'Hello ✔', // Subject of the email
        text: 'Hello world?', // Plain text message
        html: '<b>Hello world?</b>' // HTML message
    };

    // Send the email using the transporter
    try {
        let info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

// Execute the sendEmail function
sendEmail();
