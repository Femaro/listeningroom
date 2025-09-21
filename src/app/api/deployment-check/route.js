import { sendEmail, checkDomainVerification } from "@/app/api/utils/send-email";
import sql from "@/app/api/utils/sql";
import { writeFileSync, readFileSync, existsSync } from "fs";
import { join } from "path";

// Store environment variables in a simple way
function setEnvironmentVariable(key, value) {
  if (typeof process !== "undefined" && process.env) {
    process.env[key] = value;
  }
}

function getStoredEnvVars() {
  try {
    // For production, you'd want to use a proper secret management service
    // This is a simplified approach for the demo
    return {
      RESEND_API_KEY: process.env.RESEND_API_KEY || "",
      FROM_EMAIL: process.env.FROM_EMAIL || "",
    };
  } catch (error) {
    return {
      RESEND_API_KEY: "",
      FROM_EMAIL: "",
    };
  }
}

export async function GET(request) {
  const checks = {
    database: { status: "unknown", details: null },
    email: { status: "unknown", details: null },
    webrtc: { status: "unknown", details: null },
    environment: { status: "unknown", details: null },
  };

  try {
    // Database connectivity check
    try {
      const dbTest = await sql`SELECT 1 as test`;
      checks.database = {
        status: "success",
        details: "Database connection successful",
      };
    } catch (error) {
      checks.database = {
        status: "error",
        details: `Database error: ${error.message}`,
      };
    }

    // Email service check
    try {
      const domainCheck = await checkDomainVerification();

      checks.email = {
        status: domainCheck.verified
          ? "success"
          : process.env.RESEND_API_KEY
            ? "warning"
            : "error",
        details: {
          apiKey: !!process.env.RESEND_API_KEY,
          fromEmail: process.env.FROM_EMAIL || "Not configured",
          domains: domainCheck.domains || [],
          verifiedDomains: domainCheck.verifiedDomains || [],
          error: domainCheck.error,
        },
      };
    } catch (error) {
      checks.email = {
        status: "error",
        details: `Email check failed: ${error.message}`,
      };
    }

    // WebRTC configuration check
    const webrtcConfig = {
      stunServers: ["stun:stun.l.google.com:19302"], // Default STUN
      turnServers: [],
      configured: false,
    };

    // Check for TURN server configuration
    if (process.env.NEXT_PUBLIC_TURN_SERVERS) {
      try {
        const turnServers = JSON.parse(process.env.NEXT_PUBLIC_TURN_SERVERS);
        webrtcConfig.turnServers = turnServers;
        webrtcConfig.configured = turnServers.length > 0;
      } catch (error) {
        webrtcConfig.error = "Invalid TURN_SERVERS JSON format";
      }
    }

    if (process.env.NEXT_PUBLIC_TURN_SERVER_URL) {
      webrtcConfig.turnServers.push({
        urls: process.env.NEXT_PUBLIC_TURN_SERVER_URL,
        username: process.env.NEXT_PUBLIC_TURN_USERNAME ? "***" : "missing",
        credential: process.env.NEXT_PUBLIC_TURN_CREDENTIAL ? "***" : "missing",
      });
      webrtcConfig.configured = true;
    }

    checks.webrtc = {
      status: webrtcConfig.configured ? "success" : "warning",
      details: webrtcConfig,
    };

    // Environment variables check
    const requiredEnvVars = {
      RESEND_API_KEY: !!process.env.RESEND_API_KEY,
      FROM_EMAIL: !!process.env.FROM_EMAIL,
      NEXTAUTH_URL: !!process.env.NEXTAUTH_URL,
      NEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    };

    const optionalEnvVars = {
      NEXT_PUBLIC_TURN_SERVERS: !!process.env.NEXT_PUBLIC_TURN_SERVERS,
      NEXT_PUBLIC_TURN_SERVER_URL: !!process.env.NEXT_PUBLIC_TURN_SERVER_URL,
    };

    const missingRequired = Object.entries(requiredEnvVars)
      .filter(([key, exists]) => !exists)
      .map(([key]) => key);

    checks.environment = {
      status: missingRequired.length === 0 ? "success" : "error",
      details: {
        required: requiredEnvVars,
        optional: optionalEnvVars,
        missing: missingRequired,
      },
    };

    // Overall system status
    const overallStatus = Object.values(checks).every(
      (check) => check.status === "success",
    )
      ? "ready"
      : Object.values(checks).some((check) => check.status === "error")
        ? "needs_attention"
        : "partial";

    return Response.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      checks,
      recommendations: generateRecommendations(checks),
      currentEnvVars: getStoredEnvVars(),
    });
  } catch (error) {
    return Response.json(
      {
        status: "error",
        error: error.message,
        checks,
      },
      { status: 500 },
    );
  }
}

