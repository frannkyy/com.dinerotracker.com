export interface DriveFileItem {
  id: string;
  name: string;
  createdTime: string;
  size?: string;
}

export async function uploadToGoogleDrive(
  accessToken: string,
  jsonData: object,
  customFilename?: string
): Promise<{ id: string; name: string }> {
  const dateStr = new Date().toISOString().slice(0, 10);
  const name = customFilename || `Dinero_Backup_${dateStr}.json`;
  const fileContent = JSON.stringify(jsonData, null, 2);

  const metadata = {
    name: name,
    mimeType: 'application/json',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', new Blob([fileContent], { type: 'application/json' }));

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to upload backup to Google Drive (HTTP ${res.status})`
    );
  }

  return await res.json();
}

export async function listGoogleDriveBackups(accessToken: string): Promise<DriveFileItem[]> {
  const query = encodeURIComponent("name contains 'Dinero' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,createdTime,size)&orderBy=createdTime desc`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Failed to fetch backups from Google Drive (HTTP ${res.status})`
    );
  }

  const data = await res.json();
  return data.files || [];
}

export async function downloadGoogleDriveFile(accessToken: string, fileId: string): Promise<any> {
  const url = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to download backup content from Google Drive (HTTP ${res.status})`);
  }

  return await res.json();
}
