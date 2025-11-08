'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function NewIngestionPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [courseId, setCourseId] = useState<string>('');
  const [newCourse, setNewCourse] = useState({ code: '', title: '', description: '' });
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleSubmit = async () => {
    if (!courseId && (!newCourse.code || !newCourse.title)) {
      setError('Please select a course or create a new one');
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one file');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      // Step 1: Create course if needed
      let finalCourseId = courseId;
      if (!courseId) {
        const courseRes = await fetch('/api/prof/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newCourse),
        });
        if (!courseRes.ok) throw new Error('Failed to create course');
        const courseData = await courseRes.json();
        finalCourseId = courseData.id;
      }

      // Step 2: Upload files
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('courseId', finalCourseId);

      const uploadRes = await fetch('/api/prof/ingest/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const errorData = await uploadRes.json();
        throw new Error(errorData.error || 'Upload failed');
      }

      const { ingestionId } = await uploadRes.json();

      // Step 3: Start processing
      const startRes = await fetch(`/api/prof/ingest/start?ingestionId=${ingestionId}`, {
        method: 'POST',
      });

      if (!startRes.ok) {
        throw new Error('Failed to start processing');
      }

      router.push(`/prof/ingest/${ingestionId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">New Course Ingestion</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6 space-y-8">
        {/* Step 1: Select Course */}
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 1: Select Course</h2>
              
              <div className="space-y-4">
                <div>
                  <Label>Select Existing Course</Label>
                  <CourseSelector value={courseId} onChange={setCourseId} />
                </div>

                <div className="text-center text-gray-500">OR</div>

                <div className="space-y-4 border-t pt-4">
                  <h3 className="font-medium">Create New Course</h3>
                  <div>
                    <Label htmlFor="code">Course Code</Label>
                    <Input
                      id="code"
                      value={newCourse.code}
                      onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                      placeholder="CS201"
                      disabled={!!courseId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="title">Course Title</Label>
                    <Input
                      id="title"
                      value={newCourse.title}
                      onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                      placeholder="Data Structures and Algorithms"
                      disabled={!!courseId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Input
                      id="description"
                      value={newCourse.description}
                      onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                      placeholder="Course description..."
                      disabled={!!courseId}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!courseId && (!newCourse.code || !newCourse.title)}>
                  Next: Upload Files
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Upload Files */}
        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Step 2: Upload Course Files</h2>
              
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors"
              >
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.doc,.docx,.txt,.md"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <div className="space-y-4">
                    <div className="text-4xl">📁</div>
                    <div>
                      <span className="text-blue-600 hover:text-blue-700 font-medium">
                        Click to upload
                      </span>{' '}
                      or drag and drop
                    </div>
                    <div className="text-sm text-gray-500">
                      PDF, DOCX, TXT, MD files (max 200MB per file)
                    </div>
                  </div>
                </label>
              </div>

              {files.length > 0 && (
                <div className="mt-6">
                  <h3 className="font-medium mb-2">Selected Files ({files.length})</h3>
                  <ul className="space-y-2">
                    {files.map((file, idx) => (
                      <li key={idx} className="text-sm text-gray-600 flex items-center justify-between">
                        <span>{file.name}</span>
                        <span className="text-gray-400">
                          {(file.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={uploading || files.length === 0}>
                  {uploading ? 'Uploading...' : 'Upload & Process'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function CourseSelector({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [courses, setCourses] = useState<Array<{ id: string; code: string; title: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/prof/courses')
      .then((res) => res.json())
      .then((data) => {
        setCourses(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading courses...</div>;

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-3 py-2 border border-gray-300 rounded-md"
    >
      <option value="">Select a course...</option>
      {courses.map((course) => (
        <option key={course.id} value={course.id}>
          {course.code}: {course.title}
        </option>
      ))}
    </select>
  );
}

