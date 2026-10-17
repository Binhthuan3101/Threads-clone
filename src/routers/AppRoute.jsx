import { Route, Routes } from "react-router";
import DefaultLayout from "../layouts/DefaultLayout";
import Home from "../pages/HomePage/Home";
import Messenger from "../pages/Messenger";
import Active from "../pages/Active";
import Search from "../pages/SearchPage";
import NotFoundPage from "../pages/NotFoundPage";
import Save from "../pages/Save";
import AuthLayout from "@/layouts/AuthLayout";
import Register from "@/pages/Auth/Register";
import Login from "@/pages/Auth/Login";
import ResetPassword from "@/pages/Auth/ResetPassword";
import ForgotPassword from "@/pages/Auth/ForgotPassword";
import VerifyEmail from "@/pages/Auth/VerifyEmail";
import EmbedLayout from "@/layouts/EmbedLayout";
import Embed from "@/pages/Embed";
import AccountUser from "../pages/AccountUser";
import Profile from "@/pages/Profile";
import TopicPage from "@/pages/TopicPage";
import Analytics from "@/pages/Analytics";
import PostDetail from "@/pages/PostDetail";
import UpdateProfile from "@/pages/updateProfile";

export default function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<DefaultLayout />}>
        <Route index element={<Home />} />
        <Route path="search" element={<Search />} />
        <Route path="messenger" element={<Messenger />} />
        <Route path="active" element={<Active />} />
        <Route path="account" element={<AccountUser />} />
        <Route path="update-profile" element={<UpdateProfile />} />
        <Route path="saved" element={<Save />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="topic/:topicId" element={<TopicPage />} />
        <Route path=":username/post/:postId" element={<PostDetail />} />
        <Route path=":username" element={<Profile />} />
      </Route>
      <Route path="/" element={<AuthLayout />}>
        <Route path="register" element={<Register />} />
        <Route path="login" element={<Login />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="verify-email" element={<VerifyEmail />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
      <Route path="/:username/post/:postId/embed" element={<EmbedLayout />}>
        <Route index element={<Embed />} />
      </Route>
    </Routes>
  );
}
