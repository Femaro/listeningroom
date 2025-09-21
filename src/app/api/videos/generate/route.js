import { videoGenerationService, videoManagementService } from "@/utils/videoGenerationService";
import { TRAINING_MODULES } from "@/utils/trainingData";

// POST - Generate video for a training module
export async function POST(request) {
  try {
    const body = await request.json();
    const { moduleId, service = 'd-id' } = body;

    if (!moduleId) {
      return Response.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    // Find the module
    const module = TRAINING_MODULES.find(m => m.id === moduleId);
    if (!module) {
      return Response.json(
        { error: 'Module not found' },
        { status: 404 }
      );
    }

    // Generate video based on service
    let result;
    switch (service) {
      case 'd-id':
        result = await videoGenerationService.generateTrainingVideo(module);
        break;
      case 'lumen5':
        result = await videoGenerationService.generateLumen5Video(module);
        break;
      case 'synthesia':
        result = await videoGenerationService.generateSynthesiaVideo(module);
        break;
      default:
        return Response.json(
          { error: 'Invalid service specified' },
          { status: 400 }
        );
    }

    if (result.success) {
      // Store video metadata
      await videoManagementService.storeVideoMetadata(moduleId, result);
      
      return Response.json({
        success: true,
        message: 'Video generated successfully',
        video: result
      });
    } else {
      return Response.json(
        { error: result.error || 'Video generation failed' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error generating video:', error);
    return Response.json(
      { error: 'Failed to generate video' },
      { status: 500 }
    );
  }
}

// GET - Get video status for a module
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return Response.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    const video = await videoManagementService.getVideoMetadata(moduleId);
    
    if (!video) {
      return Response.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }

    return Response.json({
      success: true,
      video
    });

  } catch (error) {
    console.error('Error getting video status:', error);
    return Response.json(
      { error: 'Failed to get video status' },
      { status: 500 }
    );
  }
}

// PATCH - Update video status
export async function PATCH(request) {
  try {
    const body = await request.json();
    const { moduleId, status } = body;

    if (!moduleId || !status) {
      return Response.json(
        { error: 'Module ID and status are required' },
        { status: 400 }
      );
    }

    const video = await videoManagementService.updateVideoStatus(moduleId, status);
    
    return Response.json({
      success: true,
      message: 'Video status updated successfully',
      video
    });

  } catch (error) {
    console.error('Error updating video status:', error);
    return Response.json(
      { error: 'Failed to update video status' },
      { status: 500 }
    );
  }
}

// DELETE - Delete video
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return Response.json(
        { error: 'Module ID is required' },
        { status: 400 }
      );
    }

    // In real implementation, delete from cloud storage
    await videoManagementService.updateVideoStatus(moduleId, 'deleted');
    
    return Response.json({
      success: true,
      message: 'Video deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting video:', error);
    return Response.json(
      { error: 'Failed to delete video' },
      { status: 500 }
    );
  }
}
