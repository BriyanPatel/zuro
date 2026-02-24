import { Resend } from "resend";
import { env } from "../env";
import { templates } from "./mail-templates";
import { BadRequestError, NotFoundError } from "./errors";

const resend = new Resend(env.RESEND_API_KEY);

interface MailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    template?: string;
    data?: Record<string, unknown>;
}

/**
 * Send an email using Resend.
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

    const to = Array.isArray(options.to) ? options.to : [options.to];

    const emailPayload: Parameters<typeof resend.emails.send>[0] = {
        from: env.MAIL_FROM,
        to,
        subject: options.subject,
        text: options.text || "",
    };

    if (html) {
        emailPayload.html = html;
    }

    return resend.emails.send(emailPayload);
}
