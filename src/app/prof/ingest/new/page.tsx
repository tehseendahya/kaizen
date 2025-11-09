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
        if (!courseRes.ok) {
          let errorData: any = {};
          let responseText = '';
          try {
            responseText = await courseRes.text();
            console.log('Course creation error response text:', responseText);
            
            if (responseText && responseText.trim()) {
              try {
                errorData = JSON.parse(responseText);
                console.log('Parsed error data:', errorData);
              } catch (parseError) {
                console.error('Failed to parse error JSON:', parseError);
                errorData = { error: responseText, raw: responseText };
              }
            } else {
              console.warn('Empty response body from course creation API');
              errorData = { error: 'Empty response', status: courseRes.status };
            }
          } catch (readError: any) {
            console.error('Failed to read error response:', readError);
            errorData = {
              error: 'Failed to read error response',
              readError: readError?.message || 'Unknown error',
              status: courseRes.status,
              statusText: courseRes.statusText,
            };
          }
          
          // Build comprehensive error details
          const errorDetails: any = {
            status: courseRes.status || 'unknown',
            statusText: courseRes.statusText || 'unknown',
            url: courseRes.url || 'unknown',
          };
          
          // Extract all error properties from errorData
          if (errorData && typeof errorData === 'object') {
            // Check if errorData is an empty object
            const errorDataKeys = Object.keys(errorData);
            if (errorDataKeys.length === 0) {
              // Empty object - use HTTP status to create meaningful error
              errorDetails.error = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
              errorDetails.details = `Server returned ${errorDetails.status} with no error details.`;
              
              // Provide helpful hints based on status code
              if (errorDetails.status === 401) {
                errorDetails.details = 'You are not authenticated. Please log in and try again.';
              } else if (errorDetails.status === 403) {
                errorDetails.details = 'You do not have permission to create courses. Make sure you are logged in as a professor.';
              } else if (errorDetails.status === 500) {
                errorDetails.details = 'Server error occurred. Please check the server logs or try again later.';
              }
            } else {
              // Extract all properties from errorData
              errorDataKeys.forEach(key => {
                const value = errorData[key];
                if (value !== undefined && value !== null) {
                  errorDetails[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
                }
              });
            }
          } else if (errorData) {
            errorDetails.error = String(errorData);
            errorDetails.details = String(errorData);
          }
          
          // Also try to extract from response headers or other sources
          if (!errorDetails.error && !errorDetails.details && !errorDetails.message) {
            // Try to get error from response headers
            const contentType = courseRes.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
              errorDetails.hint = 'Response was JSON but no error details found';
            }
            errorDetails.error = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
            errorDetails.details = errorDetails.error;
          }
          
          // Ensure we have meaningful error information - prioritize message, then details, then error
          let errorMessage = errorDetails.message || errorDetails.details || errorDetails.error;
          
          // If still no message, use status-based defaults
          if (!errorMessage) {
            if (errorDetails.status === 401) {
              errorMessage = 'You must be logged in to create a course';
            } else if (errorDetails.status === 403) {
              errorMessage = 'Only professors can create courses';
            } else if (errorDetails.status === 500) {
              errorMessage = 'Server error occurred while creating course';
            } else {
              errorMessage = `Failed to create course (HTTP ${errorDetails.status})`;
            }
          }
          
          // Add hint if available
          if (errorDetails.hint && !errorMessage.includes(errorDetails.hint)) {
            errorMessage = `${errorMessage}. ${errorDetails.hint}`;
          }
          
          console.error('Course creation error - full details:', {
            errorDetails,
            errorData,
            responseText,
            status: errorDetails.status,
            statusText: errorDetails.statusText,
          });
          
          throw new Error(errorMessage);
        }
        const courseData = await courseRes.json();
        finalCourseId = courseData.id;
      }

      // Step 2: Upload files
      const formData = new FormData();
      files.forEach((file) => {
        formData.append('files', file);
      });
      formData.append('courseId', finalCourseId);

      let uploadRes: Response;
      try {
        uploadRes = await fetch('/api/prof/ingest/upload', {
          method: 'POST',
          body: formData,
        });
      } catch (networkError: any) {
        console.error('Network error during upload:', {
          message: networkError?.message || 'Unknown network error',
          name: networkError?.name || 'Error',
          stack: networkError?.stack,
        });
        throw new Error(
          `Failed to connect to server. Please check your internet connection and try again. ${networkError?.message || ''}`
        );
      }

      if (!uploadRes.ok) {
        let errorData: any = {};
        let responseText = '';
        try {
          responseText = await uploadRes.text();
          if (responseText && responseText.trim()) {
            try {
              errorData = JSON.parse(responseText);
            } catch (parseError) {
              errorData = { error: responseText, raw: responseText };
            }
          } else {
            errorData = { error: 'Empty response', status: uploadRes.status };
          }
        } catch (readError: any) {
          errorData = {
            error: 'Failed to read error response',
            readError: readError?.message || 'Unknown error',
            status: uploadRes.status,
            statusText: uploadRes.statusText,
          };
        }

        // Build comprehensive error details
        const errorDetails: any = {
          status: uploadRes.status || 'unknown',
          statusText: uploadRes.statusText || 'unknown',
        };

        // Extract all error properties
        if (errorData && typeof errorData === 'object') {
          // Check if errorData is an empty object
          const errorDataKeys = Object.keys(errorData);
          if (errorDataKeys.length === 0) {
            errorDetails.error = 'Empty error object received from server';
            errorDetails.details = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
          } else {
            // Extract all properties from errorData
            errorDataKeys.forEach(key => {
              const value = errorData[key];
              if (value !== undefined && value !== null) {
                errorDetails[key] = typeof value === 'object' ? JSON.stringify(value) : String(value);
              }
            });
          }
        } else if (errorData) {
          errorDetails.error = String(errorData);
        }

        // Ensure we have at least one error message
        if (!errorDetails.error && !errorDetails.details) {
          errorDetails.error = `HTTP ${errorDetails.status}: ${errorDetails.statusText}`;
          errorDetails.details = errorDetails.error;
        }

        // Build a comprehensive error message
        let errorMessage = errorDetails.details || errorDetails.error || errorDetails.hint || 'Upload failed';
        
        // If there are upload errors, include them
        if (errorData?.uploadErrors && Array.isArray(errorData.uploadErrors)) {
          const uploadErrorMessages = errorData.uploadErrors
            .map((e: any) => `${e.fileName}: ${e.error?.message || 'Unknown error'}`)
            .join('\n');
          errorMessage = `${errorMessage}\n\nFile upload errors:\n${uploadErrorMessages}`;
        }
        
        console.error('Upload error:', errorDetails);
        throw new Error(errorMessage);
      }

      let ingestionId: string;
      try {
        const uploadData = await uploadRes.json();
        ingestionId = uploadData.ingestionId;
        if (!ingestionId) {
          throw new Error('No ingestion ID returned from server');
        }
      } catch (parseError: any) {
        console.error('Failed to parse upload response:', parseError);
        throw new Error('Invalid response from server. Please try again.');
      }

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/prof/courses')
      .then(async (res) => {
        if (!res.ok) {
          let errorData: any = {};
          try {
            const text = await res.text();
            if (text) {
              errorData = JSON.parse(text);
            }
          } catch (e) {
            errorData = { error: `HTTP ${res.status}: ${res.statusText}` };
          }
          const errorMessage = errorData.details || errorData.error || errorData.hint || `HTTP ${res.status}`;
          console.error('Courses API error:', {
            status: res.status,
            statusText: res.statusText,
            error: errorData,
          });
          throw new Error(errorMessage);
        }
        return res.json();
      })
      .then((data) => {
        // Ensure data is an array
        if (Array.isArray(data)) {
          setCourses(data);
        } else {
          console.error('Courses API returned non-array:', data);
          setCourses([]);
          setError('Invalid response format');
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching courses:', err);
        setError(err.message || 'Failed to load courses. Check console for details.');
        setLoading(false);
        setCourses([]); // Ensure it's always an array
      });
  }, []);

  if (loading) return <div className="text-sm text-gray-500">Loading courses...</div>;

  if (error) {
    return (
      <div className="text-sm text-red-600">
        {error}
      </div>
    );
  }

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

