import firebaseConfig from '../../firebase-applet-config.json';

declare global {
  interface Window {
    google?: any;
  }
}

export interface GoogleUserProfile {
  name: string;
  email: string;
  picture?: string;
}

export function loadGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existingScript = document.getElementById('google-gsi-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (e) => reject(e));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-script';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

export function requestGoogleDriveAccessToken(): Promise<{ accessToken: string; profile?: GoogleUserProfile }> {
  return new Promise(async (resolve, reject) => {
    try {
      await loadGsiScript();

      if (!window.google?.accounts?.oauth2) {
        throw new Error('Google Identity Services library unavailable');
      }

      const clientId = (firebaseConfig as Record<string, any>).oAuthClientId;
      if (!clientId) {
        throw new Error('OAuth Client ID is missing from configuration');
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email',
        callback: async (response: any) => {
          if (response.error) {
            reject(new Error(response.error_description || response.error || 'Google auth error'));
            return;
          }
          if (response.access_token) {
            let profile: GoogleUserProfile | undefined;
            try {
              const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                headers: { Authorization: `Bearer ${response.access_token}` },
              });
              if (userRes.ok) {
                profile = await userRes.json();
              }
            } catch (e) {
              console.warn('Failed to fetch user profile:', e);
            }
            resolve({ accessToken: response.access_token, profile });
          } else {
            reject(new Error('No access token received from Google OAuth'));
          }
        },
        onerror: (err: any) => {
          reject(err);
        },
      });

      tokenClient.requestAccessToken({ prompt: 'consent' });
    } catch (err) {
      reject(err);
    }
  });
}
