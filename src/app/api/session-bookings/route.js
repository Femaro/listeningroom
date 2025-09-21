import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduled_session_id, session_code } = body;

    let sessionId = scheduled_session_id;

    // If session_code is provided, find the session by code
    if (session_code && !sessionId) {
      const sessionByCode = await sql`
        SELECT id FROM scheduled_sessions WHERE session_code = ${session_code}
      `;
      if (sessionByCode.length === 0) {
        return Response.json(
          { error: "Invalid session code" },
          { status: 404 },
        );
      }
      sessionId = sessionByCode[0].id;
    }

    if (!sessionId) {
      return Response.json(
        { error: "Session ID or session code is required" },
        { status: 400 },
      );
    }

    // Check if session exists and is available
    const sessionDetails = await sql`
      SELECT ss.*, 
             COUNT(sb.id) as booked_participants,
             au.name as volunteer_name,
             au.email as volunteer_email,
             up.user_type as volunteer_type
      FROM scheduled_sessions ss
      LEFT JOIN session_bookings sb ON ss.id = sb.scheduled_session_id AND sb.booking_status = 'booked'
      JOIN auth_users au ON ss.volunteer_id = au.id
      JOIN user_profiles up ON ss.volunteer_id = up.user_id
      WHERE ss.id = ${sessionId}
      AND ss.status = 'scheduled'
      AND (ss.session_date || ' ' || ss.start_time)::timestamp > NOW()
      GROUP BY ss.id, au.name, au.email, up.user_type
    `;

    if (sessionDetails.length === 0) {
      return Response.json(
        { error: "Session not found or not available for booking" },
        { status: 404 },
      );
    }

    const sessionInfo = sessionDetails[0];

    // Check if session is full
    if (sessionInfo.booked_participants >= sessionInfo.max_participants) {
      return Response.json({ error: "Session is full" }, { status: 400 });
    }

    // Check if user already booked this session
    const existingBooking = await sql`
      SELECT id FROM session_bookings 
      WHERE scheduled_session_id = ${sessionId} 
      AND user_id = ${session.user.id}
      AND booking_status != 'cancelled'
    `;

    if (existingBooking.length > 0) {
      return Response.json(
        { error: "You have already booked this session" },
        { status: 400 },
      );
    }

    // Create the booking
    const booking = await sql`
      INSERT INTO session_bookings (scheduled_session_id, user_id)
      VALUES (${sessionId}, ${session.user.id})
      RETURNING *
    `;

    // Get user details for emails
    const userData = await sql`
      SELECT au.name as seeker_name, au.email as seeker_email
      FROM auth_users au
      WHERE au.id = ${session.user.id}
    `;

    const seekerName = userData[0]?.seeker_name || "User";
    const seekerEmail = userData[0]?.seeker_email;

    // Format session date and time
    const sessionDateTime = new Date(
      `${sessionInfo.session_date}T${sessionInfo.start_time}`,
    );
    const reminderTime = new Date(sessionDateTime.getTime() - 15 * 60 * 1000); // 15 minutes before

    const formattedDate = sessionDateTime.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const formattedTime = sessionDateTime.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    // Send confirmation email to seeker
    const seekerEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/" alt="Listening Room" style="height: 50px;">
          </div>
          
          <h1 style="color: #0D9488; text-align: center; margin-bottom: 20px;">Session Confirmed! ✅</h1>
          
          <div style="background-color: #f0fdfa; border-left: 4px solid #0D9488; padding: 20px; margin: 20px 0;">
            <h2 style="color: #065f46; margin-top: 0; font-size: 18px;">Your session is booked:</h2>
            <div style="color: #047857;">
              <p style="margin: 8px 0;"><strong>Session:</strong> ${sessionInfo.title}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${formattedTime}</p>
              <p style="margin: 8px 0;"><strong>Duration:</strong> ${sessionInfo.duration_minutes} minutes</p>
              <p style="margin: 8px 0;"><strong>Volunteer:</strong> ${sessionInfo.volunteer_name}</p>
            </div>
          </div>
          
          ${sessionInfo.description ? `<p style="color: #374151; line-height: 1.6;"><strong>About this session:</strong><br>${sessionInfo.description}</p>` : ""}
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>📅 We'll send you a reminder 15 minutes before the session starts.</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #6b7280; margin-bottom: 10px;">Join your session with this code:</p>
            <div style="background: #f9fafb; padding: 15px; border-radius: 6px; border: 2px dashed #d1d5db;">
              <span style="font-size: 20px; font-weight: bold; letter-spacing: 2px; color: #0D9488;">${sessionInfo.session_code}</span>
            </div>
          </div>
          
          <div style="background-color: #eff6ff; border: 1px solid #3b82f6; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #1e40af; font-size: 14px;">
              💝 <strong>Remember:</strong> Your first 5 minutes are completely free!
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Need to reschedule or have questions? Visit your <a href="${process.env.NEXTAUTH_URL}/seeker/dashboard" style="color: #0D9488;">dashboard</a>
            </p>
          </div>
        </div>
      </div>
    `;

    // Send notification email to volunteer
    const volunteerEmailBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f8fafc; padding: 20px;">
        <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://ucarecdn.com/e05f1122-ee17-479a-b4b8-456584592d00/-/format/auto/" alt="Listening Room" style="height: 50px;">
          </div>
          
          <h1 style="color: #059669; text-align: center; margin-bottom: 20px;">New Session Booking! 🌟</h1>
          
          <p style="color: #374151; font-size: 16px;">Hi ${sessionInfo.volunteer_name},</p>
          
          <p style="color: #374151; line-height: 1.6;">
            Great news! Someone has booked your upcoming session. Here are the details:
          </p>
          
          <div style="background-color: #f0fdf4; border-left: 4px solid #059669; padding: 20px; margin: 20px 0;">
            <h2 style="color: #065f46; margin-top: 0; font-size: 18px;">Session Details:</h2>
            <div style="color: #047857;">
              <p style="margin: 8px 0;"><strong>Session:</strong> ${sessionInfo.title}</p>
              <p style="margin: 8px 0;"><strong>Date:</strong> ${formattedDate}</p>
              <p style="margin: 8px 0;"><strong>Time:</strong> ${formattedTime}</p>
              <p style="margin: 8px 0;"><strong>Duration:</strong> ${sessionInfo.duration_minutes} minutes</p>
              <p style="margin: 8px 0;"><strong>Participant:</strong> ${seekerName}</p>
              <p style="margin: 8px 0;"><strong>Current bookings:</strong> ${parseInt(sessionInfo.booked_participants) + 1}/${sessionInfo.max_participants}</p>
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e; font-size: 14px;">
              <strong>📋 Please be ready to join the session 5 minutes early to ensure a smooth start.</strong>
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/volunteer/dashboard" style="background: linear-gradient(135deg, #059669, #047857); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-weight: 600;">
              View in Dashboard
            </a>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #6b7280; font-size: 14px;">
              Thank you for being part of our volunteer community! 💚
            </p>
          </div>
        </div>
      </div>
    `;

    // Queue emails for sending
    await sql`
      INSERT INTO email_notifications (
        user_id, email, subject, body, template_type, scheduled_for
      ) VALUES (
        ${session.user.id},
        ${seekerEmail},
        'Session Confirmed - ${sessionInfo.title}',
        ${seekerEmailBody},
        'session_booking_confirmation',
        NOW()
      ), (
        ${sessionInfo.volunteer_id},
        ${sessionInfo.volunteer_email},
        'New Session Booking - ${sessionInfo.title}',
        ${volunteerEmailBody},
        'volunteer_booking_notification',
        NOW()
      )
    `;

    // Create notification reminders
    await sql`
      INSERT INTO session_notifications (
        scheduled_session_id,
        user_id,
        notification_type,
        scheduled_for
      ) VALUES (
        ${sessionId},
        ${session.user.id},
        'booking_confirmation',
        NOW()
      ), (
        ${sessionId},
        ${session.user.id},
        'session_reminder',
        ${reminderTime.toISOString()}
      ), (
        ${sessionId},
        ${sessionInfo.volunteer_id},
        'session_reminder',
        ${reminderTime.toISOString()}
      )
    `;

    return Response.json({
      booking: booking[0],
      session: sessionInfo,
      message:
        "Successfully booked session. Check your email for confirmation!",
    });
  } catch (error) {
    console.error("Error creating booking:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's bookings
    const bookings = await sql`
      SELECT sb.*, 
             ss.title,
             ss.description,
             ss.session_date,
             ss.start_time,
             ss.duration_minutes,
             ss.session_code,
             ss.status as session_status,
             up.username as volunteer_name
      FROM session_bookings sb
      JOIN scheduled_sessions ss ON sb.scheduled_session_id = ss.id
      JOIN user_profiles up ON ss.volunteer_id = up.user_id
      WHERE sb.user_id = ${session.user.id}
      ORDER BY ss.session_date ASC, ss.start_time ASC
    `;

    return Response.json({ bookings });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { scheduled_session_id } = body;

    // Check if booking exists
    const booking = await sql`
      SELECT sb.*, ss.session_date, ss.start_time
      FROM session_bookings sb
      JOIN scheduled_sessions ss ON sb.scheduled_session_id = ss.id
      WHERE sb.scheduled_session_id = ${scheduled_session_id}
      AND sb.user_id = ${session.user.id}
    `;

    if (booking.length === 0) {
      return Response.json({ error: "Booking not found" }, { status: 404 });
    }

    // Check if session hasn't started yet
    const sessionDateTime = new Date(
      `${booking[0].session_date}T${booking[0].start_time}`,
    );
    if (sessionDateTime <= new Date()) {
      return Response.json(
        {
          error: "Cannot cancel booking for sessions that have already started",
        },
        { status: 400 },
      );
    }

    // Cancel the booking
    await sql`
      UPDATE session_bookings 
      SET booking_status = 'cancelled'
      WHERE scheduled_session_id = ${scheduled_session_id}
      AND user_id = ${session.user.id}
    `;

    return Response.json({ message: "Booking cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
