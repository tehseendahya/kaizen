'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

type Course = { 
  id: string; 
  code: string; 
  title: string; 
  description: string | null;
  subject_id?: string; // For backward compatibility
  full_name?: string; // For backward compatibility
};

type UploadedFile = {
  id: string;
  filename: string;
  file_size: number;
  storage_path: string;
  created_at: string;
};

export default function TestUploadClient({ userId, username }: { userId: string; username: string }) {
  const supabase = createClient();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const [importId, setImportId] = useState<string>('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [status, setStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Quick add course form
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  // Load courses
  useEffect(() => {
    loadCourses();
  }, []);

  // Refresh uploaded files when importId changes
  useEffect(() => {
    if (importId) {
      refreshFileList();
    }
  }, [importId]);

  async function loadCourses() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('code', { ascending: true });
    
    if (error) {
      console.error('Error loading courses:', error);
      setStatus(`Error: ${error.message}`);
    } else {
      setCourses(data || []);
    }
  }

  async function createCourseQuick() {
    if (!newCourseCode || !newCourseTitle) {
      alert('Please enter both course code and title.');
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('courses')
      .insert({ 
        code: newCourseCode, 
        title: newCourseTitle,
        description: newCourseDesc || null,
        created_by: userId,
      })
      .select()
      .single();

    if (error) {
      alert(`Error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    setSelectedCourseId(data.id);
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewCourseDesc('');
    setShowQuickAdd(false);
    await loadCourses();
    setIsLoading(false);
    setStatus('Course created successfully!');
  }

  async function startImport() {
    if (!selectedCourseId) {
      alert('Please select or create a course first.');
      return;
    }

    setIsLoading(true);
    const { data, error } = await supabase
      .from('ingestions')
      .insert({ 
        course_id: selectedCourseId, 
        created_by: userId, 
        status: 'UPLOADED' 
      })
      .select('id')
      .single();

    if (error) {
      alert(`Error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    setImportId(data.id);
    setUploadedFiles([]);
    setStatus(`Import started. ID: ${data.id}`);
    setIsLoading(false);
  }

  async function doUpload() {
    if (!importId) {
      alert('Please start an import first.');
      return;
    }

    if (!files || files.length === 0) {
      alert('Please select files to upload.');
      return;
    }

    setIsLoading(true);
    setStatus('Uploading files...');

    const uploaded: UploadedFile[] = [];
    const errors: string[] = [];

    for (const file of Array.from(files)) {
      // Get course_id for path
      const courseId = selectedCourseId;
      const path = `${courseId}/${importId}/${file.name}`;

      try {
        // 1) Upload to storage
        const { error: storageError } = await supabase.storage
          .from('course-uploads')
          .upload(path, file, { 
            upsert: false,
            contentType: file.type || 'application/octet-stream',
          });

        if (storageError) {
          errors.push(`${file.name}: ${storageError.message}`);
          continue;
        }

        // 2) For now, we'll track files via storage listing
        // (We don't have uploaded_files table in our schema)
        // In a real implementation, you'd insert into uploaded_files here
        
        uploaded.push({
          id: `${importId}-${file.name}`, // Temporary ID
          filename: file.name,
          file_size: file.size,
          storage_path: path,
          created_at: new Date().toISOString(),
        });
      } catch (err: any) {
        errors.push(`${file.name}: ${err.message}`);
      }
    }

    if (uploaded.length > 0) {
      setUploadedFiles(prev => [...uploaded, ...prev]);
    }

    if (errors.length > 0) {
      setStatus(`Uploaded ${uploaded.length} files. Errors: ${errors.join('; ')}`);
    } else {
      setStatus(`Successfully uploaded ${uploaded.length} file(s).`);
    }

    setIsLoading(false);
    await refreshFileList();
  }

  async function refreshFileList() {
    if (!importId || !selectedCourseId) return;

    try {
      // List files from storage
      const { data: files, error } = await supabase.storage
        .from('course-uploads')
        .list(`${selectedCourseId}/${importId}`, {
          limit: 100,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) {
        console.error('Error listing files:', error);
        return;
      }

      if (files && files.length > 0) {
        const fileList: UploadedFile[] = files.map(f => ({
          id: f.id || f.name,
          filename: f.name,
          file_size: f.metadata?.size || 0,
          storage_path: `${selectedCourseId}/${importId}/${f.name}`,
          created_at: f.created_at || new Date().toISOString(),
        }));
        setUploadedFiles(fileList);
      } else {
        setUploadedFiles([]);
      }
    } catch (err) {
      console.error('Error refreshing file list:', err);
    }
  }

  async function markReady() {
    if (!importId) {
      alert('No active import.');
      return;
    }

    setIsLoading(true);
    const { error } = await supabase
      .from('ingestions')
      .update({ status: 'READY_FOR_REVIEW' })
      .eq('id', importId);

    if (error) {
      alert(`Error: ${error.message}`);
      setIsLoading(false);
      return;
    }

    setStatus('Import marked as ready for review.');
    setIsLoading(false);
  }

  async function resetImport() {
    setImportId('');
    setUploadedFiles([]);
    setFiles(null);
    setStatus('Import session reset.');
  }

  async function runRlsCheck() {
    if (!importId) {
      alert('Start an import first.');
      return;
    }

    // Check 1: Can read own ingestion
    const { data: selfImport, error: selfError } = await supabase
      .from('ingestions')
      .select('id, course_id, status')
      .eq('id', importId)
      .maybeSingle();

    // Check 2: Can read files from storage (via listing)
    const { data: ownFiles, error: filesError } = await supabase.storage
      .from('course-uploads')
      .list(`${selectedCourseId}/${importId}`, { limit: 10 });

    // Check 3: Try to read a bogus/other import
    const bogusId = '11111111-1111-1111-1111-111111111111';
    const { data: bogusImport, error: bogusError } = await supabase
      .from('ingestions')
      .select('id')
      .eq('id', bogusId)
      .maybeSingle();

    const results = [
      `Self import visible: ${selfImport ? 'YES ✅' : 'NO ❌'} ${selfError ? `(${selfError.message})` : ''}`,
      `Own files accessible: ${ownFiles ? `YES ✅ (${ownFiles.length} files)` : 'NO ❌'} ${filesError ? `(${filesError.message})` : ''}`,
      `Bogus/other import visible: ${bogusImport ? 'YES ❌ (SECURITY ISSUE!)' : 'NO ✅ (Good - blocked by RLS)'} ${bogusError ? `(${bogusError.message})` : ''}`,
    ];

    alert(results.join('\n\n'));
  }

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  const courseDisplay = selectedCourse 
    ? `${selectedCourse.code}: ${selectedCourse.title}`
    : '— Select a course —';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Professor Upload Test</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Logged in as <b>{username}</b></span>
          <Badge className="bg-green-100 text-green-800">Professor ✅</Badge>
          <span className="text-xs text-gray-400">User ID: {userId.substring(0, 8)}...</span>
        </div>
      </div>

      {/* Course Picker */}
      <section className="bg-white p-6 rounded-lg border space-y-3">
        <h2 className="text-lg font-semibold">1) Pick or Create a Course</h2>
        
        <div className="flex gap-3">
          <select 
            className="flex-1 border rounded-md px-3 py-2" 
            value={selectedCourseId} 
            onChange={e => setSelectedCourseId(e.target.value)}
          >
            <option value="">— Select a course —</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>
                {c.code}: {c.title}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            {showQuickAdd ? 'Cancel' : '+ Quick Add Course'}
          </Button>
        </div>

        {showQuickAdd && (
          <div className="mt-4 p-4 bg-gray-50 rounded-md space-y-3">
            <Input
              placeholder="Course Code (e.g., CS201)"
              value={newCourseCode}
              onChange={e => setNewCourseCode(e.target.value)}
            />
            <Input
              placeholder="Course Title (e.g., Data Structures)"
              value={newCourseTitle}
              onChange={e => setNewCourseTitle(e.target.value)}
            />
            <Input
              placeholder="Description (optional)"
              value={newCourseDesc}
              onChange={e => setNewCourseDesc(e.target.value)}
            />
            <Button onClick={createCourseQuick} disabled={isLoading}>
              Create Course
            </Button>
          </div>
        )}

        {selectedCourseId && (
          <div className="text-sm text-gray-600">
            Selected: <b>{courseDisplay}</b>
          </div>
        )}
      </section>

      {/* Start Import */}
      <section className="bg-white p-6 rounded-lg border space-y-3">
        <h2 className="text-lg font-semibold">2) Start Import</h2>
        <Button onClick={startImport} disabled={!selectedCourseId || isLoading}>
          Start Import
        </Button>
        {importId && (
          <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
            <span className="font-mono">import_id: {importId}</span>
          </div>
        )}
      </section>

      {/* Upload Files */}
      <section className="bg-white p-6 rounded-lg border space-y-3">
        <h2 className="text-lg font-semibold">3) Upload Files</h2>
        
        <input 
          type="file" 
          multiple 
          onChange={e => setFiles(e.target.files)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <div className="flex flex-wrap gap-2">
          <Button onClick={doUpload} disabled={!importId || !files || isLoading}>
            Upload Files
          </Button>
          <Button variant="outline" onClick={refreshFileList} disabled={!importId || isLoading}>
            Refresh List
          </Button>
          <Button variant="outline" onClick={markReady} disabled={!importId || isLoading}>
            Mark Import Complete
          </Button>
          <Button variant="outline" onClick={runRlsCheck} disabled={!importId || isLoading}>
            Run RLS Checks
          </Button>
          <Button variant="outline" onClick={resetImport} disabled={isLoading}>
            Reset
          </Button>
        </div>

        {status && (
          <div className="text-sm p-2 bg-blue-50 text-blue-700 rounded">
            {status}
          </div>
        )}
      </section>

      {/* Upload Summary */}
      <section className="bg-white p-6 rounded-lg border">
        <h2 className="text-lg font-semibold mb-4">4) Uploaded Files</h2>
        
        {uploadedFiles.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No files uploaded yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left p-2 font-medium">Filename</th>
                  <th className="text-left p-2 font-medium">Size</th>
                  <th className="text-left p-2 font-medium">Storage Path</th>
                  <th className="text-left p-2 font-medium">Created</th>
                </tr>
              </thead>
              <tbody>
                {uploadedFiles.map((file) => (
                  <tr key={file.id} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-mono text-xs">{file.filename}</td>
                    <td className="p-2">{(file.file_size / 1024).toFixed(1)} KB</td>
                    <td className="p-2 font-mono text-xs text-gray-600">{file.storage_path}</td>
                    <td className="p-2 text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

