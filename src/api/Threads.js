import { request } from "./axiosApi";

export const registerAccount = async (data) => {
  const res = await request.post("/auth/register", data, {
    headers: { "x-origin": window.location.origin },
  });
  return res.data;
};

export const login = async (login, password) => {
  const res = await request.post("/auth/login", {
    login,
    password,
  });

  return res.data;
};

export const refreshToken = async (refresh_token) => {
  const res = await request.post("/auth/refresh", {
    refresh_token,
  });

  return res.data;
};

export const validateUsername = async (username) => {
  const res = await request.post("/auth/validate/username", {
    username,
  });

  return res.data;
};

export const validateEmail = async (email) => {
  const res = await request.post("/auth/validate/email", {
    email,
  });

  return res.data;
};

export const forgotPassword = async (email) => {
  const res = await request.post(
    "/auth/forgot-password",
    {
      email,
    },
    {
      headers: {
        "x-origin": window.location.origin,
      },
    },
  );

  return res.data;
};

export const validateResetToken = async (token) => {
  const res = await request.get("/auth/reset-password/validate", {
    params: {
      token,
    },
  });

  return res.data;
};

export const resetPassword = async (data) => {
  const res = await request.post("/auth/reset-password", data);

  return res.data;
};

export const getUserInfo = async () => {
  const res = await request.get("/auth/user");

  return res.data;
};

export const logout = async () => {
  const res = await request.post("/auth/logout");

  return res.data;
};

export const verifyEmail = async (token) => {
  const res = await request.post("/auth/verify-email", {
    token,
  });

  return res.data;
};

export const resendVerificationEmail = async () => {
  const res = await request.post(
    "/auth/resend-verification-email",
    {},
    {
      headers: {
        "x-origin": window.location.origin,
      },
    },
  );

  return res.data;
};

export const deleteAccount = async () => {
  const res = await request.post("/auth/account", {
    _method: "DELETE",
  });

  return res.data;
};

export const getColumns = async () => {
  const res = await request.get("/auth/columns");

  return res.data;
};

export const updateColumns = async (columns) => {
  const res = await request.post("/auth/columns", {
    _method: "PUT",
    columns,
  });

  return res.data;
};

export const updateProfile = async (data) => {
  const res = await request.put("/auth/profile", data);
  return res.data;
};

export const getPost = async (type = "for_you", page, perPage) => {
  const res = await request.get("/posts/feed", {
    params: {
      type,
      page,
      per_page: perPage,
    },
  });

  return res.data;
};

export const getPostsByTopic = async (topicId, page = 1, perPage = 10) => {
  const res = await request.get("/posts/feed", {
    params: {
      topic_id: topicId,
      page,
      per_page: perPage,
    },
  });
  return res.data;
};
export const getSavedPosts = async (page = 1, perPage = 10) => {
  const res = await request.get("/posts/feed", {
    params: { type: "saved", page, per_page: perPage },
  });
  return res.data;
};

export const getSinglePost = async (id) => {
  const res = await request.get(`/posts/${id}`);

  return res.data;
};

