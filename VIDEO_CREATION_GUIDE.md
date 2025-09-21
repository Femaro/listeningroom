# Training Video Creation Guide

This guide explains how to convert your text-based training modules into engaging video content for volunteers.

## 📋 **Overview**

The system supports multiple approaches for creating training videos:

1. **AI-Generated Videos** - Automatically convert text to video
2. **Manual Upload** - Upload pre-recorded videos
3. **External Services** - Use professional video creation tools
4. **Text-to-Video Upload** - Upload text files and generate videos

## 🎥 **Method 1: AI-Generated Videos (Recommended)**

### **Supported Services:**

#### **D-ID (AI Avatar Videos)**
- **Cost**: $5.99/month for 20 minutes
- **Features**: AI avatars, natural speech, professional quality
- **Setup**: Get API key from [D-ID](https://www.d-id.com/)

#### **Lumen5 (Text-to-Video)**
- **Cost**: $19/month for 10 videos
- **Features**: Automatic video creation, templates, branding
- **Setup**: Get API key from [Lumen5](https://lumen5.com/)

#### **Synthesia (AI Presenter)**
- **Cost**: $30/month for 10 minutes
- **Features**: 140+ AI avatars, 120+ languages, professional quality
- **Setup**: Get API key from [Synthesia](https://www.synthesia.io/)

### **Setup Instructions:**

1. **Get API Keys:**
   ```bash
   # Add to your .env.local file
   NEXT_PUBLIC_VIDEO_API_KEY=your_did_api_key
   LUMEN5_API_KEY=your_lumen5_api_key
   SYNTHESIA_API_KEY=your_synthesia_api_key
   ```

2. **Generate Videos:**
   - Go to Admin Dashboard → Video Management
   - Select "AI Generated Videos"
   - Choose your preferred service
   - Click "Generate All Videos"

## 📁 **Method 2: Text-to-Video Upload**

### **Step 1: Prepare Your Text Files**

Create text files (.txt or .md) with the following structure:

```markdown
# Module 1: Welcome & Platform Overview

## Description
Introduction to our mission, values, and platform features.

## Level
Beginner (Level 1)

## Required
Yes

## Content

### Our Mission
Learn about our commitment to providing accessible mental health support globally. 
We believe everyone deserves access to quality mental health resources.

### Platform Features
Overview of all available tools and features for volunteers:
- Dashboard navigation
- Session management
- Progress tracking
- Communication tools

### Code of Conduct
Understanding our values and ethical guidelines:
- Confidentiality
- Professional boundaries
- Respect and empathy
- Continuous learning
```

### **Step 2: Upload Files**

1. Go to Admin Dashboard → Video Management
2. Click "Upload Training Text Files"
3. Select your prepared text files
4. Click "Generate Videos"

### **Step 3: Review Generated Content**

The system will automatically:
- Extract module title and description
- Parse content sections
- Estimate video duration
- Determine difficulty level
- Generate video script

## 🎬 **Method 3: Manual Video Upload**

### **For Pre-Recorded Videos:**

1. **Prepare Your Videos:**
   - Format: MP4, WebM, or MOV
   - Resolution: 1920x1080 (Full HD) or higher
   - Duration: Match your module duration
   - Audio: Clear, professional narration

2. **Upload Process:**
   - Go to Admin Dashboard → Video Management
   - Select "Manual Upload"
   - Choose video files for each module
   - Add metadata (title, description, duration)

### **Video Recording Tips:**

#### **Equipment:**
- **Camera**: Use a good webcam or DSLR
- **Lighting**: Natural light or ring light
- **Audio**: External microphone (Blue Yeti, Rode PodMic)
- **Background**: Clean, professional backdrop

#### **Recording Setup:**
- **Resolution**: 1920x1080 minimum
- **Frame Rate**: 30fps
- **Audio**: 48kHz, 16-bit minimum
- **Duration**: Keep segments under 10 minutes

#### **Content Structure:**
1. **Introduction** (30 seconds)
   - Welcome and module overview
   - Learning objectives
   
2. **Main Content** (5-15 minutes)
   - Key concepts and examples
   - Visual aids and demonstrations
   
3. **Summary** (30 seconds)
   - Key takeaways
   - Next steps

## 🔧 **Method 4: External Services Integration**

### **Lumen5 Integration:**

1. **Setup:**
   ```javascript
   // Configure in videoGenerationService.js
   const lumen5Config = {
     apiKey: process.env.LUMEN5_API_KEY,
     brandId: 'your-brand-id',
     templateId: 'educational-template'
   };
   ```

2. **Generate Video:**
   ```javascript
   const result = await videoGenerationService.generateLumen5Video(module);
   ```

### **Synthesia Integration:**

1. **Setup:**
   ```javascript
   const synthesiaConfig = {
     apiKey: process.env.SYNTHESIA_API_KEY,
     avatar: 'anna_costume1_cameraA',
     background: 'off_white'
   };
   ```

2. **Generate Video:**
   ```javascript
   const result = await videoGenerationService.generateSynthesiaVideo(module);
   ```

## 📊 **Video Management Features**

### **Admin Dashboard:**
- **Video Status Tracking**: See which modules have videos
- **Bulk Operations**: Generate multiple videos at once
- **Quality Control**: Preview and approve videos
- **Analytics**: Track video engagement and completion rates

### **Video Player Features:**
- **Responsive Design**: Works on all devices
- **Playback Controls**: Play, pause, seek, volume
- **Progress Tracking**: Resume from where user left off
- **Accessibility**: Closed captions and transcripts

## 🎯 **Best Practices**

### **Content Guidelines:**

1. **Keep It Short**: 5-15 minutes per module
2. **Use Visuals**: Slides, diagrams, screen recordings
3. **Clear Audio**: Professional narration
4. **Consistent Style**: Same presenter/format across modules
5. **Interactive Elements**: Pause for reflection, questions

### **Technical Requirements:**

1. **File Formats**: MP4 (H.264), WebM
2. **Resolution**: 1920x1080 minimum
3. **Audio**: 48kHz, 16-bit stereo
4. **File Size**: Under 500MB per video
5. **Duration**: 5-30 minutes per module

### **Quality Checklist:**

- [ ] Clear, professional audio
- [ ] Good lighting and video quality
- [ ] Consistent branding and style
- [ ] Proper pacing and timing
- [ ] Engaging and informative content
- [ ] Mobile-friendly playback

## 🚀 **Implementation Steps**

### **Phase 1: Setup (Week 1)**
1. Choose your video creation method
2. Set up API keys and accounts
3. Prepare your text content
4. Test video generation with one module

### **Phase 2: Production (Week 2-3)**
1. Generate videos for all modules
2. Review and approve content
3. Upload to your video hosting service
4. Update training module metadata

### **Phase 3: Integration (Week 4)**
1. Integrate videos into training system
2. Test video playback and tracking
3. Train volunteers on new system
4. Launch updated training program

## 💰 **Cost Comparison**

| Service | Monthly Cost | Video Minutes | Quality | Setup Time |
|---------|-------------|---------------|---------|------------|
| D-ID | $5.99 | 20 | High | Low |
| Lumen5 | $19 | 10 videos | Medium | Low |
| Synthesia | $30 | 10 | Very High | Low |
| Manual Recording | $0 | Unlimited | Variable | High |

## 🔍 **Troubleshooting**

### **Common Issues:**

1. **Video Generation Fails:**
   - Check API keys and quotas
   - Verify text content format
   - Try different service

2. **Poor Video Quality:**
   - Check source material quality
   - Adjust service settings
   - Consider manual recording

3. **Upload Issues:**
   - Check file size limits
   - Verify file format
   - Test with smaller files

### **Support Resources:**
- D-ID Documentation: https://docs.d-id.com/
- Lumen5 Help Center: https://help.lumen5.com/
- Synthesia Support: https://support.synthesia.io/

## 📈 **Next Steps**

1. **Choose your preferred method** based on budget and quality needs
2. **Prepare your text content** following the format guidelines
3. **Set up API keys** for your chosen service
4. **Generate test videos** to ensure quality
5. **Scale up production** for all training modules
6. **Monitor and optimize** based on volunteer feedback

This system will help you create professional, engaging training videos that enhance your volunteer training program and improve learning outcomes.
