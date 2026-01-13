import { generateVerificationToken } from './jwt';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'CheeseMap <noreply@cheesemap.fr>';

export interface EmailVerificationData {
  email: string;
  firstName?: string;
  token: string;
  expiresAt: Date;
}

export interface PasswordResetData {
  email: string;
  token: string;
  expiresAt: Date;
}

/**
 * Generate email verification token with expiry
 */
export function createEmailVerification(email: string, firstName?: string): EmailVerificationData {
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiry

  return {
    email,
    firstName,
    token,
    expiresAt,
  };
}

/**
 * Generate password reset token with expiry
 */
export function createPasswordReset(email: string): PasswordResetData {
  const token = generateVerificationToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

  return {
    email,
    token,
    expiresAt,
  };
}

/**
 * Send verification email with Resend
 */
export async function sendVerificationEmail(data: EmailVerificationData): Promise<boolean> {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${data.token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Vérifiez votre email - CheeseMap',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2d3748;">🧀 CheeseMap</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #2d3748;">Bienvenue ${data.firstName || ''} !</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Merci de vous être inscrit. Pour activer votre compte, veuillez vérifier votre adresse email.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationUrl}" 
                   style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Vérifier mon email
                </a>
              </div>
              <p style="color: #718096; font-size: 14px;">
                Ce lien expire dans 24 heures.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Send verification email error:', error);
    return false;
  }
}

/**
 * Send password reset email with Resend
 */
export async function sendPasswordResetEmail(data: PasswordResetData): Promise<boolean> {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${data.token}`;
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.email,
      subject: 'Réinitialisation de votre mot de passe - CheeseMap',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2d3748;">🧀 CheeseMap</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #2d3748;">Réinitialisation de mot de passe</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour continuer.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Réinitialiser mon mot de passe
                </a>
              </div>
              <p style="color: #718096; font-size: 14px;">
                Ce lien expire dans 1 heure. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Send password reset email error:', error);
    return false;
  }
}

/**
 * Send welcome email after successful registration
 */
export async function sendWelcomeEmail(email: string, firstName?: string): Promise<boolean> {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Bienvenue sur CheeseMap ! 🧀',
      html: `
        <!DOCTYPE html>
        <html>
          <head><meta charset="utf-8"></head>
          <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #f8f9fa; padding: 20px; text-align: center;">
              <h1 style="color: #2d3748;">🧀 CheeseMap</h1>
            </div>
            <div style="padding: 40px 20px;">
              <h2 style="color: #2d3748;">Bienvenue ${firstName || ''} !</h2>
              <p style="color: #4a5568; line-height: 1.6;">
                Votre compte est maintenant activé. Vous pouvez commencer à explorer les meilleurs fromages de France.
              </p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/map" 
                   style="background: #3182ce; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                  Explorer la carte
                </a>
              </div>
            </div>
          </body>
        </html>
      `,
    });
    return true;
  } catch (error) {
    console.error('Send welcome email error:', error);
    return false;
  }
}
