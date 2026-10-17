import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n.use(initReactI18next).init({
  resources: {
    vi: {
      translation: {
        for_you: "Dành cho bạn",
        following: "Đang theo dõi",
        ghost_posts: "Bài viết ẩn danh",
        login_to_see_more: "Đăng nhập để xem thêm",
        reply_to: "Trả lời",
        post: "Đăng bài",
      },
    },
    en: {
      translation: {
        for_you: "For you",
        following: "Following",
        ghost_posts: "Ghost posts",
        login_to_see_more: "Log in to see more",
        reply_to: "Reply to",
        post: "Post",
      },
    },
  },
  lng: "vi",
  fallbackLng: "vi",
  interpolation: { escapeValue: false },
});

export default i18n;