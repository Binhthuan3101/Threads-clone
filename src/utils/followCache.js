const KEY = "followed_ids";

export function getFollowedIds() {
  try {
    return new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
  } catch {
    return new Set();
  }
}

export function setFollowed(id, on) {
  if (id == null) return;
  const s = getFollowedIds();
  if (on) s.add(String(id));
  else s.delete(String(id));
  localStorage.setItem(KEY, JSON.stringify([...s]));
}

export function isFollowedCached(id) {
  if (id == null) return false;
  return getFollowedIds().has(String(id));
}