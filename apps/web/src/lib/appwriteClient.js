const configuredEndpoint = import.meta.env.VITE_APPWRITE_ENDPOINT || '';
const endpoint = configuredEndpoint.replace(/\/+$/, '');
const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID || '';
const databaseId = import.meta.env.VITE_APPWRITE_DATABASE_ID || '';
const adminTeamId = import.meta.env.VITE_APPWRITE_ADMIN_TEAM_ID || '';

export const appwriteEnabled = Boolean(endpoint && projectId && databaseId);
export const appwriteConfig = {
  endpoint,
  projectId,
  databaseId,
  productsTableId: import.meta.env.VITE_APPWRITE_PRODUCTS_TABLE_ID || 'products',
  collectionsTableId: import.meta.env.VITE_APPWRITE_COLLECTIONS_TABLE_ID || 'collections',
  bucketId: import.meta.env.VITE_APPWRITE_BUCKET_ID || 'product-images',
  adminTeamId,
};

export const appwriteRequest = async (path, options = {}) => {
  if (!appwriteEnabled) {
    throw new Error('Appwrite no está configurado.');
  }

  const headers = new Headers(options.headers || {});
  headers.set('X-Appwrite-Project', projectId);
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${endpoint}${path}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  const responseText = await response.text();
  let result = null;

  if (responseText) {
    try {
      result = JSON.parse(responseText);
    } catch (error) {
      throw new Error('Appwrite devolvió una respuesta que no es JSON.');
    }
  }

  if (!response.ok) {
    const error = new Error(result?.message || `Error de Appwrite (${response.status}).`);
    error.code = result?.code || response.status;
    throw error;
  }

  return result;
};

export const requireAdminTeam = () => {
  if (!adminTeamId) {
    throw new Error('Configura VITE_APPWRITE_ADMIN_TEAM_ID para habilitar cambios administrativos.');
  }
  return adminTeamId;
};

export const uploadAppwriteFile = async (file) => {
  const fileId = crypto.randomUUID();
  const path = `/storage/buckets/${encodeURIComponent(appwriteConfig.bucketId)}/files`;
  const chunkSize = 5 * 1024 * 1024;
  let result;

  if (file.size <= chunkSize) {
    const formData = new FormData();
    formData.append('fileId', fileId);
    formData.append('file', file);
    return appwriteRequest(path, { method: 'POST', body: formData });
  }

  for (let start = 0; start < file.size; start += chunkSize) {
    const end = Math.min(start + chunkSize, file.size);
    const formData = new FormData();
    if (start === 0) formData.append('fileId', fileId);
    formData.append('file', file.slice(start, end), file.name);
    result = await appwriteRequest(path, {
      method: 'POST',
      headers: {
        'Content-Range': `bytes ${start}-${end - 1}/${file.size}`,
        ...(start ? { 'X-Appwrite-ID': fileId } : {}),
      },
      body: formData,
    });
  }

  return result;
};
