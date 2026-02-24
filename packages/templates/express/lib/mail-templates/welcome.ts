export const welcome = (data: Record<string, unknown>) => {
    const name = typeof data.name === "string" ? data.name : "there";

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);">
                    <tr>
                        <td style="padding: 40px 32px; text-align: center;">
                            <h1 style="margin: 0 0 16px; font-size: 24px; font-weight: 700; color: #18181b;">
                                Welcome, ${name}!
                            </h1>
                            <p style="margin: 0 0 24px; font-size: 15px; line-height: 1.6; color: #52525b;">
                                Thanks for signing up. You're all set to get started.
                            </p>
                            <a href="#" style="display: inline-block; padding: 12px 24px; background-color: #18181b; color: #ffffff; font-size: 14px; font-weight: 600; text-decoration: none; border-radius: 8px;">
                                Get Started
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 16px 32px; text-align: center; border-top: 1px solid #e4e4e7;">
                            <p style="margin: 0; font-size: 12px; color: #a1a1aa;">
                                If you didn't create this account, you can safely ignore this email.
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`.trim();
};
