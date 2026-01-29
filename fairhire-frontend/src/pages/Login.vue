<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const loginAsCandidate = () => {
  sessionStorage.setItem("role", "candidate");
  router.push("/");
};

const loginAsRecruiter = () => {
  sessionStorage.setItem("role", "recruiter");
  router.push("/recruiter");
};
</script>

<template>
  <div class="page">
    <h1>Login</h1>

    <button @click="loginAsCandidate">Login as Candidate</button>
    <button @click="loginAsRecruiter">Login as Recruiter</button>
  </div>
</template>

<style scoped>
.page {
  padding: 24px;
}
button {
  margin-right: 12px;
}
</style>
