import { db } from "@/utils/firebase";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  updateDoc,
  doc,
  serverTimestamp 
} from "firebase/firestore";

// POST - Submit training application
export async function POST(request) {
  try {
    const body = await request.json();
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'country', 'city', 'timezone', 'background', 'motivation'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return Response.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare application data
    const applicationData = {
      // Personal Information
      name: body.name,
      email: body.email,
      phone: body.phone || '',
      country: body.country,
      city: body.city,
      timezone: body.timezone,
      
      // Background
      background: body.background,
      experience: body.experience || '',
      motivation: body.motivation,
      
      // Training Preferences
      trainingGoals: body.trainingGoals || [],
      specializations: body.specializations || [],
      preferredLanguages: body.preferredLanguages || ['English'],
      
      // Application Status
      status: 'pending', // pending, approved, rejected
      applicationType: 'training', // training, volunteer
      
      // Timestamps
      submittedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Agreements
      agreeToTerms: body.agreeToTerms || false,
      agreeToTraining: body.agreeToTraining || false,
      agreeToBackground: body.agreeToBackground || false,
    };

    // Add to Firebase
    const docRef = await addDoc(collection(db, 'training_applications'), applicationData);

    return Response.json({
      success: true,
      message: 'Training application submitted successfully',
      applicationId: docRef.id
    });

  } catch (error) {
    console.error('Error submitting training application:', error);
    return Response.json(
      { error: 'Failed to submit training application' },
      { status: 500 }
    );
  }
}

// GET - Retrieve training applications (admin only)
export async function GET(request) {
  try {
    console.log('Training applications API GET called');
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit')) || 50;

    let q = query(
      collection(db, 'training_applications'),
      orderBy('submittedAt', 'desc')
    );

    if (status) {
      q = query(q, where('status', '==', status));
    }

    const querySnapshot = await getDocs(q);
    const applications = [];

    querySnapshot.forEach((doc) => {
      applications.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`Found ${applications.length} training applications`);

    return Response.json({
      success: true,
      applications: applications.slice(0, limit)
    });

  } catch (error) {
    console.error('Error fetching training applications:', error);
    return Response.json(
      { error: 'Failed to fetch training applications' },
      { status: 500 }
    );
  }
}

// PATCH - Update application status (admin only)
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { applicationId, status, adminNotes } = body;

    if (!applicationId || !status) {
      return Response.json(
        { error: 'Application ID and status are required' },
        { status: 400 }
      );
    }

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { error: 'Invalid status. Must be one of: pending, approved, rejected' },
        { status: 400 }
      );
    }

    const applicationRef = doc(db, 'training_applications', applicationId);
    
    const updateData = {
      status,
      updatedAt: serverTimestamp(),
      reviewedAt: serverTimestamp(),
    };

    if (adminNotes) {
      updateData.adminNotes = adminNotes;
    }

    await updateDoc(applicationRef, updateData);

    // If approved, create user profile for training access
    if (status === 'approved') {
      try {
        const applicationDoc = await getDocs(query(collection(db, 'training_applications'), where('__name__', '==', applicationId)));
        const applicationData = applicationDoc.docs[0]?.data();
        
        if (applicationData) {
          // Create user profile for training access
          await addDoc(collection(db, 'user_profiles'), {
            email: applicationData.email,
            displayName: applicationData.name,
            userType: 'volunteer',
            volunteerLevel: 0,
            volunteerLevelName: 'Trainee',
            status: 'active',
            trainingApplicationId: applicationId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            // Store additional info from application
            phone: applicationData.phone,
            country: applicationData.country,
            city: applicationData.city,
            timezone: applicationData.timezone,
            background: applicationData.background,
            experience: applicationData.experience,
            motivation: applicationData.motivation,
            trainingGoals: applicationData.trainingGoals,
            specializations: applicationData.specializations,
            preferredLanguages: applicationData.preferredLanguages,
          });
        }
      } catch (profileError) {
        console.error('Error creating user profile:', profileError);
        // Don't fail the approval if profile creation fails
      }
    }

    return Response.json({
      success: true,
      message: `Application ${status} successfully`
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return Response.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}
