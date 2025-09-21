import { checkDomainVerification } from "@/app/api/utils/send-email";
import sql from "@/app/api/utils/sql";

export async function GET(request) {
  const results = {
    timestamp: new Date().toISOString(),
    checks: [],
    overall: 'unknown'
  };

  // 1. Database Check
  try {
    await sql`SELECT 1 as test`;
    results.checks.push({
      name: 'Database Connection',
      status: 'pass',
      message: 'Database is accessible'
    });
  } catch (error) {
    results.checks.push({
      name: 'Database Connection',
      status: 'fail', 
      message: error.message
    });
  }

  // 2. Email Service Check
  try {
    const domainCheck = await checkDomainVerification();
    results.checks.push({
      name: 'Email Service',
      status: domainCheck.verified ? 'pass' : 'warning',
      message: domainCheck.verified 
        ? `Verified domains: ${domainCheck.verifiedDomains.join(', ')}`
        : `API configured but domains need verification`
    });
  } catch (error) {
    results.checks.push({
      name: 'Email Service',
      status: 'fail',
      message: error.message
    });
  }

  // 3. WebRTC Configuration Check
  const webrtcConfig = {
    stunConfigured: true, // Always have STUN servers
    turnConfigured: !!(process.env.NEXT_PUBLIC_TURN_SERVER_URL || process.env.NEXT_PUBLIC_TURN_SERVERS)
  };

  results.checks.push({
    name: 'WebRTC Configuration',
    status: webrtcConfig.turnConfigured ? 'pass' : 'warning',
    message: webrtcConfig.turnConfigured 
      ? 'STUN and TURN servers configured'
      : 'Only STUN servers configured - add TURN for better connectivity'
  });

  // 4. Environment Variables Check
  const requiredEnvs = [
    'RESEND_API_KEY',
    'FROM_EMAIL', 
    'NEXTAUTH_URL',
    'NEXTAUTH_SECRET'
  ];
  
  const missingEnvs = requiredEnvs.filter(env => !process.env[env]);
  
  results.checks.push({
    name: 'Environment Variables',
    status: missingEnvs.length === 0 ? 'pass' : 'fail',
    message: missingEnvs.length === 0 
      ? 'All required environment variables configured'
      : `Missing: ${missingEnvs.join(', ')}`
  });

  // 5. Signaling Table Check
  try {
    await sql`SELECT COUNT(*) FROM signaling_messages`;
    results.checks.push({
      name: 'WebRTC Signaling Table',
      status: 'pass',
      message: 'Signaling messages table exists and accessible'
    });
  } catch (error) {
    results.checks.push({
      name: 'WebRTC Signaling Table',
      status: 'fail',
      message: 'Signaling table missing - WebRTC may not work properly'
    });
  }

  // 6. Email Verification Table Check
  try {
    await sql`SELECT COUNT(*) FROM email_verification_tokens`;
    results.checks.push({
      name: 'Email Verification Table',
      status: 'pass', 
      message: 'Email verification tokens table exists'
    });
  } catch (error) {
    results.checks.push({
      name: 'Email Verification Table',
      status: 'fail',
      message: 'Email verification table missing'
    });
  }

  // Calculate overall status
  const failCount = results.checks.filter(c => c.status === 'fail').length;
  const warningCount = results.checks.filter(c => c.status === 'warning').length;
  
  if (failCount > 0) {
    results.overall = 'needs_attention';
  } else if (warningCount > 0) {
    results.overall = 'partial';
  } else {
    results.overall = 'ready';
  }

  return Response.json(results);
}