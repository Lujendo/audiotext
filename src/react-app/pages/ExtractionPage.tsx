import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
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
  SkipBack,
  SkipForward,
  Share2,
  Download,
  VolumeX,
  Headphones,
  FileVideo,
  Music,
  ArrowLeft,
  Home,
  Archive,
  Edit3,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { RichTextEditor } from '../components/editor/RichTextEditor';
import { SavedExtractionsManager } from '../components/extractions/SavedExtractionsManager';

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
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const [audioFile, setAudioFile] = useState<AudioFile | null>(null);
  const [transcription, setTranscription] = useState<Transcription | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isLooping, setIsLooping] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
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

  // Saved extractions management
  const [savedExtractions, setSavedExtractions] = useState<Transcription[]>([]);
  const [showSavedExtractions, setShowSavedExtractions] = useState(false);



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

  // Professional Audio Player Keyboard Shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only handle shortcuts when not typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'arrowleft':
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = Math.max(0, currentTime - (e.shiftKey ? 30 : 5));
          }
          break;
        case 'arrowright':
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = Math.min(duration, currentTime + (e.shiftKey ? 30 : 5));
          }
          break;
        case 'home':
          e.preventDefault();
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            setCurrentTime(0);
          }
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(!isMuted);
          if (audioRef.current) {
            audioRef.current.muted = !isMuted;
          }
          break;
        case 'l':
          e.preventDefault();
          setIsLooping(!isLooping);
          if (audioRef.current) {
            audioRef.current.loop = !isLooping;
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentTime, duration, isMuted, isLooping, togglePlayPause]);

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

  // Load saved extractions
  const loadSavedExtractions = useCallback(async () => {
    try {
      const response = await fetch('/api/audio', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const extractionsWithTranscriptions = data.audioFiles
          .filter((file: any) => file.transcription && file.transcription.status === 'completed')
          .map((file: any) => ({
            ...file.transcription,
            audioFile: {
              filename: file.filename,
              originalName: file.originalName,
              duration: file.duration,
              createdAt: file.createdAt,
            }
          }));
        setSavedExtractions(extractionsWithTranscriptions);
      }
    } catch (error) {
      console.error('Failed to load saved extractions:', error);
    }
  }, []);

  // Load saved extractions on component mount
  useEffect(() => {
    loadSavedExtractions();
  }, [loadSavedExtractions]);

  // Load a saved extraction
  const loadSavedExtraction = useCallback(async (extractionId: string) => {
    try {
      const response = await fetch(`/api/audio/${extractionId}`, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAudioFile(data.audioFile);
        setTranscription(data.audioFile.transcription);
        setEditedContent(data.audioFile.transcription.editedText || data.audioFile.transcription.text);
        setShowSavedExtractions(false);
      }
    } catch (error) {
      console.error('Failed to load extraction:', error);
      alert('Failed to load saved extraction');
    }
  }, []);

  // Delete a saved extraction
  const deleteSavedExtraction = useCallback(async (extractionId: string) => {
    if (!confirm('Are you sure you want to delete this extraction?')) return;

    try {
      const response = await fetch(`/api/audio/${extractionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadSavedExtractions(); // Refresh the list
        alert('Extraction deleted successfully');
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete extraction');
    }
  }, []);

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

  const handleExport = useCallback(async (format: 'pdf' | 'docx' | 'txt' | 'srt' | 'vtt') => {
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
        {/* Navigation Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 border-gray-300 hover:border-gray-400 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Dashboard</span>
            </Button>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-gray-400" />
              <span className="text-gray-400">/</span>
              <span className="text-gray-600 font-medium">Audio Extraction</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              variant={showSavedExtractions ? "primary" : "outline"}
              size="sm"
              onClick={() => setShowSavedExtractions(!showSavedExtractions)}
              className="flex items-center space-x-2"
            >
              <Archive className="w-4 h-4" />
              <span>Saved Extractions</span>
              {savedExtractions.length > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {savedExtractions.length}
                </span>
              )}
            </Button>
          </div>
        </div>

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
                    <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                        <FileAudio className="w-4 h-4 text-white" />
                      </div>
                      <span>Professional Audio Player</span>
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">Advanced audio controls with professional features</p>
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
                        {/* Professional Waveform Visualization */}
                        <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-blue-50 rounded-xl p-6 border border-blue-200 shadow-inner">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="text-sm font-semibold text-gray-800 flex items-center space-x-2">
                              <div className="w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded"></div>
                              <span>Audio Waveform</span>
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                              <span>Interactive</span>
                            </div>
                          </div>

                          <div className="relative">
                            {/* Waveform bars */}
                            <div className="flex items-end justify-center h-20 space-x-0.5 bg-white rounded-lg p-2 shadow-sm">
                              {Array.from({ length: 80 }, (_, i) => {
                                const progress = (currentTime / duration) * 80;
                                const isActive = i < progress;
                                const height = 20 + Math.sin(i * 0.3) * 25 + Math.random() * 15;

                                return (
                                  <div
                                    key={i}
                                    className={`w-1 rounded-full transition-all duration-300 cursor-pointer hover:opacity-80 ${
                                      isActive
                                        ? 'bg-gradient-to-t from-blue-500 to-purple-600 shadow-sm'
                                        : 'bg-gradient-to-t from-gray-300 to-gray-400'
                                    }`}
                                    style={{
                                      height: `${Math.max(8, height)}%`,
                                      opacity: isActive ? 1 : 0.7
                                    }}
                                    onClick={() => {
                                      if (audioRef.current && duration > 0) {
                                        const newTime = (i / 80) * duration;
                                        audioRef.current.currentTime = newTime;
                                        setCurrentTime(newTime);
                                      }
                                    }}
                                    title={`Seek to ${formatTime((i / 80) * duration)}`}
                                  />
                                );
                              })}
                            </div>

                            {/* Playhead indicator */}
                            <div
                              className="absolute top-0 bottom-0 w-0.5 bg-red-500 shadow-lg transition-all duration-100"
                              style={{ left: `${2 + (currentTime / duration) * 96}%` }}
                            >
                              <div className="absolute -top-1 -left-1 w-2 h-2 bg-red-500 rounded-full shadow-md"></div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-3 text-xs text-gray-600">
                            <span className="font-medium">Click waveform to seek</span>
                            <div className="flex items-center space-x-4">
                              <span>Sample Rate: 44.1kHz</span>
                              <span>Bitrate: 320kbps</span>
                            </div>
                          </div>
                        </div>

                        {/* Professional Control Panel */}
                        <div className="flex items-center justify-center space-x-8 mb-6">
                          {/* Skip Backward */}
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = Math.max(0, currentTime - 10);
                              }
                            }}
                            className="w-12 h-12 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                            title="Skip back 10 seconds"
                          >
                            <SkipBack className="w-5 h-5" />
                          </Button>

                          {/* Restart */}
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = 0;
                                setCurrentTime(0);
                              }
                            }}
                            className="w-12 h-12 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                            title="Restart from beginning"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </Button>

                          {/* Main Play/Pause Button */}
                          <Button
                            variant="primary"
                            size="lg"
                            onClick={togglePlayPause}
                            className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                            title={isPlaying ? "Pause" : "Play"}
                          >
                            {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                          </Button>

                          {/* Skip Forward */}
                          <Button
                            variant="ghost"
                            size="lg"
                            onClick={() => {
                              if (audioRef.current) {
                                audioRef.current.currentTime = Math.min(duration, currentTime + 10);
                              }
                            }}
                            className="w-12 h-12 rounded-full text-gray-600 hover:text-gray-800 hover:bg-gray-100 transition-all duration-200"
                            title="Skip forward 10 seconds"
                          >
                            <SkipForward className="w-5 h-5" />
                          </Button>

                          {/* Playback Speed */}
                          <div className="flex flex-col items-center space-y-1">
                            <select
                              value={playbackRate}
                              onChange={(e) => {
                                const newRate = parseFloat(e.target.value);
                                setPlaybackRate(newRate);
                                if (audioRef.current) {
                                  audioRef.current.playbackRate = newRate;
                                }
                              }}
                              className="text-xs bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                              title="Playback speed"
                            >
                              <option value="0.25">0.25x</option>
                              <option value="0.5">0.5x</option>
                              <option value="0.75">0.75x</option>
                              <option value="1">1x</option>
                              <option value="1.25">1.25x</option>
                              <option value="1.5">1.5x</option>
                              <option value="1.75">1.75x</option>
                              <option value="2">2x</option>
                            </select>
                            <span className="text-xs text-gray-500 font-medium">Speed</span>
                          </div>
                        </div>

                        {/* Enhanced Progress Section */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-lg font-mono font-semibold text-gray-900">{formatTime(currentTime)}</span>
                              <span className="text-sm text-gray-500">/</span>
                              <span className="text-lg font-mono font-semibold text-gray-700">{formatTime(duration)}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                              <Clock className="w-4 h-4" />
                              <span>{Math.round((currentTime / duration) * 100) || 0}% complete</span>
                            </div>
                          </div>

                          {/* Professional Progress Bar */}
                          <div className="relative">
                            <div
                              className="w-full bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-3 cursor-pointer shadow-inner"
                              onClick={(e) => {
                                if (audioRef.current && duration > 0) {
                                  const rect = e.currentTarget.getBoundingClientRect();
                                  const percent = (e.clientX - rect.left) / rect.width;
                                  const newTime = percent * duration;
                                  audioRef.current.currentTime = newTime;
                                  setCurrentTime(newTime);
                                }
                              }}
                              title="Click to seek"
                            >
                              <div
                                className="bg-gradient-to-r from-blue-500 via-purple-500 to-blue-600 h-3 rounded-full transition-all duration-300 relative shadow-lg"
                                style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                              >
                                <div className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white border-3 border-blue-500 rounded-full shadow-lg hover:scale-110 transition-transform duration-200 cursor-grab active:cursor-grabbing"></div>
                              </div>
                            </div>

                            {/* Time markers */}
                            <div className="flex justify-between mt-1 px-1">
                              {Array.from({ length: 5 }, (_, i) => (
                                <div key={i} className="text-xs text-gray-400 font-mono">
                                  {formatTime((duration / 4) * i)}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Secondary Controls */}
                        <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                          {/* Volume Control */}
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsMuted(!isMuted);
                                if (audioRef.current) {
                                  audioRef.current.muted = !isMuted;
                                }
                              }}
                              className={`${isMuted ? 'text-red-500' : 'text-gray-600'} hover:text-gray-800`}
                              title={isMuted ? "Unmute" : "Mute"}
                            >
                              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </Button>
                            <div className="flex items-center space-x-2">
                              <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={volume}
                                onChange={(e) => {
                                  const newVolume = parseFloat(e.target.value);
                                  setVolume(newVolume);
                                  if (audioRef.current) {
                                    audioRef.current.volume = newVolume;
                                  }
                                }}
                                className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                title="Volume control"
                              />
                              <span className="text-xs text-gray-500 font-mono w-8">{Math.round(volume * 100)}%</span>
                            </div>
                          </div>

                          {/* Audio Info */}
                          <div className="flex items-center space-x-6 text-sm text-gray-600">
                            <div className="flex items-center space-x-1">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span>Live</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Zap className="w-4 h-4" />
                              <span>High Quality</span>
                            </div>
                          </div>

                          {/* Additional Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setIsLooping(!isLooping);
                                if (audioRef.current) {
                                  audioRef.current.loop = !isLooping;
                                }
                              }}
                              className={`${isLooping ? 'text-blue-600 bg-blue-50' : 'text-gray-500'} hover:text-blue-700 transition-colors`}
                              title={isLooping ? "Disable loop" : "Enable loop"}
                            >
                              <RotateCcw className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                              title="Download audio"
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-gray-500 hover:text-gray-700"
                              title="Share audio"
                            >
                              <Share2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>

                        {/* Keyboard Shortcuts Help */}
                        <div className="bg-gradient-to-r from-gray-50 to-slate-50 rounded-lg p-4 border border-gray-200 mt-4">
                          <details className="group">
                            <summary className="flex items-center justify-between cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 to-purple-600 rounded flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">⌨</span>
                                </div>
                                <span>Keyboard Shortcuts</span>
                              </div>
                              <div className="text-gray-400 group-open:rotate-180 transition-transform">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </div>
                            </summary>
                            <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Play/Pause</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">Space</kbd>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Skip ±5s</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">← →</kbd>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Skip ±30s</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">Shift + ← →</kbd>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Restart</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">Home</kbd>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Mute</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">M</kbd>
                              </div>
                              <div className="flex items-center justify-between bg-white rounded px-2 py-1 border">
                                <span className="text-gray-600">Loop</span>
                                <kbd className="bg-gray-100 px-1 rounded font-mono">L</kbd>
                              </div>
                            </div>
                          </details>
                        </div>

                        {/* Recent Extractions Quick Access */}
                        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Recent Extractions</h3>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setShowSavedExtractions(true)}
                              className="text-blue-600 hover:text-blue-700"
                            >
                              View All
                            </Button>
                          </div>

                          {savedExtractions.length === 0 ? (
                            <div className="text-center py-6">
                              <Archive className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              <p className="text-sm text-gray-500">No saved extractions yet</p>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {savedExtractions.slice(0, 3).map((extraction) => (
                                <div
                                  key={extraction.id}
                                  className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                                  onClick={() => loadSavedExtraction(extraction.id)}
                                >
                                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <FileText className="w-4 h-4 text-white" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                      {(extraction as any).audioFile?.originalName || 'Untitled'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                      {new Date((extraction as any).audioFile?.createdAt || (extraction as any).createdAt).toLocaleDateString()} • {extraction.text.split(' ').length} words
                                    </p>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadSavedExtraction(extraction.id);
                                    }}
                                  >
                                    <Edit3 className="w-4 h-4" />
                                  </Button>
                                </div>
                              ))}

                              {savedExtractions.length > 3 && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setShowSavedExtractions(true)}
                                  className="w-full text-blue-600 border-blue-300 hover:bg-blue-50"
                                >
                                  View {savedExtractions.length - 3} More
                                </Button>
                              )}
                            </div>
                          )}
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
                  showAdvancedFeatures={hasAdvancedAccess}
                  autoSave={true}
                  placeholder="Your transcription will appear here. Use the professional editor to format, enhance, and export your content..."
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

        {/* Saved Extractions Manager */}
        <SavedExtractionsManager
          isOpen={showSavedExtractions}
          onClose={() => setShowSavedExtractions(false)}
          onLoadExtraction={loadSavedExtraction}
          onDeleteExtraction={deleteSavedExtraction}
        />
      </div>
    </div>
  );
};
