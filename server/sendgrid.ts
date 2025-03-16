import { MailService } from '@sendgrid/mail';

if (!process.env.SENDGRID_API_KEY) {
  throw new Error("SENDGRID_API_KEY environment variable must be set");
}

const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY);

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(
  apiKey: string,
  params: EmailParams
): Promise<boolean> {
  try {
    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text,
      html: params.html,
    });
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

export async function sendApplicationNotification(
  employerEmail: string,
  jobTitle: string,
  candidateName: string
): Promise<boolean> {
  return sendEmail(process.env.SENDGRID_API_KEY!, {
    to: employerEmail,
    from: 'notifications@jobportal.com',
    subject: `New Application: ${jobTitle}`,
    html: `
      <h2>New Job Application Received</h2>
      <p>Hello,</p>
      <p>${candidateName} has applied for the position of ${jobTitle}.</p>
      <p>Login to your dashboard to review the application.</p>
    `
  });
}

export async function sendWelcomeEmail(email: string, username: string): Promise<boolean> {
  return sendEmail(process.env.SENDGRID_API_KEY!, {
    to: email,
    from: 'welcome@jobportal.com',
    subject: 'Welcome to JobPortal',
    html: `
      <h2>Welcome to JobPortal!</h2>
      <p>Hello ${username},</p>
      <p>Thank you for joining JobPortal. We're excited to help you in your career journey.</p>
      <p>Get started by:</p>
      <ul>
        <li>Creating your resume</li>
        <li>Browsing available jobs</li>
        <li>Setting up job alerts</li>
      </ul>
    `
  });
}
