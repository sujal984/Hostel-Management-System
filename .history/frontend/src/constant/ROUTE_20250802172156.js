import AcceptedApplication from "../components/Acceptedapplication";
import AdminDashboard from "../components/AdminDashboard";
import AdminLogin from "../components/AdminLogin";
import ApplicationForm from "../components/ApplicationForm";
import TrackStatus from "../components/TrackStatus";
import Temporary from "../components/Temporary";
import ApplicationDetail from "../components/ApplicationDetail";
import ForgotPassword from "../components/ForgotPassword";

export const ROUTES = {
  ApplicationForm: {
    path: "/",
    component: ApplicationForm,
    title: "Application Form",
    heading: "Application Form",
  },
  AdminLogin: {
    path: "/Admin/login",
    component: AdminLogin,
    title: "Admin Login",
    heading: "Admin Login",
    description: "Its a  admin login page",
  },
  ForgotPassword: {
    path: "/Admin/forgot",
    component: ForgotPassword,
    title: "Forgot Password",
  },
  Tracking: {
    path: "/User/Application/status",
    component: TrackStatus,
    title: "Application Tracking",
    heading: "Application Tracking",
  },

  Admin_Dashborad: {
    path: "/Admin/dashboard",
    component: AdminDashboard,
    title: "Admin Dashboard",
    heading: "Admin Dashboard",
  },
  Accepted_Applications: {
    path: "/Admin/accepted-applications",
    component: AcceptedApplication,
    title: "Accepted Applications",
    heading: "Accepted Applications",
  },
  Application_Detail: {
    path: `/Admin/Application/detail/:id`,
    component: ApplicationDetail,
    title: "Application Detail",
    heading: "Application Detail",
  },
  Temporary: {
    path: "/temporary",
    component: Temporary,
    title: "Temporary",
    heading: "Temporary",
  },
};
