import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();
//smtp email transport model
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SNTP_PASSWORD,
  },
});

export default transporter;
