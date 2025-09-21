export async function sendEmail({ to, from, subject, html, text, tags = [] }) {
  const maxRetries = 3;
  let lastError;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const fromAddress =
        from ||
        process.env.FROM_EMAIL ||
        "Listening Room <noreply@listeningroom.com>";

      // Validate environment with better error messages
      if (!process.env.RESEND_API_KEY) {
        throw new Error(
          "RESEND_API_KEY is not configured. Please add your Resend API key to environment variables. " +
            "Get your API key from https://resend.com/api-keys and set RESEND_API_KEY=re_your_key_here",
        );
      }

      // Validate and clean email addresses
      const validateEmail = (email) => {
        if (!email || typeof email !== "string") return false;
        const cleaned = email.trim();
        if (!cleaned) return false;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(cleaned);
      };

      // Process and validate recipients
      let recipients;
      if (Array.isArray(to)) {
        recipients = to.filter(validateEmail);
        if (recipients.length === 0) {
          throw new Error("No valid email recipients provided");
        }
      } else {
        if (!validateEmail(to)) {
          throw new Error("Invalid email recipient format");
        }
        recipients = [to.trim()];
      }

      // Validate required fields
      if (!subject || typeof subject !== "string" || !subject.trim()) {
        throw new Error("Email subject is required and must be non-empty");
      }
      if (!html || typeof html !== "string" || !html.trim()) {
        throw new Error("Email HTML content is required and must be non-empty");
      }

      // Clean and prepare email payload - only include fields with valid values
      const emailPayload = {
        from: fromAddress.trim(),
        to: recipients,
        subject: subject.trim(),
        html: html.trim(),
      };

      // Only add text if it exists and has content
      if (text && typeof text === "string" && text.trim()) {
        emailPayload.text = text.trim();
      }

      // Process tags - only include valid, non-empty strings
      if (tags && Array.isArray(tags) && tags.length > 0) {
        const validTags = tags
          .filter((tag) => tag && typeof tag === "string" && tag.trim())
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0);

        // Add attempt and environment tags
        validTags.push(`attempt_${attempt}`);
        if (process.env.NODE_ENV) {
          validTags.push(process.env.NODE_ENV);
        }

        // Only include tags if we have valid ones
        if (validTags.length > 0) {
          emailPayload.tags = validTags;
        }
      }

      // Send email via Resend
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(emailPayload),
      });

      const data = await response.json();

      if (!response.ok) {
        // Provide specific error guidance
        let errorMessage = `Email API error: ${response.status} - ${data.message || "Unknown error"}`;

        if (response.status === 401) {
          errorMessage +=
            ". Check your RESEND_API_KEY - it may be invalid or expired.";
        } else if (response.status === 403) {
          errorMessage +=
            ". Your domain may not be verified. Visit https://resend.com/domains to verify your domain.";
        } else if (response.status === 422) {
          if (data.message?.includes("domain")) {
            errorMessage +=
              ". Make sure your FROM_EMAIL uses a verified domain in Resend.";
          } else if (data.message?.includes("Invalid email")) {
            errorMessage += ". Check that all email addresses are valid.";
          } else if (data.message?.includes("literal value")) {
            errorMessage +=
              ". Email payload contains invalid or empty values. Check all fields for proper formatting.";
          } else {
            errorMessage +=
              ". Check your email payload format - " +
              (data.message || "invalid data provided");
          }
        }

        throw new Error(errorMessage);
      }

      // Log successful send for monitoring
      console.log(`Email sent successfully: ${data.id} (attempt ${attempt})`);

      return {
        id: data.id,
        attempt,
        success: true,
      };
    } catch (error) {
      lastError = error;
      console.error(`Email send attempt ${attempt} failed:`, error.message);

      // Don't retry for certain errors
      if (
        error.message.includes("Invalid email") ||
        error.message.includes("API key") ||
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("RESEND_API_KEY is not configured") ||
        error.message.includes("required") ||
        error.message.includes("literal value")
      ) {
        break;
      }

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw new Error(
    `Failed to send email after ${maxRetries} attempts: ${lastError.message}`,
  );
}

