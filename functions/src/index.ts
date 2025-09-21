import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

const corsHandler = cors({ origin: true });

// API function to handle all API routes
export const api = functions.https.onRequest((req, res) => {
  return corsHandler(req, res, async () => {
    try {
      const { method, url } = req;
      const path = url.split('?')[0];

      // Handle different API routes
      if (path.startsWith('/api/training-applications')) {
        return handleTrainingApplications(req, res);
      } else if (path.startsWith('/api/videos/generate')) {
        return handleVideoGeneration(req, res);
      } else if (path.startsWith('/api/contact')) {
        return handleContact(req, res);
      } else {
        res.status(404).json({ error: 'API endpoint not found' });
      }
    } catch (error) {
      console.error('API Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

// Training Applications API
async function handleTrainingApplications(req: any, res: any) {
  const { method } = req;
  const db = admin.firestore();

  try {
    if (method === 'POST') {
      // Submit training application
      const { name, email, phone, experience, motivation, availability, emergencyContact, emergencyPhone } = req.body;

      if (!name || !email || !phone || !experience || !motivation) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const applicationData = {
        name,
        email,
        phone,
        experience,
        motivation,
        availability: availability || 'Flexible',
        emergencyContact: emergencyContact || '',
        emergencyPhone: emergencyPhone || '',
        status: 'pending',
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('training_applications').add(applicationData);
      
      return res.status(201).json({ 
        success: true, 
        message: 'Training application submitted successfully',
        id: docRef.id 
      });

    } else if (method === 'GET') {
      // Get training applications
      const { status, limit } = req.query;
      
      let query = db.collection('training_applications').orderBy('submittedAt', 'desc');
      
      if (status && status !== 'all') {
        query = query.where('status', '==', status);
      }
      
      if (limit) {
        query = query.limit(parseInt(limit));
      }

      const snapshot = await query.get();
      const applications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return res.status(200).json({ applications });

    } else if (method === 'PATCH') {
      // Update training application status
      const { id } = req.params;
      const { status, adminNotes } = req.body;

      if (!id || !status) {
        return res.status(400).json({ error: 'Missing required fields' });
      }

      const updateData: any = {
        status,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };

      if (adminNotes) {
        updateData.adminNotes = adminNotes;
      }

      // If approved, create user profile
      if (status === 'approved') {
        const appDoc = await db.collection('training_applications').doc(id).get();
        const appData = appDoc.data();
        
        if (appData) {
          await db.collection('user_profiles').doc(appData.email).set({
            email: appData.email,
            name: appData.name,
            phone: appData.phone,
            userType: 'volunteer',
            status: 'active',
            trainingStatus: 'approved',
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }

      await db.collection('training_applications').doc(id).update(updateData);

      return res.status(200).json({ 
        success: true, 
        message: 'Application status updated successfully' 
      });

    } else {
      return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Training Applications Error:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}

// Video Generation API
async function handleVideoGeneration(req: any, res: any) {
  const { method } = req;

  if (method === 'POST') {
    const { moduleId, content } = req.body;

    if (!moduleId || !content) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Placeholder for video generation logic
    // In a real implementation, you would integrate with video generation services
    return res.status(200).json({ 
      success: true, 
      message: 'Video generation started',
      videoId: `video_${Date.now()}`
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}

// Contact API
async function handleContact(req: any, res: any) {
  const { method } = req;

  if (method === 'POST') {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Store contact message in Firestore
    const db = admin.firestore();
    await db.collection('contact_messages').add({
      name,
      email,
      subject,
      message,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      status: 'unread'
    });

    return res.status(200).json({ 
      success: true, 
      message: 'Message sent successfully' 
    });
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}
