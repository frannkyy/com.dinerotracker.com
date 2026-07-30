import React, { useEffect, useState } from 'react';
import { User } from 'firebase/auth';
import {
  initAuthListener,
  signInWithGoogle,
  logoutGoogle,
  getCachedAccessToken,
} from '../../services/firebaseAuth';
import { requestGoogleDriveAccessToken, GoogleUserProfile } from '../../services/googleAuthGsi';
import {
  uploadToGoogleDrive,
  listGoogleDriveBackups,
  downloadGoogleDriveFile,
  DriveFileItem,
} from '../../services/googleDriveService';
import { getStoredData } from '../../utils/storage';
import { shareJSONBackup, saveJSONWithPicker, downloadJSONBackup } from '../../utils/export';
import { useApp } from '../../context/AppContext';
import {
  Cloud,
  CloudUpload,
  CheckCircle2,
  Download,
  FileJson,
  Loader2,
  LogOut,
  RefreshCw,
  Share2,
  FolderDown,
} from 'lucide-react';

export const GoogleDriveBackup: React.FC = () => {
  const { showToast, restoreFromJSON } = useApp();
  const [currentUserProfile, setCurrentUserProfile] = useState<{ displayName: string; email: string; photoURL?: string } | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(false);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [isFetchingList, setIsFetchingList] = useState<boolean>(false);
  const [driveFiles, setDriveFiles] = useState<DriveFileItem[]>([]);
  const [restoringFileId, setRestoringFileId] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase Auth has an active user
    const unsubscribe = initAuthListener(
      (user, token) => {
        setCurrentUserProfile({
          displayName: user.displayName || user.email || 'Google User',
          email: user.email || '',
          photoURL: user.photoURL || undefined,
        });
        setAccessToken(token);
        fetchDriveFiles(token);
      },
      () => {
        // No firebase auth
      }
    );

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      setIsAuthLoading(true);
      setStatusMessage(null);

      // Primary approach: Google Identity Services (GIS) token client
      try {
        const { accessToken: token, profile } = await requestGoogleDriveAccessToken();
        setAccessToken(token);
        const name = profile?.name || profile?.email || 'Google User';
        const email = profile?.email || 'Connected Google Account';
        setCurrentUserProfile({ displayName: name, email, photoURL: profile?.picture });
        showToast(`Connected to Google Drive as ${name}`);
        await fetchDriveFiles(token);
        return;
      } catch (gsiErr: any) {
        console.warn('GIS Auth failed or skipped, trying Firebase Popup:', gsiErr);
      }

      // Secondary fallback: Firebase Auth popup
      const { user, accessToken: token } = await signInWithGoogle();
      setCurrentUserProfile({
        displayName: user.displayName || user.email || 'Google User',
        email: user.email || '',
        photoURL: user.photoURL || undefined,
      });
      setAccessToken(token);
      showToast(`Connected as ${user.displayName || user.email}`);
      await fetchDriveFiles(token);
    } catch (err: any) {
      console.error('Google Connect Error:', err);
      setStatusMessage('Direct Google Connect failed. You can still use "Share to Phone Apps" to save directly into Google Drive or Download folder!');
      showToast('Google Connect canceled or failed.');
    } finally {
      setIsAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutGoogle();
      setCurrentUserProfile(null);
      setAccessToken(null);
      setDriveFiles([]);
      setStatusMessage(null);
      showToast('Disconnected from Google Drive API.');
    } catch (err) {
      console.error(err);
    }
  };

  const fetchDriveFiles = async (tokenOverride?: string) => {
    const token = tokenOverride || accessToken || getCachedAccessToken();
    if (!token) return;

    try {
      setIsFetchingList(true);
      const files = await listGoogleDriveBackups(token);
      setDriveFiles(files);
    } catch (err: any) {
      console.error(err);
      setStatusMessage('Could not list Google Drive files. You can upload a new backup or use Android Share.');
    } finally {
      setIsFetchingList(false);
    }
  };

  const handleUploadBackup = async () => {
    const token = accessToken || getCachedAccessToken();
    if (!token) {
      showToast('Please connect your Google Account first or use Native Share.');
      return;
    }

    try {
      setIsUploading(true);
      setStatusMessage(null);
      const allData = getStoredData();
      const result = await uploadToGoogleDrive(token, allData);
      showToast(`Saved to Google Drive: ${result.name}`);
      setStatusMessage(`Backup successfully uploaded to Google Drive as "${result.name}"`);
      await fetchDriveFiles(token);
    } catch (err: any) {
      console.error(err);
      setStatusMessage(err.message || 'Google Drive upload error');
      showToast('Upload to Google Drive failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleShareSheet = async () => {
    const allData = getStoredData();
    const shared = await shareJSONBackup(allData);
    if (shared) {
      showToast('Opened Phone Share Sheet (Pick Google Drive or Downloads)!');
    } else {
      downloadJSONBackup(allData);
      showToast('Downloaded backup file directly.');
    }
  };

  const handleSaveToFolder = async () => {
    const allData = getStoredData();
    const saved = await saveJSONWithPicker(allData);
    if (saved) {
      showToast('Backup saved!');
    }
  };

  const handleRestoreDriveFile = async (file: DriveFileItem) => {
    const token = accessToken || getCachedAccessToken();
    if (!token) return;

    if (!window.confirm(`Restore database from Google Drive file "${file.name}"? This will overwrite existing local records.`)) {
      return;
    }

    try {
      setRestoringFileId(file.id);
      const backupData = await downloadGoogleDriveFile(token, file.id);
      if (!backupData || typeof backupData !== 'object') {
        throw new Error('Invalid JSON format received from Google Drive.');
      }

      restoreFromJSON(backupData);
      showToast('Successfully restored data from Google Drive!');
      setStatusMessage(`Restored database from ${file.name}`);
    } catch (err: any) {
      console.error(err);
      showToast('Failed to restore from Google Drive file.');
      setStatusMessage(err.message || 'Restore error');
    } finally {
      setRestoringFileId(null);
    }
  };

  return (
    <div className="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/80 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <Cloud size={20} />
          </div>
          <div>
            <h2 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <span>Google Drive Cloud Backup</span>
              <span className="text-[10px] font-extrabold uppercase tracking-wide bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">
                Google Cloud
              </span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Direct API sync or Android native share into your Google Drive
            </p>
          </div>
        </div>
      </div>

      {!currentUserProfile ? (
        <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 p-4 rounded-2xl space-y-3">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Connect your Google account to directly upload and retrieve backup files from Google Drive, or use Android Native Share to pick Google Drive from your phone apps.
          </p>

          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              onClick={handleSignIn}
              disabled={isAuthLoading}
              className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-98 font-bold text-xs text-white transition-all flex items-center justify-center gap-3 shadow-xs disabled:opacity-50"
            >
              {isAuthLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin text-white" />
                  <span>Connecting to Google Drive...</span>
                </>
              ) : (
                <>
                  <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5 shrink-0">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                    <path fill="none" d="M0 0h48v48H0z"></path>
                  </svg>
                  <span>Connect Google Drive</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareSheet}
              className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 font-bold text-xs text-white transition-all flex items-center justify-center gap-2 shadow-xs"
            >
              <Share2 size={16} />
              <span>Share to Google Drive App / Files</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* User Account Bar */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              {currentUserProfile.photoURL ? (
                <img
                  src={currentUserProfile.photoURL}
                  alt={currentUserProfile.displayName}
                  className="w-9 h-9 rounded-full border border-blue-300 dark:border-blue-700"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm">
                  {currentUserProfile.displayName[0].toUpperCase()}
                </div>
              )}
              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>{currentUserProfile.displayName}</span>
                  <CheckCircle2 size={14} className="text-emerald-500" />
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  {currentUserProfile.email}
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <LogOut size={14} />
              <span>Disconnect</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              onClick={handleUploadBackup}
              disabled={isUploading}
              className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Uploading to Drive...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={16} />
                  <span>Backup to Google Drive</span>
                </>
              )}
            </button>

            <button
              onClick={() => fetchDriveFiles()}
              disabled={isFetchingList}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isFetchingList ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Checking Drive...</span>
                </>
              ) : (
                <>
                  <RefreshCw size={16} />
                  <span>Refresh Drive Backups</span>
                </>
              )}
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleShareSheet}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <Share2 size={14} />
              <span>Android Share Sheet</span>
            </button>

            <button
              onClick={handleSaveToFolder}
              className="flex-1 p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all flex items-center justify-center gap-1.5"
            >
              <FolderDown size={14} />
              <span>Choose Device Folder</span>
            </button>
          </div>
        </div>
      )}

      {statusMessage && (
        <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {statusMessage}
        </div>
      )}

      {/* Google Drive Backups List */}
      {driveFiles.length > 0 && (
        <div className="space-y-2 pt-2">
          <h3 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center justify-between">
            <span>Backups Stored in Google Drive ({driveFiles.length})</span>
          </h3>

          <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
            {driveFiles.map((f) => (
              <div
                key={f.id}
                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <FileJson size={18} className="text-blue-500 shrink-0" />
                  <div className="truncate">
                    <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {f.name}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {new Date(f.createdTime).toLocaleString()}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleRestoreDriveFile(f)}
                  disabled={restoringFileId === f.id}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-[11px] transition-all shrink-0 flex items-center gap-1 disabled:opacity-50"
                >
                  {restoringFileId === f.id ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Download size={13} />
                  )}
                  <span>Restore</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

