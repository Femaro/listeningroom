import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// For Next.js API routes, we'll create a signaling API instead of direct WebSocket
// This will work with Socket.IO or similar libraries on the frontend

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, type, data: signalData, targetUserId } = body;

    // Verify user has access to this session
    const hasAccess = await verifySessionAccess(session.user.id, sessionId);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Store signaling message for the target user
    await sql`
      INSERT INTO signaling_messages (
        session_id, from_user_id, to_user_id, message_type, signal_data, created_at
      )
      VALUES (
        ${sessionId}, 
        ${session.user.id}, 
        ${targetUserId || null}, 
        ${type}, 
        ${JSON.stringify(signalData)}, 
        NOW()
      )
    `;

    return Response.json({ success: true });

  } catch (error) {
    console.error("Signaling error:", error);
    return Response.json({ error: "Signaling failed" }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const lastMessageId = url.searchParams.get('lastMessageId') || '0';

    if (!sessionId) {
      return Response.json({ error: "Session ID required" }, { status: 400 });
    }

    // Verify access
    const hasAccess = await verifySessionAccess(session.user.id, sessionId);
    if (!hasAccess) {
      return Response.json({ error: "Access denied" }, { status: 403 });
    }

    // Get new signaling messages for this user
    const messages = await sql`
      SELECT id, from_user_id, message_type, signal_data, created_at
      FROM signaling_messages 
      WHERE session_id = ${sessionId} 
      AND (to_user_id = ${session.user.id} OR to_user_id IS NULL)
      AND id > ${lastMessageId}
      AND from_user_id != ${session.user.id}
      ORDER BY created_at ASC
      LIMIT 50
    `;

    // Mark messages as delivered
    if (messages.length > 0) {
      const messageIds = messages.map(m => m.id);
      await sql`
        UPDATE signaling_messages 
        SET delivered_at = NOW() 
        WHERE id = ANY(${messageIds})
      `;
    }

    return Response.json({ 
      messages: messages.map(msg => ({
        id: msg.id,
        from: msg.from_user_id,
        type: msg.message_type,
        data: JSON.parse(msg.signal_data),
        timestamp: msg.created_at
      }))
    });

  } catch (error) {
    console.error("Get signaling messages error:", error);
    return Response.json({ error: "Failed to get messages" }, { status: 500 });
  }
}

async function verifySessionAccess(userId, sessionId) {
  try {
    // Check if user is participant in this session
    const participants = await sql`
      SELECT user_id FROM session_participants 
      WHERE session_id = ${sessionId} AND user_id = ${userId} AND is_active = true
    `;
    
    return participants.length > 0;
  } catch (error) {
    console.error('Error verifying session access:', error);
    return false;
  }
}