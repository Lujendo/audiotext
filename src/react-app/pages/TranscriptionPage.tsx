import React, { useState, useCallback, useRef } from 'react';
import {
  Upload,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  FileText,
  Loader,
  CheckCircle,
  AlertCircle,
  Mic,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RichTextEditor } from '../components/editor/RichTextEditor';

interface AudioFile {
  id: string;
  filename: string;
  size: number;
  duration?: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  url?: string;
}

interface Transcription {
  id: string;
  text: string;
  editedText?: string;
  confidence: number;
  language: string;
  status: 'processing' | 'completed' | 'failed';
  segments: Array<{
    id: string;
    start: number;
    end: number;
    text: string;
    confidence: number;
  }>;
}

export const TranscriptionPage: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [editedContent, setEditedContent] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAudioFile(data.audioFile);
        
        // Poll for transcription completion
        pollTranscription(data.audioFile.id);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      alert('Failed to upload audio file');
    } finally {
      setIsUploading(false);
    }
  }, []);

  const pollTranscription = useCallback(async (audioId: string) => {
    const poll = async () => {
      try {
        const response = await fetch(`/api/audio/${audioId}`, {
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setAudioFile(data.audioFile);
          
          if (data.audioFile.transcription) {
            setTranscription(data.audioFile.transcription);
            setEditedContent(data.audioFile.transcription.editedText || data.audioFile.transcription.text);
            return; // Stop polling
          }
          
          if (data.audioFile.status === 'failed') {
            alert('Transcription failed. Please try again.');
            return;
          }
          
          // Continue polling if still processing
          if (data.audioFile.status === 'processing') {
            setTimeout(poll, 3000);
          }
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    };

    poll();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    const audioFile = files.find(file => file.type.startsWith('audio/') || file.type.startsWith('video/'));
    if (audioFile) {
      handleFileSelect(audioFile);
    }
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const togglePlayPause = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  }, []);

  const handleLoadedMetadata = useCallback(() => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSave = useCallback(async () => {
    if (!transcription) return;

    try {
      const response = await fetch(`/api/transcriptions/${transcription.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          editedText: editedContent,
        }),
      });

      if (response.ok) {
        alert('Transcription saved successfully!');
      } else {
        throw new Error('Save failed');
      }
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save transcription');
    }
  }, [transcription, editedContent]);

  const handleEnhance = useCallback(async () => {
    if (!transcription) return;

    setIsEnhancing(true);
    try {
      const response = await fetch('/api/transcriptions/enhance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: editedContent,
          context: 'Professional transcription enhancement',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setEditedContent(data.enhancedText);
      } else {
        throw new Error('Enhancement failed');
      }
    } catch (error) {
      console.error('Enhancement error:', error);
      alert('Failed to enhance transcription');
    } finally {
      setIsEnhancing(false);
    }
  }, [transcription, editedContent]);

  const handleSummarize = useCallback(async () => {
    if (!transcription) return;

    setIsSummarizing(true);
    try {
      const response = await fetch('/api/transcriptions/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          text: editedContent,
          type: 'detailed',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add summary to the beginning of the content
        setEditedContent(`<h3>Summary</h3><p>${data.summary}</p><hr/><h3>Full Transcription</h3>${editedContent}`);
      } else {
        throw new Error('Summarization failed');
      }
    } catch (error) {
      console.error('Summarization error:', error);
      alert('Failed to generate summary');
    } finally {
      setIsSummarizing(false);
    }
  }, [transcription, editedContent]);

  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'txt') => {
    if (!transcription) return;

    try {
      const response = await fetch('/api/transcriptions/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          transcriptionId: transcription.id,
          format,
          content: editedContent,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `transcription.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Export failed');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Failed to export transcription');
    }
  }, [transcription, editedContent]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' });
        const file = new File([blob], 'recording.wav', { type: 'audio/wav' });
        handleFileSelect(file);
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error('Recording error:', error);
      alert('Failed to start recording');
    }
  }, [handleFileSelect]);

  const stopRecording = useCallback(() => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
      setIsRecording(false);
    }
  }, [mediaRecorder]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Audio Transcription</h1>
          <p className="text-gray-600">Upload audio files or record directly to get AI-powered transcriptions with professional editing tools.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Audio Upload & Controls */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Area */}
            {!audioFile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio</h2>
                
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin mb-2" />
                      <p className="text-gray-600">Uploading...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-gray-600 mb-2">Drop audio files here or click to browse</p>
                      <p className="text-xs text-gray-500">Supports MP3, WAV, M4A, MP4 (max 100MB)</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="audio/*,video/*"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />

                <div className="mt-4 flex items-center justify-center">
                  <div className="flex items-center">
                    <div className="border-t border-gray-300 flex-grow"></div>
                    <span className="px-3 text-gray-500 text-sm">or</span>
                    <div className="border-t border-gray-300 flex-grow"></div>
                  </div>
                </div>

                <div className="mt-4">
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-full"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {isRecording ? 'Stop Recording' : 'Record Audio'}
                  </Button>
                </div>
              </div>
            )}

            {/* Audio Player */}
            {audioFile && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Audio Player</h2>
                  <div className="flex items-center space-x-2">
                    {audioFile.status === 'processing' && <Loader className="w-4 h-4 text-blue-600 animate-spin" />}
                    {audioFile.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-600" />}
                    {audioFile.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-600" />}
                    <span className="text-sm text-gray-600 capitalize">{audioFile.status}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 mb-4">
                  <FileAudio className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-600 truncate">{audioFile.filename}</span>
                </div>

                {audioFile.url && (
                  <>
                    <audio
                      ref={audioRef}
                      src={audioFile.url}
                      onTimeUpdate={handleTimeUpdate}
                      onLoadedMetadata={handleLoadedMetadata}
                      onEnded={() => setIsPlaying(false)}
                    />

                    <div className="space-y-4">
                      <div className="flex items-center justify-center space-x-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            if (audioRef.current) {
                              audioRef.current.currentTime = 0;
                              setCurrentTime(0);
                            }
                          }}
                        >
                          <RotateCcw className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="primary"
                          onClick={togglePlayPause}
                        >
                          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                        </Button>
                        <div className="flex items-center space-x-2">
                          <Volume2 className="w-4 h-4 text-gray-400" />
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            defaultValue="1"
                            onChange={(e) => {
                              if (audioRef.current) {
                                audioRef.current.volume = parseFloat(e.target.value);
                              }
                            }}
                            className="w-16"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Transcription Status */}
            {transcription && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Transcription Info</h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <span className={`text-sm font-medium ${
                      transcription.status === 'completed' ? 'text-green-600' : 
                      transcription.status === 'processing' ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {transcription.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Confidence:</span>
                    <span className="text-sm font-medium">{Math.round(transcription.confidence * 100)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Language:</span>
                    <span className="text-sm font-medium">{transcription.language.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Segments:</span>
                    <span className="text-sm font-medium">{transcription.segments.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Text Editor */}
          <div className="lg:col-span-2">
            {transcription ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">Transcription Editor</h2>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm text-gray-600">Auto-saved</span>
                    </div>
                  </div>
                </div>

                <RichTextEditor
                  content={editedContent}
                  onChange={setEditedContent}
                  onSave={handleSave}
                  onExport={handleExport}
                  onEnhance={isEnhancing ? undefined : handleEnhance}
                  onSummarize={isSummarizing ? undefined : handleSummarize}
                  className="border-0 rounded-none"
                />
              </div>
            ) : audioFile?.status === 'processing' ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Audio</h3>
                <p className="text-gray-600">Our AI is transcribing your audio. This usually takes a few minutes.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Transcribe</h3>
                <p className="text-gray-600">Upload an audio file to get started with AI-powered transcription.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
