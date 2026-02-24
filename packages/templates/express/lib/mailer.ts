import nodemailer from "nodemailer";
import type { SendMailOptions } from "nodemailer";
import { env } from "../env";
import { templates } from "./mail-templates";
import { BadRequestError, NotFoundError } from "./errors";

const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    secure: env.SMTP_PORT === 465,
    auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
    },
});

interface MailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    data?: Record<string, unknown>;
}

/**
 * Send an email using SMTP.
 *
 * @example
 * // Send with raw HTML
 * await sendMail({
 *     to: "user@example.com",
 *     subject: "Hello!",
 *     html: "<h1>Welcome</h1>",
 * });
 *
 * @example
 * // Send with a template
 * await sendMail({
 *     to: "user@example.com",
 *     subject: "Welcome!",
 *     template: "welcome",
 *     data: { name: "Briyan" },
 * });
 */
export async function sendMail(options: MailOptions) {
    let html = options.html;

    if (options.template) {
        const templateFn = templates[options.template];
        if (!templateFn) {
            throw new NotFoundError(`Email template '${options.template}' not found.`);
        }

        html = templateFn(options.data || {});
    }

    if (!html && !options.text) {
        throw new BadRequestError("Either 'html', 'text', or 'template' must be provided.");
    }

    const mailOptions: SendMailOptions = {
        from: env.MAIL_FROM,
        to: Array.isArray(options.to) ? options.to.join(", ") : options.to,
        subject: options.subject,
        html,
        text: options.text,
    };

    return transporter.sendMail(mailOptions);
}
