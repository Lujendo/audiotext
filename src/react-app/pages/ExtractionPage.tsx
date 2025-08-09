import React, { useState, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Upload,
  FileAudio,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  Clock,
  FileText,
  Zap,
  Loader,
  CheckCircle,
  AlertCircle,
  Mic,
  Settings,
  Crown,
  Lock,
  Sparkles,
  Languages,
  Users,
  Wand2,
  Brain,
  Target,
  Headphones,
  FileVideo,
  Music,
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

export const ExtractionPage: React.FC = () => {
  const { user } = useAuth();
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
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('auto');
  const [processingOptions, setProcessingOptions] = useState({
    enhanceAudio: false,
    speakerDetection: false,
    customPrompt: '',
    outputFormat: 'standard',
  });

  // Check if user has access to advanced features
  const hasAdvancedAccess = user?.role !== 'student' && user?.role !== 'subscriber';
  const isPremiumUser = user?.role === 'professional' || user?.role === 'copywriter' || user?.role === 'video_editor';

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', file);
      
      // Add advanced options if user has access
      if (hasAdvancedAccess) {
        formData.append('language', selectedLanguage);
        formData.append('enhanceAudio', processingOptions.enhanceAudio.toString());
        formData.append('speakerDetection', processingOptions.speakerDetection.toString());
        formData.append('customPrompt', processingOptions.customPrompt);
      }

      const response = await fetch('/api/audio/upload', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setAudioFile(data.audioFile);
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
  }, [hasAdvancedAccess, selectedLanguage, processingOptions]);

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
            return;
          }
          
          if (data.audioFile.status === 'failed') {
            alert('Transcription failed. Please try again.');
            return;
          }
          
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Audio Extraction Studio
              </h1>
              <p className="text-gray-600 text-lg">
                Transform your audio into professional text with AI-powered transcription and advanced editing tools.
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {isPremiumUser && (
                <div className="flex items-center space-x-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-medium">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </div>
              )}
              <Button
                variant={showAdvanced ? 'primary' : 'outline'}
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2"
              >
                <Settings className="w-4 h-4" />
                <span>Advanced</span>
                {!hasAdvancedAccess && <Lock className="w-3 h-3" />}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Left Sidebar - Upload & Controls */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Upload */}
            {!audioFile && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Quick Upload</h2>
                  <Sparkles className="w-5 h-5 text-purple-500" />
                </div>
                
                <div
                  className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/50 transition-all cursor-pointer group"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader className="w-8 h-8 text-blue-600 animate-spin mb-3" />
                      <p className="text-gray-600 font-medium">Processing...</p>
                      <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Upload className="w-8 h-8 text-white" />
                      </div>
                      <p className="text-gray-700 font-medium mb-2">Drop files here or click to browse</p>
                      <p className="text-xs text-gray-500 mb-4">Supports audio & video files up to 100MB</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Music className="w-3 h-3" />
                          <span>MP3</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Headphones className="w-3 h-3" />
                          <span>WAV</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <FileVideo className="w-3 h-3" />
                          <span>MP4</span>
                        </div>
                      </div>
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

                <div className="mt-6 flex items-center justify-center">
                  <div className="flex items-center w-full">
                    <div className="border-t border-gray-200 flex-grow"></div>
                    <span className="px-4 text-gray-400 text-sm font-medium">or</span>
                    <div className="border-t border-gray-200 flex-grow"></div>
                  </div>
                </div>

                <div className="mt-6">
                  <Button
                    variant={isRecording ? 'destructive' : 'outline'}
                    onClick={isRecording ? stopRecording : startRecording}
                    className="w-full flex items-center justify-center space-x-2"
                  >
                    <Mic className={`w-4 h-4 ${isRecording ? 'animate-pulse' : ''}`} />
                    <span>{isRecording ? 'Stop Recording' : 'Record Audio'}</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Advanced Options</h2>
                  {!hasAdvancedAccess && (
                    <div className="flex items-center space-x-1 text-amber-600">
                      <Lock className="w-4 h-4" />
                      <span className="text-xs font-medium">Premium</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Languages className="w-4 h-4 inline mr-1" />
                      Language
                    </label>
                    <select
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      disabled={!hasAdvancedAccess}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="auto">Auto-detect</option>
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                      <option value="it">Italian</option>
                      <option value="pt">Portuguese</option>
                      <option value="zh">Chinese</option>
                      <option value="ja">Japanese</option>
                    </select>
                  </div>

                  {/* Processing Options */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Wand2 className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">Audio Enhancement</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={processingOptions.enhanceAudio}
                        onChange={(e) => setProcessingOptions(prev => ({ ...prev, enhanceAudio: e.target.checked }))}
                        disabled={!hasAdvancedAccess}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm font-medium text-gray-700">Speaker Detection</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={processingOptions.speakerDetection}
                        onChange={(e) => setProcessingOptions(prev => ({ ...prev, speakerDetection: e.target.checked }))}
                        disabled={!hasAdvancedAccess}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Brain className="w-4 h-4 inline mr-1" />
                      Custom Context
                    </label>
                    <textarea
                      value={processingOptions.customPrompt}
                      onChange={(e) => setProcessingOptions(prev => ({ ...prev, customPrompt: e.target.value }))}
                      disabled={!hasAdvancedAccess}
                      placeholder="Provide context to improve transcription accuracy..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
                    />
                  </div>

                  {!hasAdvancedAccess && (
                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4 mt-4">
                      <div className="flex items-center space-x-2 mb-2">
                        <Crown className="w-4 h-4 text-amber-600" />
                        <span className="text-sm font-semibold text-amber-800">Upgrade for Advanced Features</span>
                      </div>
                      <p className="text-xs text-amber-700 mb-3">
                        Unlock language selection, audio enhancement, speaker detection, and custom prompts.
                      </p>
                      <Button size="sm" className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white border-0">
                        <Target className="w-3 h-3 mr-1" />
                        Upgrade Now
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Content Area */}
          <div className="xl:col-span-3 space-y-6">
            {/* Audio Player */}
            {audioFile && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Audio Player</h2>
                    <p className="text-sm text-gray-600 mt-1">Review your audio while editing the transcription</p>
                  </div>
                  <div className="flex items-center space-x-3">
                    {audioFile.status === 'processing' && (
                      <div className="flex items-center space-x-2 text-blue-600">
                        <Loader className="w-4 h-4 animate-spin" />
                        <span className="text-sm font-medium">Processing</span>
                      </div>
                    )}
                    {audioFile.status === 'completed' && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Completed</span>
                      </div>
                    )}
                    {audioFile.status === 'failed' && (
                      <div className="flex items-center space-x-2 text-red-600">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">Failed</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 mb-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <FileAudio className="w-5 h-5 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700 truncate">{audioFile.filename}</span>
                    <span className="text-xs text-gray-500">
                      {(audioFile.size / (1024 * 1024)).toFixed(1)} MB
                    </span>
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
                        <div className="flex items-center justify-center space-x-6">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setCurrentTime(0);
                              }
                            }}
                            className="text-gray-600 hover:text-gray-800"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="primary"
                            size="lg"
                            onClick={togglePlayPause}
                            className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg"
                          >
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
                          </Button>

                          <div className="flex items-center space-x-2">
                            <Volume2 className="w-4 h-4 text-gray-500" />
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
                              className="w-20 accent-blue-500"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm text-gray-600">
                            <span className="font-mono">{formatTime(currentTime)}</span>
                            <span className="font-mono">{formatTime(duration)}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 cursor-pointer"
                               onClick={(e) => {
                                 if (audioRef.current && duration > 0) {
                                   const rect = e.currentTarget.getBoundingClientRect();
                                   const percent = (e.clientX - rect.left) / rect.width;
                                   const newTime = percent * duration;
                                   audioRef.current.currentTime = newTime;
                                   setCurrentTime(newTime);
                                 }
                               }}>
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300 relative"
                              style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                            >
                              <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-blue-500 rounded-full shadow-md"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Transcription Info */}
                {transcription && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-600">{Math.round(transcription.confidence * 100)}%</div>
                      <div className="text-xs text-blue-700 font-medium">Confidence</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-600">{transcription.language.toUpperCase()}</div>
                      <div className="text-xs text-green-700 font-medium">Language</div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-purple-600">{transcription.segments.length}</div>
                      <div className="text-xs text-purple-700 font-medium">Segments</div>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-orange-600">{Math.round(duration / 60)}m</div>
                      <div className="text-xs text-orange-700 font-medium">Duration</div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Text Editor */}
            {transcription ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">Professional Text Editor</h2>
                      <p className="text-sm text-gray-600 mt-1">Edit, enhance, and format your transcription</p>
                    </div>
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
                  onEnhance={hasAdvancedAccess && !isEnhancing ? handleEnhance : undefined}
                  onSummarize={hasAdvancedAccess && !isSummarizing ? handleSummarize : undefined}
                  className="border-0 rounded-none"
                />
              </div>
            ) : audioFile?.status === 'processing' ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Loader className="w-10 h-10 text-white animate-spin" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">AI is Processing Your Audio</h3>
                  <p className="text-gray-600 mb-6">
                    Our advanced AI is transcribing your audio with high accuracy. This usually takes a few minutes depending on the file size.
                  </p>
                  <div className="bg-gray-100 rounded-full h-2 mb-4">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                  </div>
                  <p className="text-sm text-gray-500">Processing... Please don't close this page</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText className="w-10 h-10 text-gray-500" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">Ready for Audio Extraction</h3>
                  <p className="text-gray-600 mb-6">
                    Upload an audio or video file to get started with AI-powered transcription and professional text editing.
                  </p>
                  <div className="grid grid-cols-3 gap-4 text-sm text-gray-500">
                    <div className="flex flex-col items-center">
                      <Upload className="w-6 h-6 mb-2" />
                      <span>Upload Files</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <Zap className="w-6 h-6 mb-2" />
                      <span>AI Processing</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <FileText className="w-6 h-6 mb-2" />
                      <span>Edit & Export</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
