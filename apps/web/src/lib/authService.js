import { appwriteEnabled, appwriteRequest } from './appwriteClient';

export const isAppwriteEnabled = () => appwriteEnabled;

export const getCurrentUser = async () => {
  if (!appwriteEnabled) return null;

  try {
    return await appwriteRequest('/account');
  } catch (error) {
    if (error.code === 401) return null;
    throw error;
  }
};

export const onAuthStateChange = (callback) => {
  if (!appwriteEnabled) {
    callback(null);
    return () => {};
  }

  let active = true;
  let previousUserId;
  const checkSession = async () => {
    try {
      const user = await getCurrentUser();
      const userId = user?.$id || null;
      if (active && userId !== previousUserId) {
        previousUserId = userId;
        callback(user);
      }
    } catch (error) {
      console.error('No se pudo comprobar la sesión de Appwrite.', error);
    }
  };

  checkSession();
  const intervalId = window.setInterval(checkSession, 30000);
  window.addEventListener('focus', checkSession);

  return () => {
    active = false;
    window.clearInterval(intervalId);
    window.removeEventListener('focus', checkSession);
  };
};

export const signIn = async ({ email, password }) => {
  if (!appwriteEnabled) {
    return { error: new Error('Appwrite no está configurado.') };
  }

  try {
    await appwriteRequest('/account/sessions/email', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    return { error: null };
  } catch (error) {
    return { error };
  }
};

export const signOut = async () => {
  if (!appwriteEnabled) return { error: null };

  try {
    await appwriteRequest('/account/sessions/current', { method: 'DELETE' });
    return { error: null };
  } catch (error) {
    return { error };
  }
};