// Test email sending functionality
export async function POST(request) {
  try {
    const { testEmail } = await request.json();

    if (!testEmail) {
      return Response.json(
        { error: "Test email address required" },
        { status: 400 },
      );
    }

    // Send test email
    const result = await sendEmail({
      to: testEmail,
      subject: "Listening Room - Email Service Test",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #0D9488;">Email Service Test Successful!</h2>
          <p>This test email confirms that your Listening Room email service is properly configured.</p>
          <div style="background-color: #f0f9ff; border: 1px solid #0369a1; border-radius: 8px; padding: 16px; margin: 16px 0;">
            <p style="margin: 0; color: #0369a1;">
              <strong>✅ Email delivery is working correctly</strong><br>
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This is an automated test message from your Listening Room deployment.
          </p>
        </div>
      `,
      tags: ["deployment-test", "system-check"],
    });

    return Response.json({
      success: true,
      messageId: result.id,
      message: "Test email sent successfully! Check your inbox.",
    });
  } catch (error) {
    console.error("Email test failed:", error);
    return Response.json(
      {
        error: error.message,
        success: false,
      },
      { status: 500 },
    );
  }
}

// Save environment variables
export async function PUT(request) {
  try {
    const { environmentVariables } = await request.json();

    if (!environmentVariables || typeof environmentVariables !== "object") {
      return Response.json(
        { error: "Invalid environment variables data" },
        { status: 400 },
      );
    }

    // Validate the environment variables
    const { RESEND_API_KEY, FROM_EMAIL } = environmentVariables;

    if (!RESEND_API_KEY || !FROM_EMAIL) {
      return Response.json(
        {
          error: "RESEND_API_KEY and FROM_EMAIL are required",
        },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(FROM_EMAIL)) {
      return Response.json(
        {
          error: "FROM_EMAIL must be a valid email address",
        },
        { status: 400 },
      );
    }

    // Validate API key format (Resend keys start with 're_')
    if (!RESEND_API_KEY.startsWith("re_")) {
      return Response.json(
        {
          error:
            "RESEND_API_KEY must be a valid Resend API key (starts with re_)",
        },
        { status: 400 },
      );
    }

    try {
      // Set environment variables for current process
      setEnvironmentVariable("RESEND_API_KEY", RESEND_API_KEY);
      setEnvironmentVariable("FROM_EMAIL", FROM_EMAIL);

      // Test the email configuration
      const domainCheck = await checkDomainVerification();

      return Response.json({
        success: true,
        message: "Environment variables saved successfully",
        emailStatus: {
          apiKey: true,
          fromEmail: FROM_EMAIL,
          verifiedDomains: domainCheck.verifiedDomains || [],
          domainVerified: domainCheck.verified,
        },
      });
    } catch (error) {
      console.error("Failed to save environment variables:", error);
      return Response.json(
        {
          error: "Failed to save environment variables: " + error.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error("PUT request error:", error);
    return Response.json(
      {
        error: "Invalid request data",
      },
      { status: 400 },
    );
  }
}

function generateRecommendations(checks) {
  const recommendations = [];

  // Database recommendations
  if (checks.database.status === "error") {
    recommendations.push({
      type: "critical",
      area: "database",
      message:
        "Database connection failed. Check your connection string and database availability.",
      action:
        "Verify DATABASE_URL environment variable and database server status.",
    });
  }

  // Email recommendations
  if (checks.email.status === "error") {
    recommendations.push({
      type: "critical",
      area: "email",
      message: "Email service is not properly configured.",
      action:
        "Set RESEND_API_KEY environment variable and verify domain in Resend dashboard.",
    });
  } else if (
    checks.email.status === "warning" &&
    !checks.email.details.verifiedDomains?.length
  ) {
    recommendations.push({
      type: "warning",
      area: "email",
      message: "No verified domains found for email service.",
      action: "Add and verify your domain at https://resend.com/domains",
    });
  }

  // WebRTC recommendations
  if (checks.webrtc.status === "warning") {
    recommendations.push({
      type: "warning",
      area: "webrtc",
      message:
        "No TURN servers configured. Voice calls may fail behind NAT/firewalls.",
      action:
        "Configure TURN servers for production deployment. Consider using Twilio or AWS.",
    });
  }

  // Environment recommendations
  if (checks.environment.details.missing?.length > 0) {
    recommendations.push({
      type: "critical",
      area: "environment",
      message: `Missing required environment variables: ${checks.environment.details.missing.join(", ")}`,
      action:
        "Set all required environment variables before deploying to production.",
    });
  }

  return recommendations;
}
