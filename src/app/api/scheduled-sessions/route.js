// app/api/scheduled-sessions/route.js
import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// Generate a unique 6-character session code
function generateSessionCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// GET sessions (volunteers see own, seekers see available)
export async function GET(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(req.url);
    const statusFilter = url.searchParams.get("status") || "scheduled";
    const available = url.searchParams.get("available");
    const filter = url.searchParams.get("filter");
    const volunteerIdFilter = url.searchParams.get("volunteer_id");

    // Determine caller role
    const userProfile = await sql`
      SELECT user_type FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    const userType = userProfile[0]?.user_type || "seeker";

    if (userType === "volunteer") {
      // Volunteers see their own sessions with booking counts
      const sessions = await sql`
        SELECT 
          ss.*,
          au.name as volunteer_name,
          up.country_name as volunteer_country,
          COUNT(sb.id) as booked_participants
        FROM scheduled_sessions ss
        LEFT JOIN auth_users au ON ss.volunteer_id = au.id
        LEFT JOIN user_profiles up ON ss.volunteer_id = up.user_id
        LEFT JOIN session_bookings sb ON ss.id = sb.scheduled_session_id 
          AND sb.booking_status = 'booked'
        WHERE ss.volunteer_id = ${session.user.id}
        AND ss.status = ${statusFilter}
        GROUP BY ss.id, au.name, up.country_name
        ORDER BY ss.session_date ASC, ss.start_time ASC
      `;
      return Response.json({ sessions });
    } else if (userType === "admin") {
      // Admins see all sessions or filter by volunteer
      let query = `
        SELECT 
          ss.*,
          au.name as volunteer_name,
          up.country_name as volunteer_country,
          COUNT(sb.id) as booked_participants
        FROM scheduled_sessions ss
        LEFT JOIN auth_users au ON ss.volunteer_id = au.id
        LEFT JOIN user_profiles up ON ss.volunteer_id = up.user_id
        LEFT JOIN session_bookings sb ON ss.id = sb.scheduled_session_id 
          AND sb.booking_status = 'booked'
        WHERE ss.status = $1
      `;
      const params = [statusFilter];

      if (volunteerIdFilter) {
        query += ` AND ss.volunteer_id = $${params.length + 1}`;
        params.push(volunteerIdFilter);
      }

      query += `
        GROUP BY ss.id, au.name, up.country_name
        ORDER BY ss.session_date ASC, ss.start_time ASC
      `;

      const sessions = await sql(query, params);
      return Response.json({ sessions });
    } else {
      // Seekers see available sessions they can book
      let query = `
        SELECT 
          ss.*,
          au.name as volunteer_name,
          up.country_name as volunteer_country,
          COUNT(sb.id) as booked_participants
        FROM scheduled_sessions ss
        LEFT JOIN auth_users au ON ss.volunteer_id = au.id
        LEFT JOIN user_profiles up ON ss.volunteer_id = up.user_id
        LEFT JOIN session_bookings sb ON ss.id = sb.scheduled_session_id 
          AND sb.booking_status = 'booked'
        WHERE ss.status = $1
      `;
      const params = [statusFilter];

      // Only show future sessions for seekers
      if (available === "true") {
        query += ` AND (ss.session_date > CURRENT_DATE OR 
                    (ss.session_date = CURRENT_DATE AND ss.start_time > CURRENT_TIME))`;

        // Apply time-based filters
        if (filter === "today") {
          query += ` AND ss.session_date = CURRENT_DATE`;
        } else if (filter === "this_week") {
          query += ` AND ss.session_date BETWEEN CURRENT_DATE AND (CURRENT_DATE + INTERVAL '7 days')`;
        }
      }

      query += `
        GROUP BY ss.id, au.name, up.country_name
        HAVING COUNT(sb.id) < ss.max_participants
        ORDER BY ss.session_date ASC, ss.start_time ASC
        LIMIT 50
      `;

      const sessions = await sql(query, params);
      return Response.json({ sessions });
    }
  } catch (error) {
    console.error("GET sessions error:", error);
    return Response.json(
      { error: "Failed to fetch sessions" },
      { status: 500 },
    );
  }
}

// CREATE a session
export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is a volunteer
    const userProfile = await sql`
      SELECT user_type FROM user_profiles WHERE user_id = ${session.user.id}
    `;

    if (userProfile.length === 0 || userProfile[0].user_type !== "volunteer") {
      return Response.json(
        { error: "Only volunteers can create sessions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const {
      title,
      description,
      session_date,
      start_time,
      duration_minutes = 60,
      max_participants = 1,
    } = body;

    // Validate required fields
    if (!title || !session_date || !start_time) {
      return Response.json(
        { error: "Missing required fields: title, session_date, start_time" },
        { status: 400 },
      );
    }

    // Validate future date
    const sessionDateTime = new Date(`${session_date}T${start_time}`);
    if (sessionDateTime <= new Date()) {
      return Response.json(
        { error: "Session must be scheduled for a future date and time" },
        { status: 400 },
      );
    }

    // Generate unique session code
    let sessionCode;
    let attempts = 0;
    do {
      sessionCode = generateSessionCode();
      const existing = await sql`
        SELECT id FROM scheduled_sessions WHERE session_code = ${sessionCode}
      `;
      if (existing.length === 0) break;
      attempts++;
    } while (attempts < 10);

    if (attempts >= 10) {
      return Response.json(
        { error: "Unable to generate unique session code" },
        { status: 500 },
      );
    }

    const newSession = await sql`
      INSERT INTO scheduled_sessions (
        volunteer_id, title, description, session_date, start_time, 
        duration_minutes, max_participants, session_code, status
      ) VALUES (
        ${session.user.id},
        ${title},
        ${description || ""},
        ${session_date},
        ${start_time},
        ${Number(duration_minutes) || 60},
        ${Number(max_participants) || 1},
        ${sessionCode},
        'scheduled'
      ) RETURNING *
    `;

    // Send notification for new scheduled session
    try {
      await fetch(
        `${req.headers.get("origin") || process.env.NEXTAUTH_URL}/api/admin/notifications`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: "new_scheduled_session",
            data: {
              sessionTitle: title,
              volunteerName: session.user.name,
              sessionDate: session_date,
              startTime: start_time,
              duration: duration_minutes,
              maxParticipants: max_participants,
              sessionCode: sessionCode,
            },
          }),
        },
      );
    } catch (notificationError) {
      console.error("Failed to send session notification:", notificationError);
      // Don't fail the session creation if notification fails
    }

    return Response.json(
      {
        session: newSession[0],
        message: "Session created successfully",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST session error:", error);
    return Response.json(
      { error: "Failed to create session" },
      { status: 500 },
    );
  }
}
