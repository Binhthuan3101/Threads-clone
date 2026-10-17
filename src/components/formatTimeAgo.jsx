export function formatTimeAgo(createdAt) {
  const postDate = new Date(createdAt);
  const now = new Date();
  const diffInMs = now - postDate;

  if (diffInMs < 0 || isNaN(diffInMs)) return "Vừa xong";

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInWeeks = Math.floor(diffInDays / 7);
  const diffInMonths =
    (now.getFullYear() - postDate.getFullYear()) * 12 +
    (now.getMonth() - postDate.getMonth());
  const diffInYears = now.getFullYear() - postDate.getFullYear();

  if (diffInSeconds < 60) {
    return "Vừa xong";
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else if (diffInWeeks < 4) {
    return `${diffInWeeks} tuần trước`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} tháng trước`;
  } else {
    return `${diffInYears} năm trước`;
  }
}
