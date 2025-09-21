import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import { sendEmail } from "@/app/api/utils/send-email";

// Generate a secure random token
function generateVerificationToken() {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === "send") {
      // Send verification email
      const user = await sql`
        SELECT id, email, email_verified FROM auth_users WHERE id = ${session.user.id}
      `;

      if (user.length === 0) {
        return Response.json({ error: "User not found" }, { status: 404 });
      }

      if (user[0].email_verified) {
        return Response.json(
          { error: "Email already verified" },
          { status: 400 },
        );
      }

      // Check for existing unexpired tokens
      const existingToken = await sql`
        SELECT id FROM email_verification_tokens 
        WHERE user_id = ${session.user.id} 
        AND type = 'activation'
        AND expires_at > NOW()
        AND used_at IS NULL
        ORDER BY created_at DESC
        LIMIT 1
      `;

      if (existingToken.length > 0) {
        return Response.json(
          {
            error:
              "Verification email already sent. Please check your inbox or wait before requesting another.",
          },
          { status: 400 },
        );
      }

      // Generate verification token
      const token = generateVerificationToken();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

      // Store verification token
      await sql`
        INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
        VALUES (${session.user.id}, ${token}, 'activation', ${expiresAt})
      `;

      // Send verification email
      const verificationLink = `${request.headers.get("origin") || process.env.NEXTAUTH_URL}/auth/activate?token=${token}`;

      const emailSubject = "Verify your email address - Listening Room";
      const emailBody = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/" alt="Listening Room" style="height: 40px;">
          </div>
          
          <h1 style="color: #0D9488; text-align: center; margin-bottom: 30px;">Verify Your Email Address</h1>
          
          <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
            <p style="margin: 0 0 16px 0; color: #374151;">Hi there,</p>
            <p style="margin: 0 0 16px 0; color: #374151;">
              Thank you for joining Listening Room! To complete your registration and start accessing our platform, 
              please verify your email address by clicking the button below.
            </p>
            <p style="margin: 0; color: #374151;">
              This verification link will expire in 24 hours for security reasons.
            </p>
          </div>
          
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" 
               style="background-color: #0D9488; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Security Notice:</strong> If you didn't create an account with Listening Room, 
              please ignore this email. Your email address will not be added to our platform.
            </p>
          </div>
          
          <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
            <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="margin: 0; color: #6b7280; font-size: 12px; word-break: break-all;">
              ${verificationLink}
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 32px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; color: #6b7280; font-size: 12px;">
              This email was sent by Listening Room.<br>
              If you have questions, please contact our support team.
            </p>
          </div>
        </div>
      `;

      try {
        await sendEmail({
          to: user[0].email,
          subject: emailSubject,
          html: emailBody,
          from: process.env.FROM_EMAIL || "noreply@listeningroom.com",
        });

        return Response.json({
          message:
            "Verification email sent successfully. Please check your inbox.",
        });
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
        return Response.json(
          {
            error: "Failed to send verification email. Please try again.",
          },
          { status: 500 },
        );
      }
    }

    return Response.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Email verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get("token");

    if (!token) {
      return Response.json(
        { error: "Verification token required" },
        { status: 400 },
      );
    }

    // Find and validate token
    const verificationToken = await sql`
      SELECT user_id, expires_at, used_at 
      FROM email_verification_tokens 
      WHERE token = ${token} 
      AND type = 'activation'
    `;

    if (verificationToken.length === 0) {
      return Response.json(
        { error: "Invalid verification token" },
        { status: 400 },
      );
    }

    const tokenData = verificationToken[0];

    if (tokenData.used_at) {
      return Response.json(
        { error: "Verification token already used" },
        { status: 400 },
      );
    }

    if (new Date() > new Date(tokenData.expires_at)) {
      return Response.json(
        { error: "Verification token has expired" },
        { status: 400 },
      );
    }

    // Mark token as used and verify user's email
    await sql.transaction([
      sql`
        UPDATE email_verification_tokens 
        SET used_at = NOW() 
        WHERE token = ${token}
      `,
      sql`
        UPDATE auth_users 
        SET email_verified = true, "emailVerified" = NOW()
        WHERE id = ${tokenData.user_id}
      `,
    ]);

    return Response.json({
      message:
        "Email verified successfully! You can now access all platform features.",
    });
  } catch (error) {
    console.error("Email verification error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
