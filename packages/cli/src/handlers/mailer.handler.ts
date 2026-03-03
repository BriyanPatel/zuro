import prompts from "prompts";
import chalk from "chalk";

export interface MailerPromptResult {
    mailerProvider: "smtp" | "resend";
    customSmtpVars: Record<string, string> | undefined;
    usedDefaultSmtp: boolean;
}

/**
 * Runs all mailer-specific interactive prompts (provider selection + credentials).
 * Returns null if the user cancels.
 */
export async function promptMailerConfig(): Promise<MailerPromptResult | null> {
    const providerResponse = await prompts({
        type: "select",
        name: "provider",
        message: "Which email provider?",
        choices: [
            { title: "SMTP (Nodemailer)", description: "Gmail, Mailtrap, any SMTP server", value: "smtp" },
            { title: "Resend", description: "API-based, easiest setup", value: "resend" },
        ],
    });

    if (providerResponse.provider === undefined) {
        console.log(chalk.yellow("Operation cancelled."));
        return null;
    }

    const mailerProvider: "smtp" | "resend" = providerResponse.provider;
    let customSmtpVars: Record<string, string> | undefined;
    let usedDefaultSmtp = false;

    console.log(chalk.dim("  Tip: Leave fields blank to use placeholder values and configure later\n"));

    if (mailerProvider === "smtp") {
        const smtpResponse = await prompts([
            {
                type: "text",
                name: "host",
                message: "SMTP Host",
                initial: "",
            },
            {
                type: "text",
                name: "port",
                message: "SMTP Port",
                initial: "587",
            },
            {
                type: "text",
                name: "user",
                message: "SMTP User",
                initial: "",
            },
            {
                type: "password",
                name: "pass",
                message: "SMTP Password",
            },
            {
                type: "text",
                name: "from",
                message: "Mail From address",
                initial: "",
            },
        ]);

        if (smtpResponse.host === undefined) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        const host = smtpResponse.host?.trim() || "";
        const user = smtpResponse.user?.trim() || "";
        const pass = smtpResponse.pass?.trim() || "";
        const from = smtpResponse.from?.trim() || "";
        const port = smtpResponse.port?.trim() || "587";

        usedDefaultSmtp = !host && !user;

        if (!usedDefaultSmtp) {
            customSmtpVars = {
                SMTP_HOST: host || "smtp.example.com",
                SMTP_PORT: port,
                SMTP_USER: user || "your-email@example.com",
                SMTP_PASS: pass || "your-password",
                MAIL_FROM: from || "noreply@example.com",
            };
        }
    } else {
        const resendResponse = await prompts([
            {
                type: "text",
                name: "apiKey",
                message: "Resend API Key",
                initial: "",
            },
            {
                type: "text",
                name: "from",
                message: "Mail From address",
                initial: "",
            },
        ]);

        if (resendResponse.apiKey === undefined) {
            console.log(chalk.yellow("Operation cancelled."));
            return null;
        }

        const apiKey = resendResponse.apiKey?.trim() || "";
        const from = resendResponse.from?.trim() || "";

        usedDefaultSmtp = !apiKey;

        if (!usedDefaultSmtp) {
            customSmtpVars = {
                RESEND_API_KEY: apiKey || "re_your_api_key",
                MAIL_FROM: from || "onboarding@resend.dev",
            };
        }
    }

    return { mailerProvider, customSmtpVars, usedDefaultSmtp };
}

/**
 * Prints post-install hints for the mailer module.
 */
export function printMailerHints(usedDefaultSmtp: boolean) {
    if (usedDefaultSmtp) {
        console.log(chalk.yellow("ℹ Placeholder SMTP values added to .env — update them before sending emails."));
    } else {
        console.log(chalk.yellow("ℹ Review SMTP configuration in .env to ensure values are correct."));
    }
}
