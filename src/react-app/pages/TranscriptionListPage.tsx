import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
  Archive,
  Search,
  Filter,
  RotateCcw,
  Edit3,
  Trash2,
  Calendar,
  Clock,
  FileText,
  Loader,
  Tag,
  Bookmark,
  Eye,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';

interface SavedExtraction {
  id: string;
  text: string;
  editedText?: string;
  confidence: number;
  language: string;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  audioFile: {
    filename: string;
    originalName: string;
    duration: number;
    createdAt: string;
  };
}

export const TranscriptionListPage: React.FC = () => {
  const navigate = useNavigate();
  const [extractions, setExtractions] = useState<SavedExtraction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'completed' | 'processing'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'duration'>('date');
  const [selectedExtractions, setSelectedExtractions] = useState<Set<string>>(new Set());

  // Load saved extractions
  const loadExtractions = useCallback(async () => {
    setIsLoading(true);
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
        setExtractions(extractionsWithTranscriptions);
      }
    } catch (error) {
      console.error('Failed to load extractions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadExtractions();
  }, [loadExtractions]);

  // Filter and sort extractions
  const filteredExtractions = extractions
    .filter(extraction => {
      const matchesSearch = searchTerm === '' ||
        extraction.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        extraction.audioFile.originalName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || extraction.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.audioFile.originalName.localeCompare(b.audioFile.originalName);
        case 'duration':
          return b.audioFile.duration - a.audioFile.duration;
        case 'date':
        default:
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
    });

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedExtractions);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedExtractions(newSelection);
  };

  const selectAll = () => {
    if (selectedExtractions.size === filteredExtractions.length) {
      setSelectedExtractions(new Set());
    } else {
      setSelectedExtractions(new Set(filteredExtractions.map(e => e.id)));
    }
  };

  const bulkDelete = async () => {
    if (selectedExtractions.size === 0) return;

    if (!confirm(`Delete ${selectedExtractions.size} selected extractions?`)) return;

    for (const id of selectedExtractions) {
      await deleteExtraction(id);
    }
    setSelectedExtractions(new Set());
    loadExtractions();
  };

  const deleteExtraction = async (extractionId: string) => {
    try {
      const response = await fetch(`/api/audio/${extractionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        loadExtractions();
      }
    } catch (error) {
      console.error('Failed to delete extraction:', error);
    }
  };

  const loadExtraction = (extractionId: string) => {
    navigate(`/extract?id=${extractionId}`);
  };

  return (
    <DashboardLayout>
      <div className="p-6">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Archive className="w-6 h-6" />
                <div>
                  <h2 className="text-2xl font-bold">My Transcriptions</h2>
                  <p className="text-blue-100">Manage your transcription library ({extractions.length} total)</p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => navigate('/extract')}
                className="text-white hover:bg-white/20 flex items-center space-x-2"
              >
                <Upload className="w-5 h-5" />
                <span>New Transcription</span>
              </Button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by filename or content..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="processing">Processing</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="date">Date</option>
                  <option value="name">Name</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={loadExtractions}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </Button>
            </div>

            {/* Bulk Actions */}
            {selectedExtractions.size > 0 && (
              <div className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-blue-800">
                    {selectedExtractions.size} selected
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedExtractions(new Set())}
                    className="text-blue-600 hover:text-blue-700"
                  >
                    Clear
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Extractions List */}
          <div className="max-h-[60vh] overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader className="w-8 h-8 text-blue-600 animate-spin" />
                <span className="ml-3 text-gray-600">Loading saved extractions...</span>
              </div>
            ) : filteredExtractions.length === 0 ? (
              <div className="text-center py-12">
                <Archive className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm || filterStatus !== 'all' ? 'No Matching Extractions' : 'No Saved Extractions'}
                </h3>
                <p className="text-gray-500">
                  {searchTerm || filterStatus !== 'all'
                    ? 'Try adjusting your search or filter criteria.'
                    : 'Your transcriptions will appear here once you save them.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {/* Select All Header */}
                <div className="p-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedExtractions.size === filteredExtractions.length && filteredExtractions.length > 0}
                      onChange={selectAll}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Select All ({filteredExtractions.length})
                    </span>
                  </div>
                </div>

                {filteredExtractions.map((extraction) => (
                  <div key={extraction.id} className="p-6 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedExtractions.has(extraction.id)}
                        onChange={() => toggleSelection(extraction.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-1"
                      />

                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {extraction.audioFile.originalName || 'Untitled Extraction'}
                            </h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <span className="flex items-center space-x-1">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(extraction.audioFile.createdAt).toLocaleDateString()}</span>
                              </span>
                              <span className="flex items-center space-x-1">
                                <Clock className="w-4 h-4" />
                                <span>{Math.ceil(extraction.audioFile.duration / 60)} min</span>
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                extraction.status === 'completed'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {extraction.status}
                              </span>
                              <span className="flex items-center space-x-1">
                                <Tag className="w-4 h-4" />
                                <span>{extraction.language.toUpperCase()}</span>
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-gray-600 text-sm line-clamp-3 mb-3 leading-relaxed">
                          {(extraction.editedText || extraction.text).substring(0, 200)}...
                        </p>

                        <div className="flex items-center space-x-4 text-xs text-gray-500">
                          <span className="flex items-center space-x-1">
                            <FileText className="w-3 h-3" />
                            <span>{extraction.text.split(' ').length} words</span>
                          </span>
                          <span>•</span>
                          <span>{Math.ceil(extraction.text.split(' ').length / 200)} min read</span>
                          <span>•</span>
                          <span>{Math.round(extraction.confidence * 100)}% confidence</span>
                          {extraction.editedText && (
                            <>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">Edited</span>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => loadExtraction(extraction.id)}
                          className="flex items-center space-x-1 text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit3 className="w-4 h-4" />
                          <span>Load</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Preview functionality
                            alert('Preview feature coming soon!');
                          }}
                          className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            // Bookmark functionality
                            alert('Bookmark feature coming soon!');
                          }}
                          className="text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50"
                          title="Bookmark"
                        >
                          <Bookmark className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteExtraction(extraction.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{filteredExtractions.length} of {extractions.length} extractions</span>
                {selectedExtractions.size > 0 && (
                  <span className="text-blue-600 font-medium">
                    {selectedExtractions.size} selected
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-3">
                {selectedExtractions.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={bulkDelete}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete Selected
                  </Button>
                )}
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => navigate('/extract')}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-5 h-5" />
                  <span>New Transcription</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
