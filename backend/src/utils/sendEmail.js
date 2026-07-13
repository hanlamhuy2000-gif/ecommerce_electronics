// import nodemailer from "nodemailer";

// export const sendEmail = async (to, subject, text) => {
//   const transporter = nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: parseInt(process.env.EMAIL_PORT), // convert từ string sang number
//     secure: false, // TLS
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS, // App Password
//     },
//   });

//   await transporter.sendMail({
//     from: `"ShopHub" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     text,
//   });
// };

import nodemailer from "nodemailer";

export const sendEmail = async (to, subject, text) => {
  if (process.env.BREVO_API_KEY) {
    const senderEmail = process.env.EMAIL_FROM || process.env.EMAIL_USER;
    const senderName = process.env.EMAIL_FROM_NAME || "ShopHub";

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        sender: { name: senderName, email: senderEmail },
        to: [{ email: to }],
        subject,
        textContent: text,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Brevo API error ${response.status}: ${errorBody}`);
    }

    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ShopHub" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
  });
};
