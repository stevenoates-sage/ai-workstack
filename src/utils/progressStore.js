const STORAGE_KEY = 'ai-workstack-learning-progress-v1';

const safeRead = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const safeWrite = (value) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    // Ignore write errors (private mode/quota).
  }
};

export const getUserKey = (currentUser) =>
  (currentUser?.email || currentUser?.username || 'anonymous').toLowerCase();

export const getGuideProgress = (currentUser, guideId) => {
  const store = safeRead();
  const userKey = getUserKey(currentUser);
  return store[userKey]?.[guideId] || null;
};

export const setGuideProgress = (currentUser, guideId, progress) => {
  const store = safeRead();
  const userKey = getUserKey(currentUser);

  if (!store[userKey]) {
    store[userKey] = {};
  }

  store[userKey][guideId] = {
    ...store[userKey][guideId],
    ...progress,
    updatedAt: new Date().toISOString(),
  };

  safeWrite(store);
  return store[userKey][guideId];
};

export const getAllGuideProgressForUser = (currentUser) => {
  const store = safeRead();
  const userKey = getUserKey(currentUser);
  return store[userKey] || {};
};