export const createPost = async (formData) => {
  const res = await request.post("posts", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data || res;
};

export const updatePost = async (id, data) => {
  const res = await request.post(`/posts/${id}`, data);

  return res.data;
};

export const deletePost = async (id) => {
  const res = await request.post(`/posts/${id}`, {
    _method: "DELETE",
  });

  return res.data;
};

export const getReplies = async (id, page, perPage) => {
  const res = await request.get(`/posts/${id}/replies`, {
    params: {
      page,
      per_page: perPage,
    },
  });

  return res.data;
};

export const createReply = async (id, data) => {
  const res = await request.post(`/posts/${id}/reply`, data);

  return res.data;
};

export const getPendingReplies = async (id, page, perPage) => {
  const res = await request.get(`/posts/${id}/pending-replies`, {
    params: {
      page,
      per_page: perPage,
    },
  });

  return res.data;
};

export const approveReply = async (id, replyId) => {
  const res = await request.post(`/posts/${id}/replies/${replyId}/approve`);

  return res.data;
};

export const rejectReply = async (id, replyId) => {
  const res = await request.post(`/posts/${id}/replies/${replyId}/reject`);

  return res.data;
};

export const likePost = async (id) => {
  const res = await request.post(`/posts/${id}/like`);

  return res.data;
};

export const repostPost = async (id) => {
  const res = await request.post(`/posts/${id}/repost`);

  return res.data;
};

export const quotePost = async (id, data) => {
  const res = await request.post(`/posts/${id}/quote`, data);

  return res.data;
};

export const savePost = async (id) => {
  const res = await request.post(`/posts/${id}/save`);

  return res.data;
};

export const hidePost = async (id) => {
  const res = await request.post(`/posts/${id}/hide`);

  return res.data;
};

export const reportPost = async (id, reason, description) => {
  const res = await request.post(`/posts/${id}/report`, {
    reason,
    description,
  });

  return res.data;
};

export const muteUser = async (id) => {
  const res = await request.post(`/users/${id}/mute`);

  return res.data;
};

export const unmuteUser = async (id) => {
  const res = await request.post(`/users/${id}/mute`, {
    _method: "DELETE",
  });

  return res.data;
};

export const restrictUser = async (id) => {
  const res = await request.post(`/users/${id}/restrict`);

  return res.data;
};

export const unrestrictUser = async (id) => {
  const res = await request.post(`/users/${id}/restrict`, {
    _method: "DELETE",
  });

  return res.data;
};

export const blockUser = async (id) => {
  const res = await request.post(`/users/${id}/block`);

  return res.data;
};

export const unblockUser = async (id) => {
  const res = await request.post(`/users/${id}/block`, {
    _method: "DELETE",
  });

  return res.data;
};

export const followUser = async (id) => {
  const res = await request.post(`/users/${id}/follow`);

  return res.data;
};

export const unfollowUser = async (id) => {
  const res = await request.delete(`/users/${id}/follow`);

  return res.data;
};


export const getFollowers = async (id) => {
  const res = await request.get(`/users/${id}/followers`);

  return res.data;
};

export const getFollowings = async (id) => {
  const res = await request.get(`/users/${id}/followings`);

  return res.data;
};

export const search = async (q, page, perPageTopics, perPageUsers) => {
  const res = await request.get("/search", {
    params: {
      q,
      page,
      per_page_topics: perPageTopics,
      per_page_users: perPageUsers,
    },
  });

  return res.data;
};

export const searchTopics = async (q) => {
  const res = await request.get("/topics/search", {
    params: {
      q,
    },
  });

  return res.data;
};

export const getFollowSuggestions = async (page, perPage) => {
  const res = await request.get("/users/suggestions", {
    params: {
      page,
      per_page: perPage,
    },
  });

  return res.data;
};
export const getUserByUsername = async (username) => {
  const res = await request.get("/search", {
    params: {
      q: username,
      page: 1,
      users_per_page: 20,
      topics_per_page: 0,
    },
  });
  const data = res.data?.data || res.data;
  const users = data?.users || [];
  const found = users.find(
    (u) => u.username?.toLowerCase() === username.toLowerCase()
  );
  if (!found) {
    const err = new Error("User not found");
    err.response = { status: 404, data: { message: "User not found" } };
    throw err;
  }
  return { data: found };
};
export const getUserPosts = async (userId, page = 1, perPage = 10) => {
  // Thử feed; nếu API không lọc user_id, filter phía client
  const res = await request.get("/posts/feed", {
    params: { type: "for_you", page, per_page: perPage, user_id: userId },
  });
  const payload = res.data;
  const list = payload?.data || [];
  const filtered = list.filter((p) => String(p.user_id) === String(userId));
  return {
    data: filtered,
    pagination: payload?.pagination,
  };
};

export const getUserReposts = async (id, page, perPage) => {
  const res = await request.get(`/users/${id}/reposts`, {
    params: {
      page,
      per_page: perPage,
    },
  });

  return res.data;
};

export const uploadAvatar = async (file) => {
  const formData = new FormData();

  formData.append("avatar", file);

  const res = await request.post("/upload/avatar", formData);

  return res.data;
};

export const uploadMedia = async (files) => {
  if (!files || files.length === 0) {
    return { urls: [] };
  }

  const formData = new FormData();
  const fileArray = Array.from(files);

  fileArray.forEach((file) => {
    formData.append("media", file);
  });

  try {
    const res = await request.post("/upload/media", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    const data = res.data || res;
    const urls = data?.urls || data?.data || [];

    return { urls: Array.isArray(urls) ? urls : [] };
  } catch (error) {
    console.error(error);
    return { urls: [] };
  }
};
