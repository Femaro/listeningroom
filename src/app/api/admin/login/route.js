export async function POST(request) {
  try {
    const { username, password } = await request.json();

    // Admin credentials
    const ADMIN_USERNAME = "LRAdmin";
    const ADMIN_PASSWORD = "AdminPass123*";

    // Validate credentials
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return Response.json(
        { success: false, error: "Invalid admin credentials" },
        { status: 401 }
      );
    }

    // Create admin session token (simple implementation)
    const adminToken = Buffer.from(`${username}:${Date.now()}`).toString('base64');
    
    // Set session cookie
    const response = Response.json({ 
      success: true, 
      message: "Admin login successful",
      user: {
        username: ADMIN_USERNAME,
        role: "admin",
        loginTime: new Date().toISOString()
      }
    });

    // Set secure cookie for admin session
    response.headers.set('Set-Cookie', 
      `admin_session=${adminToken}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    );

    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return Response.json(
      { success: false, error: "Login failed" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  // Check admin session
  try {
    const cookies = request.headers.get('cookie') || '';
    const adminCookie = cookies.split(';').find(c => c.trim().startsWith('admin_session='));
    
    if (!adminCookie) {
      return Response.json({ authenticated: false }, { status: 401 });
    }

    const token = adminCookie.split('=')[1];
    const decoded = Buffer.from(token, 'base64').toString();
    const [username, timestamp] = decoded.split(':');

    // Check if token is not too old (24 hours)
    const tokenAge = Date.now() - parseInt(timestamp);
    if (tokenAge > 86400000) { // 24 hours in milliseconds
      return Response.json({ authenticated: false, error: "Session expired" }, { status: 401 });
    }

    if (username === "LRAdmin") {
      return Response.json({ 
        authenticated: true, 
        user: { 
          username: "LRAdmin", 
          role: "admin",
          loginTime: new Date(parseInt(timestamp)).toISOString()
        } 
      });
    }

    return Response.json({ authenticated: false }, { status: 401 });

  } catch (error) {
    console.error('Admin auth check error:', error);
    return Response.json({ authenticated: false }, { status: 401 });
  }
}

export async function DELETE(request) {
  // Logout admin
  const response = Response.json({ success: true, message: "Logged out" });
  
  // Clear the admin session cookie
  response.headers.set('Set-Cookie', 
    'admin_session=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0'
  );

  return response;
}