// Bulk email sending with rate limiting
export async function sendBulkEmails(emails, options = {}) {
  const {
    batchSize = 5,
    delayBetweenBatches = 1000,
    stopOnError = false,
  } = options;

  const results = [];
  const errors = [];

  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    const batchPromises = batch.map(async (emailData, index) => {
      try {
        const result = await sendEmail({
          ...emailData,
          tags: [
            ...(emailData.tags || []),
            `batch_${Math.floor(i / batchSize) + 1}`,
          ],
        });
        return { success: true, index: i + index, result };
      } catch (error) {
        const errorResult = {
          success: false,
          index: i + index,
          error: error.message,
        };
        errors.push(errorResult);

        if (stopOnError) {
          throw error;
        }

        return errorResult;
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // Add delay between batches to respect rate limits
    if (i + batchSize < emails.length) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenBatches));
    }
  }

  return {
    results,
    errors,
    successCount: results.filter((r) => r.success).length,
    errorCount: errors.length,
  };
}

// Email template helpers
export function createEmailTemplate(type, data) {
  const baseStyles = `
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 600px;
    margin: 0 auto;
    padding: 20px;
  `;

  const templates = {
    verification: (data) => `
      <div style="${baseStyles}">
        <div style="text-align: center; margin-bottom: 30px;">
          <img src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/" alt="Listening Room" style="height: 40px;">
        </div>
        
        <h1 style="color: #0D9488; text-align: center; margin-bottom: 30px;">${data.title}</h1>
        
        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 24px; margin-bottom: 24px;">
          <p style="margin: 0 0 16px 0;">Hi ${data.name || "there"},</p>
          <p style="margin: 0 0 16px 0;">${data.message}</p>
          ${data.instructions ? `<p style="margin: 0;">${data.instructions}</p>` : ""}
        </div>
        
        ${
          data.actionUrl
            ? `
          <div style="text-align: center; margin: 32px 0;">
            <a href="${data.actionUrl}" 
               style="background-color: #0D9488; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">
              ${data.actionText || "Take Action"}
            </a>
          </div>
        `
            : ""
        }
        
        ${
          data.warning
            ? `
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>Security Notice:</strong> ${data.warning}
            </p>
          </div>
        `
            : ""
        }
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 32px;">
          <p style="margin: 0; color: #6b7280; font-size: 12px; text-align: center;">
            This email was sent by Listening Room.<br>
            If you have questions, please contact our support team.
          </p>
        </div>
      </div>
    `,

    notification: (data) => `
      <div style="${baseStyles}">
        <h2 style="color: #1f2937;">${data.title}</h2>
        <p>${data.message}</p>
        
        ${
          data.actionUrl
            ? `
          <div style="margin: 20px 0;">
            <a href="${data.actionUrl}" 
               style="background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              ${data.actionText || "View Details"}
            </a>
          </div>
        `
            : ""
        }
        
        <div style="border-top: 1px solid #e5e7eb; padding-top: 16px; margin-top: 24px;">
          <p style="margin: 0; color: #6b7280; font-size: 12px;">
            Listening Room - Confidential Support Platform
          </p>
        </div>
      </div>
    `,
  };

  return templates[type] ? templates[type](data) : null;
}

// Domain verification status check
export async function checkDomainVerification() {
  try {
    if (!process.env.RESEND_API_KEY) {
      return { verified: false, error: "No API key configured" };
    }

    const response = await fetch("https://api.resend.com/domains", {
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return { verified: false, error: `API error: ${response.status}` };
    }

    const data = await response.json();
    const domains = data.data || [];

    const verifiedDomains = domains.filter(
      (domain) => domain.status === "verified",
    );

    return {
      verified: verifiedDomains.length > 0,
      domains: domains.map((d) => ({
        name: d.name,
        status: d.status,
        region: d.region,
      })),
      verifiedDomains: verifiedDomains.map((d) => d.name),
    };
  } catch (error) {
    return { verified: false, error: error.message };
  }
}
