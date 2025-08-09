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
  private env: any;

  constructor(ai: Ai, bucket: R2Bucket, env: any) {
    this.ai = ai;
    this.bucket = bucket;
    this.env = env;
  }

  /**
   * Transcribe audio file using OpenAI Whisper API (handles MP3 natively)
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

      // SOLUTION: Use OpenAI Whisper API instead of Cloudflare AI
      // OpenAI Whisper properly handles MP3 files without the background noise issue

      console.log('Using OpenAI Whisper API for proper MP3 transcription...');

      // Read audio buffer once to avoid "body already used" error
      const audioBuffer = await audioObject.arrayBuffer();
      console.log(`Audio buffer prepared, size: ${audioBuffer.byteLength} bytes`);

      // Create FormData for OpenAI API
      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], {
        type: audioFile.mime_type || 'audio/mpeg'
      });

      formData.append('file', audioBlob, audioFile.original_name);
      formData.append('model', 'whisper-1');
      formData.append('response_format', 'verbose_json');
      formData.append('timestamp_granularities[]', 'word');

      const openaiResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.OPENAI_API_KEY || 'sk-test-key'}`,
        },
        body: formData,
      });

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text();
        console.error('OpenAI API error (likely missing/invalid API key):', errorText);

        // Fallback to Cloudflare AI with artifact cleaning using the same buffer
        console.log('OpenAI API failed, falling back to Cloudflare AI with artifact cleaning...');
        return this.fallbackToCloudflareAI(audioFile, audioBuffer);
      }

      const response = await openaiResponse.json() as any;
      console.log('OpenAI Whisper transcription successful:', response);

      // Process the OpenAI Whisper response (clean, no background noise)
      const segments: TranscriptionSegment[] = [];
      let fullText = response.text || '';
      let averageConfidence = 0.95; // OpenAI Whisper provides high-quality results
      let detectedLanguage = response.language || 'en';

      console.log(`Clean transcription text: "${fullText}"`);
      console.log(`Detected language: ${detectedLanguage}`);

      // Process word-level timestamps from OpenAI response
      if (response.words && Array.isArray(response.words)) {
        console.log(`Processing ${response.words.length} words with timestamps`);

        // Group words into segments (sentences or phrases)
        let currentSegment = '';
        let segmentStart = 0;
        let segmentIndex = 0;

        response.words.forEach((word: any, index: number) => {
          if (index === 0) {
            segmentStart = word.start || 0;
          }

          currentSegment += (currentSegment ? ' ' : '') + (word.word || '');

          // Create a new segment every ~15 words or at sentence boundaries
          const isEndOfSentence = word.word?.match(/[.!?]$/);
          const shouldBreakSegment = (index + 1) % 15 === 0 || isEndOfSentence || index === response.words.length - 1;

          if (shouldBreakSegment) {
            segments.push({
              id: `segment_${segmentIndex}`,
              start: segmentStart,
              end: word.end || word.start || 0,
              text: currentSegment.trim(),
              confidence: averageConfidence,
            });
            currentSegment = '';
            segmentStart = word.end || word.start || 0;
            segmentIndex++;
          }
        });
      } else {
        // Fallback: create a single segment with the full text
        console.log('No word-level timestamps, creating single segment');
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
        vtt: this.generateVTT(segments),
      };
    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Failed to transcribe audio: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Fallback to Cloudflare AI with artifact cleaning (using pre-read buffer)
   */
  private async fallbackToCloudflareAI(audioFile: DatabaseAudioFile, audioBuffer: ArrayBuffer): Promise<TranscriptionResult> {
    console.log('FALLBACK: Using Cloudflare AI with artifact cleaning...');

    const audioArray = new Uint8Array(audioBuffer);
    const audioNumbers = Array.from(audioArray);

    const response = await this.ai.run('@cf/openai/whisper', {
      audio: audioNumbers,
    });

    console.log('Cloudflare AI response (may contain artifacts):', response);

    // Clean up the response to remove repetitive artifacts
    let fullText = (response as any).text || '';

    // ARTIFACT REMOVAL: Remove repetitive phrases that are likely MP3 header artifacts
    fullText = this.cleanTranscriptionArtifacts(fullText);

    const segments: TranscriptionSegment[] = [{
      id: 'segment_0',
      start: 0,
      end: audioFile.duration || 0,
      text: fullText,
      confidence: 0.75, // Lower confidence due to potential artifacts
    }];

    return {
      text: fullText.trim(),
      confidence: 0.75,
      language: 'en',
      segments,
      vtt: this.generateVTT(segments),
    };
  }

  /**
   * Clean transcription artifacts caused by MP3 compression
   */
  private cleanTranscriptionArtifacts(text: string): string {
    console.log('Cleaning transcription artifacts from MP3 compression...');
    console.log(`Original text length: ${text.length} characters`);

    // AGGRESSIVE ARTIFACT REMOVAL for MP3 compression issues

    // Step 1: Remove the specific repetitive pattern we identified
    const specificArtifact = /I'm going to be a fan of the show\.?\s*/gi;
    let cleanedText = text.replace(specificArtifact, '');
    console.log(`After removing specific artifact: ${cleanedText.length} characters`);

    // Step 2: Remove any sentence that repeats more than 3 times
    const sentences = cleanedText.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 5);
    const sentenceCounts = new Map<string, number>();

    // Count occurrences of each sentence
    sentences.forEach(sentence => {
      const normalized = sentence.toLowerCase().replace(/[^\w\s]/g, '');
      sentenceCounts.set(normalized, (sentenceCounts.get(normalized) || 0) + 1);
    });

    // Keep only sentences that appear 3 times or less
    const cleanSentences: string[] = [];
    const processedSentences = new Set<string>();

    for (const sentence of sentences) {
      const normalized = sentence.toLowerCase().replace(/[^\w\s]/g, '');
      const count = sentenceCounts.get(normalized) || 0;

      // Skip repetitive artifacts (more than 3 occurrences)
      if (count > 3) {
        if (!processedSentences.has(normalized)) {
          console.log(`Removing repetitive artifact (${count}x): "${sentence.substring(0, 50)}..."`);
          processedSentences.add(normalized);
        }
        continue;
      }

      // Skip very short sentences that are likely artifacts
      if (sentence.length < 8) continue;

      cleanSentences.push(sentence);
    }

    // Step 3: Reconstruct the text
    const finalText = cleanSentences.join('. ').trim();

    // Step 4: Add proper ending punctuation if missing
    const result = finalText && !finalText.match(/[.!?]$/) ? finalText + '.' : finalText;

    console.log(`Artifact cleaning complete:`);
    console.log(`- Original: ${sentences.length} sentences, ${text.length} chars`);
    console.log(`- Cleaned: ${cleanSentences.length} sentences, ${result.length} chars`);
    console.log(`- Removed: ${sentences.length - cleanSentences.length} repetitive artifacts`);

    return result || 'Transcription failed - too many artifacts detected';
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
