import sql from "@/app/api/utils/sql";
import { sendEmail, createEmailTemplate } from "@/app/api/utils/send-email";
import crypto from "crypto";

function generateActivationToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateActivationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit code
}

async function sendActivationEmail(email, token, code, name) {
  const activationUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/auth/activate?token=${token}`;

  // Use the email template helper
  const htmlContent = createEmailTemplate("verification", {
    title: "Welcome to Listening Room! 🎉",
    name: name,
    message:
      "Welcome to Listening Room - a safe, compassionate space where you can connect with trained volunteers who are here to listen and support you through whatever you're facing.",
    instructions: `To activate your account, you can either click the button below or enter this activation code: ${code}`,
    actionUrl: activationUrl,
    actionText: "Activate Your Account",
    warning: "This activation link expires in 24 hours.",
  });

  try {
    await sendEmail({
      to: email,
      subject: "Welcome to Listening Room - Activate Your Account",
      html: htmlContent,
      tags: ["welcome", "activation", "user_onboarding"],
    });

    console.log(`Activation email sent to: ${email}`);
  } catch (error) {
    console.error("Failed to send activation email:", error);
    throw new Error("Failed to send activation email");
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, userType = "seeker" } = body;

    // Validate required fields
    if (!name || !email || !password) {
      return Response.json(
        { error: "Name, email, and password are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json(
        { error: "Please enter a valid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await sql`
      SELECT id, email_verified FROM auth_users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      if (existingUser[0].email_verified) {
        return Response.json(
          { error: "An account with this email already exists" },
          { status: 409 },
        );
      } else {
        // User exists but not verified, we'll resend activation
        const userId = existingUser[0].id;
        const activationToken = generateActivationToken();
        const activationCode = generateActivationCode();
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        // Update existing user's activation token
        await sql`
          UPDATE auth_users 
          SET activation_token = ${activationToken}, 
              activation_token_expires = ${expiresAt},
              name = ${name}
          WHERE id = ${userId}
        `;

        // Delete old verification tokens and create new one
        await sql`DELETE FROM email_verification_tokens WHERE user_id = ${userId}`;
        await sql`
          INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
          VALUES (${userId}, ${activationCode}, 'activation', ${expiresAt})
        `;

        await sendActivationEmail(email, activationToken, activationCode, name);

        return Response.json({
          message:
            "Activation email resent. Please check your email to verify your account.",
          userId: userId,
        });
      }
    }

    // Create new user
    const activationToken = generateActivationToken();
    const activationCode = generateActivationCode();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Insert user into auth_users table
    const newUser = await sql`
      INSERT INTO auth_users (name, email, email_verified, activation_token, activation_token_expires)
      VALUES (${name}, ${email}, false, ${activationToken}, ${expiresAt})
      RETURNING id
    `;

    const userId = newUser[0].id;

    // Create auth account with password (will be hashed by the auth system)
    await sql`
      INSERT INTO auth_accounts (
        "userId", type, provider, "providerAccountId", password
      ) VALUES (
        ${userId}, 'credentials', 'credentials', ${email}, ${password}
      )
    `;

    // Create user profile
    await sql`
      INSERT INTO user_profiles (user_id, user_type, is_active)
      VALUES (${userId}, ${userType}, true)
    `;

    // Create verification token
    await sql`
      INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
      VALUES (${userId}, ${activationCode}, 'activation', ${expiresAt})
    `;

    // Send activation email
    await sendActivationEmail(email, activationToken, activationCode, name);

    return Response.json({
      message:
        "Registration successful! Please check your email to activate your account.",
      userId: userId,
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Provide more specific error messages
    if (error.message.includes("Failed to send activation email")) {
      return Response.json(
        {
          error:
            "Registration successful but we couldn't send the activation email. Please contact support.",
        },
        { status: 500 },
      );
    }

    return Response.json(
      { error: "An error occurred during registration. Please try again." },
      { status: 500 },
    );
  }
}

export async function GET(request) {
  const url = new URL(request.url);
  const action = url.searchParams.get("action");
  const email = url.searchParams.get("email");

  if (action === "resend" && email) {
    try {
      // Find user by email
      const user = await sql`
        SELECT id, name, email, email_verified 
        FROM auth_users 
        WHERE email = ${email}
      `;

      if (user.length === 0) {
        return Response.json(
          { error: "No account found with this email address" },
          { status: 404 },
        );
      }

      if (user[0].email_verified) {
        return Response.json(
          { error: "This email address is already verified" },
          { status: 400 },
        );
      }

      const userId = user[0].id;
      const activationToken = generateActivationToken();
      const activationCode = generateActivationCode();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

      // Update activation token
      await sql`
        UPDATE auth_users 
        SET activation_token = ${activationToken}, 
            activation_token_expires = ${expiresAt}
        WHERE id = ${userId}
      `;

      // Delete old tokens and create new one
      await sql`DELETE FROM email_verification_tokens WHERE user_id = ${userId}`;
      await sql`
        INSERT INTO email_verification_tokens (user_id, token, type, expires_at)
        VALUES (${userId}, ${activationCode}, 'activation', ${expiresAt})
      `;

      await sendActivationEmail(
        email,
        activationToken,
        activationCode,
        user[0].name,
      );

      return Response.json({
        message: "Activation email resent successfully",
      });
    } catch (error) {
      console.error("Resend activation error:", error);
      return Response.json(
        { error: "Failed to resend activation email" },
        { status: 500 },
      );
    }
  }

  return Response.json({ error: "Invalid request" }, { status: 400 });
}
