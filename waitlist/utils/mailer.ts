import nodemailer from 'nodemailer';
import path from 'path';
import { Address } from 'nodemailer/lib/mailer';

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

export const sendEmail = async (to: string, subject: string, text: string, html?: string) => {
    const logoPath = path.join(process.cwd(), 'public', 'dikeLogo.png');

    const bcc = [
      {
        name: 'Dike Protocol',
        address: process.env.GMAIL_USER,
      } as Address
    ]
    
    const mailOptions = {
        from: `Dike Protocol <${process.env.GMAIL_USER}>`,
        to,
        subject,
        bcc,
        text,
        ...(html && { html }),
        attachments: html ? [
            {
                filename: 'dikeLogo.png',
                path: logoPath,
                cid: 'dikeLogo',
            }
        ] : []
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email to ${to}:`, error);
    }
};

export const getWelcomeEmailHTML = () => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Dike</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #000000 0%, #1a0f00 50%, #2d1a00 100%); color: #ffffff;">
      <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
          <td align="center" style="padding: 40px 20px;">
            <table role="presentation" style="max-width: 600px; width: 100%; border-collapse: collapse; background: linear-gradient(180deg, #0a0a0a 0%, #1a0f00 100%); border-radius: 12px; overflow: hidden; box-shadow: 0 8px 32px rgba(217, 119, 6, 0.2);">
              
              <!-- Header with Logo -->
              <tr>
                <td style="padding: 50px 40px 30px; text-align: center; background: linear-gradient(135deg, #1a0f00 0%, #2d1a00 100%); border-bottom: 2px solid rgba(217, 119, 6, 0.3);">
                  <div style="margin-bottom: 20px;">
                    <img src="cid:dikeLogo" alt="Dike Logo" style="width: 120px; height: 120px; display: block; margin: 0 auto; filter: drop-shadow(0 4px 12px rgba(217, 119, 6, 0.4)) brightness(1.15) contrast(1.15);" />
                  </div>
                  <h1 style="margin: 0; font-size: 42px; font-weight: 700; color: #ffffff; letter-spacing: 4px; text-transform: uppercase;">DIKE</h1>
                  <p style="margin: 10px 0 0; font-size: 16px; color: #d97706; letter-spacing: 2px; text-transform: uppercase;">Protocol</p>
                </td>
              </tr>
              
              <!-- Main Content -->
              <tr>
                <td style="padding: 40px 40px 30px;">
                  <h2 style="margin: 0 0 20px; font-size: 28px; font-weight: 600; color: #ffffff; text-align: center;">Welcome to the Future of Predictions</h2>
                  
                  <p style="margin: 0 0 20px; font-size: 16px; line-height: 1.8; color: #e5e5e5;">
                    Thank you for joining the <strong style="color: #d97706;">Dike Protocol</strong> waitlist! You're now part of an exclusive community pioneering the next generation of capital-efficient prediction markets.
                  </p>
                  
                  <div style="margin: 30px 0; padding: 20px; background: linear-gradient(135deg, rgba(217, 119, 6, 0.15) 0%, rgba(217, 119, 6, 0.05) 100%); border-left: 3px solid #d97706; border-radius: 8px; text-align: center;">
                    <p style="margin: 0; font-size: 20px; font-style: italic; color: #f59e0b; font-weight: 500; line-height: 1.6;">
                      "One stake, infinite branches. Where predictions multiply and capital evolves."
                    </p>
                  </div>
                  
                </td>
              </tr>
              
              <!-- Call to Action -->
              <tr>
                <td style="padding: 0 40px 40px; text-align: center;">
                  <div style="margin: 30px 0;">
                    <div style="display: inline-block; padding: 3px; background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%); border-radius: 50px;">
                      <div style="background: #0a0a0a; padding: 15px 40px; border-radius: 48px;">
                        <p style="margin: 0; font-size: 14px; color: #d97706; font-weight: 600; letter-spacing: 1px; text-transform: uppercase;">Early Access Reserved</p>
                      </div>
                    </div>
                  </div>
                  
                  <p style="margin: 20px 0 0; font-size: 14px; color: #999; line-height: 1.6;">
                    Follow us for updates and be ready when we launch.<br/>
                    The future of prediction markets starts here.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px 40px; background: linear-gradient(135deg, #0a0a0a 0%, #000000 100%); border-top: 1px solid rgba(217, 119, 6, 0.2); text-align: center;">
                  <p style="margin: 0 0 15px; font-size: 16px; font-weight: 600; color: #d97706; letter-spacing: 1px;">INFINITE POSSIBILITIES</p>
                  <p style="margin: 0; font-size: 13px; color: #666; line-height: 1.6;">
                    © 2025 Dike Protocol. All rights reserved.<br/>
                    You're receiving this email because you joined our waitlist.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
};