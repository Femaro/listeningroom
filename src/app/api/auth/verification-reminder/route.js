import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";
import { sendEmail, createEmailTemplate } from "@/app/api/utils/send-email";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user's email is already verified
    const user = await sql`
      SELECT id, email, email_verified, name FROM auth_users WHERE id = ${session.user.id}
    `;

    if (user.length === 0) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    if (user[0].email_verified) {
      return Response.json({ error: "Email already verified" }, { status: 400 });
    }

    // Check for recent reminder (prevent spam)
    const recentReminder = await sql`
      SELECT id FROM email_verification_tokens 
      WHERE user_id = ${session.user.id} 
      AND type = 'activation'
      AND created_at > NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (recentReminder.length > 0) {
      return Response.json({ 
        error: "Verification reminder already sent recently. Please wait before requesting another." 
      }, { status: 429 });
    }

    // Generate new verification token
    const token = generateVerificationToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Store verification token
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
      VALUES (${session.user.id}, ${token}, 'activation', ${expiresAt})
    `;

    // Send reminder email with improved template
    const verificationLink = `${request.headers.get("origin") || process.env.NEXTAUTH_URL}/auth/activate?token=${token}`;
    
    const emailHtml = createEmailTemplate('verification', {
      title: 'Please Verify Your Email Address',
      name: user[0].name,
      message: `We noticed you haven't verified your email address yet. To ensure you receive important updates and can access all platform features, please verify your email address.`,
      instructions: 'This verification link will expire in 24 hours for security reasons.',
      actionUrl: verificationLink,
      actionText: 'Verify Email Address',
      warning: 'If you didn\'t create an account with Listening Room, please ignore this email.'
    });

    await sendEmail({
      to: user[0].email,
      subject: "Please verify your email - Listening Room",
      html: emailHtml,
      tags: ['verification', 'reminder']
    });

    return Response.json({ 
      message: "Verification reminder sent successfully. Please check your inbox." 
    });

  } catch (error) {
    console.error("Verification reminder error:", error);
    return Response.json({ error: "Failed to send reminder" }, { status: 500 });
  }
}

// Schedule automatic reminders (this would typically be called by a cron job)
export async function GET(request) {
  try {
    // Find users who haven't verified email and haven't received recent reminders
    const unverifiedUsers = await sql`
      SELECT DISTINCT u.id, u.email, u.name, u.created_at
      FROM auth_users u
      LEFT JOIN email_verification_tokens evt ON u.id = evt.user_id 
        AND evt.type = 'activation' 
        AND evt.created_at > NOW() - INTERVAL '24 hours'
      WHERE u.email_verified = false
      AND u.created_at < NOW() - INTERVAL '1 day'  -- Account at least 1 day old
      AND u.created_at > NOW() - INTERVAL '7 days' -- Account less than 7 days old
      AND evt.id IS NULL  -- No recent verification emails
      LIMIT 50
    `;

    const reminderResults = [];

    for (const user of unverifiedUsers) {
      try {
        // Generate verification token
        const token = generateVerificationToken();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Store token
        await sql`
          INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
          VALUES (${user.id}, ${token}, 'activation', ${expiresAt})
        `;

        // Calculate days since registration
        const daysSinceRegistration = Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        const verificationLink = `${process.env.NEXTAUTH_URL}/auth/activate?token=${token}`;
        
        // Customize message based on how long they've been registered
        let message = `You registered for Listening Room ${daysSinceRegistration} day${daysSinceRegistration !== 1 ? 's' : ''} ago, but haven't verified your email address yet.`;
        
        if (daysSinceRegistration >= 3) {
          message += ` Without verification, you may miss important platform updates and have limited access to some features.`;
        }

        const emailHtml = createEmailTemplate('verification', {
          title: 'Email Verification Reminder',
          name: user.name,
          message,
          instructions: 'Please take a moment to verify your email address to ensure uninterrupted access to our platform.',
          actionUrl: verificationLink,
          actionText: 'Verify My Email',
          warning: 'This is an automated reminder. If you no longer wish to receive these, please contact support.'
        });

        await sendEmail({
          to: user.email,
          subject: "Reminder: Please verify your email - Listening Room",
          html: emailHtml,
          tags: ['verification', 'automated-reminder', `day-${daysSinceRegistration}`]
        });

        reminderResults.push({ userId: user.id, status: 'sent' });

      } catch (error) {
        console.error(`Failed to send reminder to user ${user.id}:`, error);
        reminderResults.push({ userId: user.id, status: 'failed', error: error.message });
      }
    }

    return Response.json({ 
      processed: unverifiedUsers.length,
      results: reminderResults,
      successCount: reminderResults.filter(r => r.status === 'sent').length
    });

  } catch (error) {
    console.error("Automated reminder error:", error);
    return Response.json({ error: "Failed to process reminders" }, { status: 500 });
  }
}

function generateVerificationToken() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 64; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}