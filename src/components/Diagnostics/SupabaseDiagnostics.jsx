import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabaseClient';
import { checkBucketExists, listFiles } from '../../utils/storageHelpers';
import './SupabaseDiagnostics.css';

export default function SupabaseDiagnostics() {
  const [testResults, setTestResults] = useState({
    connection: { status: 'pending', message: 'Testing connection...' },
    auth: { status: 'pending', message: 'Checking authentication...' },
    storage: { status: 'pending', message: 'Testing storage...' },
  });
  const [buckets, setBuckets] = useState([]);
  const [selectedBucket, setSelectedBucket] = useState(null);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    runDiagnostics();
  }, []);

  const runDiagnostics = async () => {
    await testConnection();
    await testAuth();
    await testStorage();
  };

  const testConnection = async () => {
    try {
      // We'll do a simple query to test connection
      const startTime = performance.now();
      const { data, error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
      const endTime = performance.now();
      const responseTime = (endTime - startTime).toFixed(2);

      if (error) {
        setTestResults(prev => ({
          ...prev,
          connection: {
            status: 'error',
            message: `Connection failed: ${error.message}`,
            details: error
          }
        }));
        return;
      }

      setTestResults(prev => ({
        ...prev,
        connection: {
          status: 'success',
          message: `Connection successful! Response time: ${responseTime}ms`,
        }
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        connection: {
          status: 'error',
          message: `Connection failed: ${err.message}`,
          details: err
        }
      }));
    }
  };

  const testAuth = async () => {
    try {
      // Check if we have a session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setTestResults(prev => ({
          ...prev,
          auth: {
            status: 'error',
            message: `Auth error: ${sessionError.message}`,
            details: sessionError
          }
        }));
        return;
      }

      if (!session) {
        setTestResults(prev => ({
          ...prev,
          auth: {
            status: 'warning',
            message: 'Not authenticated (expected if not logged in)'
          }
        }));
        return;
      }

      // Try to get the user
      const { data, error } = await supabase.auth.getUser();
      
      if (error) {
        setTestResults(prev => ({
          ...prev,
          auth: {
            status: 'error',
            message: `Auth error: ${error.message}`,
            details: error
          }
        }));
        return;
      }

      setTestResults(prev => ({
        ...prev,
        auth: {
          status: 'success',
          message: `Authenticated as: ${data.user.email}`,
          user: data.user
        }
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        auth: {
          status: 'error',
          message: `Auth error: ${err.message}`,
          details: err
        }
      }));
    }
  };

  const testStorage = async () => {
    try {
      // List all buckets
      const { data, error } = await supabase.storage.listBuckets();
      
      if (error) {
        setTestResults(prev => ({
          ...prev,
          storage: {
            status: 'error',
            message: `Storage error: ${error.message}`,
            details: error
          }
        }));
        return;
      }
      
      setBuckets(data || []);

      // Check if avatars bucket exists
      const avatarBucket = data?.find(b => b.name === 'avatars');
      
      if (!avatarBucket) {
        setTestResults(prev => ({
          ...prev,
          storage: {
            status: 'warning',
            message: 'Avatars bucket not found. Create it in the Supabase dashboard.'
          }
        }));
        return;
      }

      // Check specific avatars bucket existence
      const { exists, error: bucketError } = await checkBucketExists('avatars');
      
      if (bucketError) {
        setTestResults(prev => ({
          ...prev,
          storage: {
            status: 'error',
            message: `Failed to check avatars bucket: ${bucketError.message}`,
            details: bucketError
          }
        }));
        return;
      }
      
      if (!exists) {
        setTestResults(prev => ({
          ...prev,
          storage: {
            status: 'warning',
            message: 'Avatars bucket exists but there might be permission issues.'
          }
        }));
        return;
      }

      setTestResults(prev => ({
        ...prev,
        storage: {
          status: 'success',
          message: `Found ${data.length} storage ${data.length === 1 ? 'bucket' : 'buckets'}, including 'avatars'`
        }
      }));
    } catch (err) {
      setTestResults(prev => ({
        ...prev,
        storage: {
          status: 'error',
          message: `Storage error: ${err.message}`,
          details: err
        }
      }));
    }
  };

  const viewBucketFiles = async (bucketName) => {
    setSelectedBucket(bucketName);
    
    try {
      const result = await listFiles(bucketName);
      if (result.success) {
        setFiles(result.files || []);
      } else {
        setFiles([]);
        console.error(`Error listing files in ${bucketName}:`, result.error);
      }
    } catch (err) {
      console.error(`Error listing files:`, err);
      setFiles([]);
    }
  };

  return (
    <div className="supabase-diagnostics">
      <h2>Supabase Diagnostics</h2>
      
      <div className="diagnostic-actions">
        <button 
          className="refresh-button" 
          onClick={runDiagnostics}
        >
          Refresh Tests
        </button>
      </div>

      <div className="test-results">
        {Object.entries(testResults).map(([key, result]) => (
          <div 
            key={key} 
            className={`test-result test-${result.status}`}
          >
            <h3>{key.charAt(0).toUpperCase() + key.slice(1)}</h3>
            <div className="status-indicator">
              {result.status === 'success' && '✅'}
              {result.status === 'error' && '❌'}
              {result.status === 'warning' && '⚠️'}
              {result.status === 'pending' && '⏳'}
            </div>
            <p>{result.message}</p>
            {result.details && (
              <pre className="error-details">
                {JSON.stringify(result.details, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>

      {testResults.storage.status === 'success' && (
        <div className="storage-explorer">
          <h3>Storage Buckets</h3>
          <div className="buckets-list">
            {buckets.map(bucket => (
              <div 
                key={bucket.id} 
                className={`bucket-item ${selectedBucket === bucket.name ? 'selected' : ''}`}
                onClick={() => viewBucketFiles(bucket.name)}
              >
                {bucket.name}
                {bucket.public ? ' (public)' : ' (private)'}
              </div>
            ))}
          </div>
          
          {selectedBucket && (
            <div className="files-list">
              <h4>{selectedBucket} Files</h4>
              {files.length === 0 ? (
                <p>No files found in this bucket</p>
              ) : (
                <ul>
                  {files.map((file, index) => (
                    <li key={index}>
                      {file.name}
                      {file.metadata && <span> ({Math.round(file.metadata.size / 1024)} KB)</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      )}

      <div className="troubleshooting">
        <h3>Troubleshooting Tips</h3>
        <ul>
          <li>Make sure your Supabase environment variables are correctly set in the <code>.env</code> file.</li>
          <li>Check if the avatars bucket exists in your Supabase project.</li>
          <li>Verify that you have enabled Row Level Security policies for storage.</li>
          <li>Ensure your RLS policies allow uploading to the avatars bucket.</li>
          <li>Check if your API key has the necessary permissions.</li>
        </ul>
      </div>
    </div>
  );
} 