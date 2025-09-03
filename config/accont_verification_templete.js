export const ACCOUNT_VERIFICATION_HTML_TEMPLETE = `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
            text-align: center;
        }
        .container {
            background: #ffffff;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
            max-width: 400px;
            margin: auto;
        }
        .verify-code {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            letter-spacing: 5px;
            padding: 10px;
            background: #e0e0e0;
            border-radius: 5px;
            display: inline-block;
        }
        .footer {
            margin-top: 20px;
            font-size: 14px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Email Verification</h2>
        <p>Use the verification code below to confirm your email address.</p>
        <div class="verify-code">{{otp}}</div>
        <p>If you did not request this, please ignore this email.</p>
        <div class="footer">&copy; 2025 AUTH</div>
    </div>
</body>
</html>`;
