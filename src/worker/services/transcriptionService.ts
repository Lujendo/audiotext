import { DatabaseAudioFile } from '../db/models';

export interface TranscriptionSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  confidence: number;
  speaker?: string;
}

export interface TranscriptionResult {
  text: string;
  confidence: number;
  language: string;
  segments: TranscriptionSegment[];
  vtt?: string;
}

export class TranscriptionService {
  private ai: Ai;
  private bucket: R2Bucket;

  constructor(ai: Ai, bucket: R2Bucket) {
    this.ai = ai;
    this.bucket = bucket;
  }

  /**
   * Transcribe audio file using Cloudflare Workers AI
   */
  async transcribeAudio(audioFile: DatabaseAudioFile): Promise<TranscriptionResult> {
    try {
      console.log(`Starting transcription for file: ${audioFile.filename}`);

      // Get audio file from R2 bucket
      const audioObject = await this.bucket.get(audioFile.filename);
      if (!audioObject) {
        throw new Error('Audio file not found in storage');
      }

      console.log(`Audio file retrieved, size: ${audioObject.size} bytes`);

      // Convert to array buffer
      const audioBuffer = await audioObject.arrayBuffer();
      const audioArray = new Uint8Array(audioBuffer);

      // Convert audio to base64 for Whisper API using chunked approach to avoid stack overflow
      const chunkSize = 8192;
      let base64Audio = '';

      for (let i = 0; i < audioArray.length; i += chunkSize) {
        const chunk = audioArray.slice(i, i + chunkSize);
        const chunkString = Array.from(chunk, byte => String.fromCharCode(byte)).join('');
        base64Audio += btoa(chunkString);
      }

      console.log(`Base64 conversion completed, length: ${base64Audio.length}`);

      // Use Whisper Large V3 Turbo for high-quality transcription
      console.log('Calling Cloudflare AI Whisper model...');
      const response = await this.ai.run('@cf/openai/whisper-large-v3-turbo', {
        audio: base64Audio,
        task: 'transcribe',
        language: 'auto', // Auto-detect language
        vad_filter: true, // Voice activity detection
        initial_prompt: 'This is a professional audio transcription. Please provide accurate punctuation and formatting.',
      });

      console.log('AI transcription completed:', response);

      // Process the response
      const segments: TranscriptionSegment[] = [];
      let fullText = '';
      let averageConfidence = 0;
      let detectedLanguage = 'en';

      if (response.segments && Array.isArray(response.segments)) {
        response.segments.forEach((segment: any, index: number) => {
          const segmentData: TranscriptionSegment = {
            id: `segment_${index}`,
            start: segment.start || 0,
            end: segment.end || 0,
            text: segment.text || '',
            confidence: segment.avg_logprob ? Math.exp(segment.avg_logprob) : 0.8,
            speaker: segment.speaker || undefined,
          };
          segments.push(segmentData);
          fullText += segmentData.text + ' ';
        });

        // Calculate average confidence
        averageConfidence = segments.reduce((sum, seg) => sum + seg.confidence, 0) / segments.length;
      } else {
        // Fallback for simple text response
        fullText = response.text || '';
        averageConfidence = 0.85; // Default confidence
        
        // Create a single segment for the entire text
        segments.push({
          id: 'segment_0',
          start: 0,
          end: audioFile.duration || 0,
          text: fullText,
          confidence: averageConfidence,
        });
      }

      return {
        text: fullText.trim(),
        confidence: averageConfidence,
        language: detectedLanguage,
        segments,
        vtt: response.vtt,
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhance transcription with AI-powered improvements
   */
  async enhanceTranscription(originalText: string, context?: string): Promise<string> {
    try {
      const prompt = `Please improve the following transcription by:
1. Correcting any obvious speech-to-text errors
2. Adding proper punctuation and capitalization
3. Formatting it professionally
4. Maintaining the original meaning and tone
${context ? `\nContext: ${context}` : ''}

Original transcription:
${originalText}

Improved transcription:`;

      const response = await this.ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: 'You are a professional transcription editor. Your job is to improve transcriptions while maintaining accuracy and the original speaker\'s intent.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 2048,
        temperature: 0.3,
      });

      return response.response || originalText;
    } catch (error) {
      console.error('Enhancement error:', error);
      return originalText; // Return original if enhancement fails
    }
  }

  /**
   * Generate summary of transcription
   */
  async generateSummary(text: string, summaryType: 'brief' | 'detailed' | 'bullet_points' = 'brief'): Promise<string> {
    try {
      let prompt = '';
      
      switch (summaryType) {
        case 'brief':
          prompt = `Please provide a brief summary (2-3 sentences) of the following transcription:\n\n${text}`;
          break;
        case 'detailed':
          prompt = `Please provide a detailed summary with key points and main topics from the following transcription:\n\n${text}`;
          break;
        case 'bullet_points':
          prompt = `Please provide a bullet-point summary of the key points from the following transcription:\n\n${text}`;
          break;
      }

      const response = await this.ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: 'You are a professional summarization assistant. Create clear, concise summaries that capture the essential information.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1024,
        temperature: 0.3,
      });

      return response.response || 'Summary generation failed';
    } catch (error) {
      console.error('Summary generation error:', error);
      return 'Failed to generate summary';
    }
  }

  /**
   * Extract key topics and entities from transcription
   */
  async extractKeyTopics(text: string): Promise<string[]> {
    try {
      const prompt = `Extract the main topics, keywords, and important entities from the following transcription. Return them as a comma-separated list:

${text}

Key topics and entities:`;

      const response = await this.ai.run('@cf/meta/llama-2-7b-chat-int8', {
        messages: [
          {
            role: 'system',
            content: 'You are an expert at extracting key topics and entities from text. Focus on the most important and relevant terms.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 256,
        temperature: 0.2,
      });

      const topicsText = response.response || '';
      return topicsText
        .split(',')
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0)
        .slice(0, 10); // Limit to top 10 topics
    } catch (error) {
      console.error('Topic extraction error:', error);
      return [];
    }
  }

  /**
   * Convert transcription to different formats
   */
  generateVTT(segments: TranscriptionSegment[]): string {
    let vtt = 'WEBVTT\n\n';
    
    segments.forEach((segment, index) => {
      const startTime = this.formatTime(segment.start);
      const endTime = this.formatTime(segment.end);
      
      vtt += `${index + 1}\n`;
      vtt += `${startTime} --> ${endTime}\n`;
      vtt += `${segment.text}\n\n`;
    });
    
    return vtt;
  }

  generateSRT(segments: TranscriptionSegment[]): string {
    let srt = '';
    
    segments.forEach((segment, index) => {
      const startTime = this.formatTime(segment.start, true);
      const endTime = this.formatTime(segment.end, true);
      
      srt += `${index + 1}\n`;
      srt += `${startTime} --> ${endTime}\n`;
      srt += `${segment.text}\n\n`;
    });
    
    return srt;
  }

  private formatTime(seconds: number, srtFormat = false): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    const separator = srtFormat ? ',' : '.';
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}${separator}${ms.toString().padStart(3, '0')}`;
  }
}
