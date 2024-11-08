const nodemailer = require('nodemailer');

async function sendEmail() {
    let transporter = nodemailer.createTransport({
        host: 'smtp.example.com',
        port: 587,
        secure: false,
        auth: {
            user: 'your_username',
            pass: 'your_password'
        },
        tls: {
            rejectUnauthorized: true,
            minVersion: 'TLSv1.2'
        }
    });

    try {
        let info = await transporter.sendMail({
            from: '"Sender Name" <sender@example.com>',
            to: 'recipient@example.com',
            subject: 'Hello ✔',
            text: 'Hello world?',
            html: '<b>Hello world?</b>'
        });

        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
}

sendEmail();
