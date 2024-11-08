// Import Nodemailer
const nodemailer = require('nodemailer');

// Function to send an email
async function sendEmail() {
    // Configure the transporter with SMTP details
    const transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // Your SMTP server
        port: 587, // Port of the SMTP server
        secure: false, // Use true if port is 465
        auth: {
            user: 'your_username', // SMTP user
            pass: 'your_password'  // SMTP password
        },
        tls: {
            rejectUnauthorized: true, // Validate server certificates
            minVersion: 'TLSv1.2' // Set minimum TLS version
        }
    });

    // Define email options
    const mailOptions = {
        from: '"Sender Name" <sender@example.com>', // Sender info
        to: 'recipient@example.com', // Recipient addresses
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // Plain text content
        html: '<b>Hello world?</b>' // HTML content
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error occurred:', error);
    }
}

// Trigger the sending of the email
sendEmail();
