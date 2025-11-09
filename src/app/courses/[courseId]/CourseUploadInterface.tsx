'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CourseUploadInterface({ courseId }: { courseId: string }) {
  const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
  const [scheduleFile, setScheduleFile] = useState<File | null>(null);
  const [notesFile, setNotesFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleUploadAndGenerate = async () => {
    if (!syllabusFile && !scheduleFile && !notesFile) {
      setMessage({ type: 'error', text: 'Please upload at least one file' });
      return;
    }

    try {
      setUploading(true);
      setMessage(null);

      // Step 1: Upload files
      const formData = new FormData();
      formData.append('courseId', courseId);
      
      if (syllabusFile) formData.append('files', syllabusFile);
      if (scheduleFile) formData.append('files', scheduleFile);
      if (notesFile) formData.append('files', notesFile);

      console.log('Uploading files...');
      const uploadResponse = await fetch('/api/prof/ingest/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Failed to upload files');
      }

      const uploadResult = await uploadResponse.json();
      console.log('✅ Files uploaded:', uploadResult);
      
      setUploading(false);
      setParsing(true);
      setMessage({ type: 'success', text: '✅ Files uploaded. Parsing content...' });

      // Step 2: Parse files (using upload result ingestion ID)
      const ingestionId = uploadResult.ingestionId;
      if (ingestionId) {
        console.log('Parsing files...');
        const parseResponse = await fetch(`/api/prof/ingest/${ingestionId}/parse`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });

        if (!parseResponse.ok) {
          throw new Error('Failed to parse files');
        }

        console.log('✅ Files parsed');
      }

      setParsing(false);
      setGenerating(true);
      setMessage({ type: 'success', text: '✅ Content parsed. Generating AI course...' });

      // Step 3: Generate AI draft
      console.log('Generating AI course content...');
      const generateResponse = await fetch(`/api/prof/courses/${courseId}/generate-draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to generate AI content');
      }

      console.log('✅ AI content generated');
      setGenerating(false);
      setMessage({ 
        type: 'success', 
        text: '🎉 Course generated successfully! Refreshing preview...' 
      });

      // Refresh page to show the generated content
      setTimeout(() => {
        window.location.reload();
      }, 2000);

    } catch (error: any) {
      console.error('Course generation error:', error);
      setMessage({
        type: 'error',
        text: `❌ Error: ${error.message}`
      });
      setUploading(false);
      setParsing(false);
      setGenerating(false);
    }
  };

  const isProcessing = uploading || parsing || generating;

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message && (
        <div className={`p-4 rounded-lg border ${
          message.type === 'success' 
            ? 'bg-green-50 border-green-200 text-green-700'
            : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* File Upload Section */}
      <div className="space-y-4">
        <h3 className="font-semibold text-slate-900">Upload Course Materials</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FileUploadCard
            title="Syllabus"
            description="Course syllabus (PDF/Word)"
            file={syllabusFile}
            onFileChange={setSyllabusFile}
            accept=".pdf,.doc,.docx"
          />
          <FileUploadCard
            title="Schedule"
            description="Course schedule/calendar"
            file={scheduleFile}
            onFileChange={setScheduleFile}
            accept=".pdf,.doc,.docx,.xls,.xlsx"
          />
          <FileUploadCard
            title="Practice Materials"
            description="Exams, notes, assignments"
            file={notesFile}
            onFileChange={setNotesFile}
            accept=".pdf,.doc,.docx,.zip"
          />
        </div>
      </div>

      {/* Action Button */}
      <div className="text-center">
        <Button
          onClick={handleUploadAndGenerate}
          disabled={isProcessing}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-semibold"
        >
          {uploading && '📤 Uploading Files...'}
          {parsing && '🔍 Parsing Content...'}
          {generating && '🤖 Generating Course...'}
          {!isProcessing && '🚀 Upload & Generate Course'}
        </Button>
        
        {isProcessing && (
          <p className="text-sm text-slate-600 mt-2">
            This may take a few minutes. Please wait...
          </p>
        )}
      </div>
    </div>
  );
}

function FileUploadCard({ 
  title, 
  description, 
  file, 
  onFileChange, 
  accept 
}: { 
  title: string; 
  description: string; 
  file: File | null; 
  onFileChange: (file: File | null) => void;
  accept: string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-slate-900">{title}</h4>
          <p className="text-sm text-slate-500">{description}</p>
        </div>
        {file && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
            ✓ Uploaded
          </span>
        )}
      </div>
      
      <div className="space-y-2">
        <input
          type="file"
          accept={accept}
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          id={`upload-${title.toLowerCase().replace(/\s+/g, '-')}`}
        />
        <label
          htmlFor={`upload-${title.toLowerCase().replace(/\s+/g, '-')}`}
          className={`block w-full px-4 py-3 border-2 border-dashed rounded-lg text-center cursor-pointer transition-all ${
            file 
              ? 'border-green-300 bg-green-50 text-green-700'
              : 'border-slate-300 hover:border-slate-400 text-slate-600 hover:bg-slate-50'
          }`}
        >
          {file ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {file.name}
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Click to upload {title.toLowerCase()}
            </span>
          )}
        </label>
        {file && (
          <button
            onClick={(e) => {
              e.preventDefault();
              onFileChange(null);
            }}
            className="text-xs text-red-600 hover:text-red-700"
          >
            Remove file
          </button>
        )}
      </div>
    </div>
  );
}
