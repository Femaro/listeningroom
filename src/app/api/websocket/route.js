import { auth } from "@/auth";
import sql from "@/app/api/utils/sql";

// In-memory store for WebSocket connections (in production, use Redis)
const connections = new Map();
const rooms = new Map();

export async function GET(request) {
  const url = new URL(request.url);
  const sessionId = url.searchParams.get('sessionId');
  
  if (!sessionId) {
    return new Response('Session ID required', { status: 400 });
  }

  // Upgrade to WebSocket
  const { socket, response } = Deno.upgradeWebSocket(request);
  
  socket.onopen = () => {
    console.log(`WebSocket connected for session ${sessionId}`);
    
    // Store connection
    connections.set(socket, { sessionId, userId: null });
    
    // Initialize room if it doesn't exist
    if (!rooms.has(sessionId)) {
      rooms.set(sessionId, new Set());
    }
    
    rooms.get(sessionId).add(socket);
  };

  socket.onmessage = async (event) => {
    try {
      const data = JSON.parse(event.data);
      const connection = connections.get(socket);
      
      // Authenticate user if not already done
      if (!connection.userId && data.type === 'auth') {
        try {
          // Verify session token (you'll need to pass this from frontend)
          const session = await verifySessionToken(data.token);
          if (session?.user?.id) {
            connection.userId = session.user.id;
            
            // Verify user has access to this session
            const hasAccess = await verifySessionAccess(session.user.id, sessionId);
            if (!hasAccess) {
              socket.close(1008, 'Unauthorized');
              return;
            }
            
            socket.send(JSON.stringify({ type: 'auth-success' }));
          } else {
            socket.close(1008, 'Invalid authentication');
            return;
          }
        } catch (error) {
          console.error('Auth error:', error);
          socket.close(1008, 'Authentication failed');
          return;
        }
      }
      
      // Handle signaling messages
      if (connection.userId && data.sessionId === sessionId) {
        broadcastToRoom(sessionId, data, socket);
      }
      
    } catch (error) {
      console.error('WebSocket message error:', error);
    }
  };

  socket.onclose = () => {
    const connection = connections.get(socket);
    if (connection) {
      console.log(`WebSocket disconnected for session ${connection.sessionId}`);
      
      // Remove from room
      const room = rooms.get(connection.sessionId);
      if (room) {
        room.delete(socket);
        if (room.size === 0) {
          rooms.delete(connection.sessionId);
        }
      }
      
      // Remove connection
      connections.delete(socket);
      
      // Notify other participants
      broadcastToRoom(connection.sessionId, {
        type: 'participant-left',
        userId: connection.userId
      }, socket);
    }
  };

  return response;
}

function broadcastToRoom(sessionId, message, excludeSocket = null) {
  const room = rooms.get(sessionId);
  if (!room) return;
  
  const messageStr = JSON.stringify(message);
  
  for (const socket of room) {
    if (socket !== excludeSocket && socket.readyState === WebSocket.OPEN) {
      try {
        socket.send(messageStr);
      } catch (error) {
        console.error('Failed to send message to socket:', error);
        // Remove broken socket
        room.delete(socket);
        connections.delete(socket);
      }
    }
  }
}

async function verifySessionToken(token) {
  // Implementation depends on your auth system
  // This is a placeholder - you'll need to implement actual token verification
  try {
    // Decode and verify JWT token or session token
    // Return user session if valid
    return null; // Placeholder
  } catch (error) {
    return null;
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