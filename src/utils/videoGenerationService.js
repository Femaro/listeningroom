// Video Generation Service for Training Modules
// This service handles converting text-based training content into videos

export class VideoGenerationService {
  constructor() {
    this.apiKey = process.env.NEXT_PUBLIC_VIDEO_API_KEY;
    this.baseUrl = 'https://api.d-id.com'; // D-ID API for AI video generation
  }

  // Generate video from text content
  async generateTrainingVideo(moduleData) {
    try {
      const videoContent = this.prepareVideoContent(moduleData);
      
      // Create video using AI service
      const videoResponse = await this.createVideo(videoContent);
      
      return {
        success: true,
        videoUrl: videoResponse.video_url,
        duration: videoResponse.duration,
        thumbnail: videoResponse.thumbnail_url
      };
    } catch (error) {
      console.error('Error generating training video:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prepare content for video generation
  prepareVideoContent(moduleData) {
    const sections = moduleData.content.sections;
    let script = `Welcome to ${moduleData.title}. ${moduleData.description}\n\n`;
    
    sections.forEach((section, index) => {
      script += `Section ${index + 1}: ${section.title}\n`;
      script += `${section.content}\n\n`;
    });
    
    script += `Thank you for completing ${moduleData.title}. Please proceed to the quiz to test your understanding.`;
    
    return {
      script: script,
      title: moduleData.title,
      duration: moduleData.duration,
      presenter: 'professional', // or 'friendly', 'authoritative'
      style: 'educational'
    };
  }

  // Create video using D-ID API
  async createVideo(content) {
    const response = await fetch(`${this.baseUrl}/talks`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        script: {
          type: 'text',
          input: content.script,
          provider: {
            type: 'microsoft',
            voice_id: 'en-US-AriaNeural'
          }
        },
        config: {
          result_format: 'mp4',
          fluent: true,
          pad_audio: 0.0
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Video generation failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Alternative: Generate video using Lumen5 API
  async generateLumen5Video(moduleData) {
    try {
      const content = this.prepareLumen5Content(moduleData);
      
      const response = await fetch('https://api.lumen5.com/v1/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.LUMEN5_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: moduleData.title,
          script: content.script,
          style: 'educational',
          duration: moduleData.duration * 60, // Convert to seconds
          voiceover: true,
          branding: {
            logo_url: 'https://your-logo-url.com/logo.png',
            primary_color: '#3B82F6'
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Lumen5 video generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        videoId: result.id,
        status: result.status,
        videoUrl: result.video_url
      };
    } catch (error) {
      console.error('Lumen5 video generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prepare content for Lumen5
  prepareLumen5Content(moduleData) {
    const sections = moduleData.content.sections;
    let script = {
      slides: []
    };

    // Title slide
    script.slides.push({
      type: 'title',
      text: moduleData.title,
      duration: 3
    });

    // Introduction slide
    script.slides.push({
      type: 'text',
      text: moduleData.description,
      duration: 5
    });

    // Content slides
    sections.forEach((section, index) => {
      script.slides.push({
        type: 'text',
        text: `${section.title}\n\n${section.content}`,
        duration: Math.max(10, section.content.length / 20) // Dynamic duration based on content length
      });
    });

    // Conclusion slide
    script.slides.push({
      type: 'text',
      text: `Thank you for completing ${moduleData.title}. Please proceed to the quiz to test your understanding.`,
      duration: 3
    });

    return script;
  }

  // Generate video using Synthesia API
  async generateSynthesiaVideo(moduleData) {
    try {
      const content = this.prepareSynthesiaContent(moduleData);
      
      const response = await fetch('https://api.synthesia.io/v2/videos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SYNTHESIA_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: moduleData.title,
          description: moduleData.description,
          script: content.script,
          avatar: 'anna_costume1_cameraA',
          background: 'off_white',
          test: false
        })
      });

      if (!response.ok) {
        throw new Error(`Synthesia video generation failed: ${response.statusText}`);
      }

      const result = await response.json();
      return {
        success: true,
        videoId: result.id,
        status: result.status,
        downloadUrl: result.downloadUrl
      };
    } catch (error) {
      console.error('Synthesia video generation error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Prepare content for Synthesia
  prepareSynthesiaContent(moduleData) {
    const sections = moduleData.content.sections;
    let script = [];

    // Introduction
    script.push({
      type: 'text',
      input: `Welcome to ${moduleData.title}. ${moduleData.description}`,
      voice: 'anna'
    });

    // Content sections
    sections.forEach((section, index) => {
      script.push({
        type: 'text',
        input: `Section ${index + 1}: ${section.title}. ${section.content}`,
        voice: 'anna'
      });
    });

    // Conclusion
    script.push({
      type: 'text',
      input: `Thank you for completing ${moduleData.title}. Please proceed to the quiz to test your understanding.`,
      voice: 'anna'
    });

    return { script };
  }
}

// Video Management Service
export class VideoManagementService {
  constructor() {
    this.videos = new Map(); // In-memory storage, replace with database
  }

  // Store video metadata
  async storeVideoMetadata(moduleId, videoData) {
    const metadata = {
      moduleId,
      videoUrl: videoData.videoUrl,
      duration: videoData.duration,
      thumbnail: videoData.thumbnail,
      status: 'ready',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.videos.set(moduleId, metadata);
    return metadata;
  }

  // Get video metadata
  async getVideoMetadata(moduleId) {
    return this.videos.get(moduleId);
  }

  // Update video status
  async updateVideoStatus(moduleId, status) {
    const metadata = this.videos.get(moduleId);
    if (metadata) {
      metadata.status = status;
      metadata.updatedAt = new Date();
      this.videos.set(moduleId, metadata);
    }
    return metadata;
  }

  // Get all videos
  async getAllVideos() {
    return Array.from(this.videos.values());
  }
}

// Export services
export const videoGenerationService = new VideoGenerationService();
export const videoManagementService = new VideoManagementService();
