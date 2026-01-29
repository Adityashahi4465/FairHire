import { createRouter, createWebHistory } from "vue-router";

// Pages
import Login from "../pages/Login.vue";
import InterviewSetup from "../pages/InterviewSetup.vue";
import InterviewSession from "../pages/InterviewSession.vue";
import CandidateFeedback from "../pages/CandidateFeedback.vue";
import RecruiterSummary from "../pages/RecruiterSummary.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
  },

  // Candidate flow
  {
    path: "/",
    name: "InterviewSetup",
    component: InterviewSetup,
    meta: { role: "candidate", layout: "candidate" },
  },
  {
    path: "/interview",
    name: "InterviewSession",
    component: InterviewSession,
    meta: { role: "candidate", layout: "candidate" },
  },
  {
    path: "/feedback",
    name: "CandidateFeedback",
    component: CandidateFeedback,
    meta: { role: "candidate", layout: "candidate" },
  },

  // Recruiter flow
  {
    path: "/recruiter",
    name: "RecruiterSummary",
    component: RecruiterSummary,
    meta: { role: "recruiter", layout: "recruiter" },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

/* -------- SIMPLE AUTH GUARD -------- */
router.beforeEach((to, from, next) => {
  const role = sessionStorage.getItem("role");

  // Allow login page always
  if (to.path === "/login") {
    return next();
  }

  // If not logged in → go to login
  if (!role) {
    return next("/login");
  }

  // If role mismatch → block
  if (to.meta.role && to.meta.role !== role) {
    return next("/login");
  }

  next();
});

export default router;
