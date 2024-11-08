// Install Nodemailer using: npm install nodemailer
const nodemailer = require('nodemailer');

// Async function to send email
async function sendEmail() {
    // Create a transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.example.com', // Update with your SMTP host
        port: 587, // Use 465 for secure connection
        secure: false, // Use true for 465, false for other ports
        auth: {
            user: 'your_username', // Update with your SMTP username
            pass: 'your_password'  // Update with your SMTP password
        },
        tls: {
            rejectUnauthorized: true, // Ensure certificate is valid
            minVersion: 'TLSv1.2' // Use at least TLS 1.2
        }
    });

    // Send mail with defined transport object
    let info = await transporter.sendMail({
        from: '"Sender Name" <sender@example.com>', // Sender address
        to: 'recipient@example.com', // List of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // Plain text body
        html: '<b>Hello world?</b>' // HTML body
    });

    console.log('Message sent: %s', info.messageId);
    // Preview URL not available in production
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
}

// Call the function to send email
sendEmail().catch(console.error);
