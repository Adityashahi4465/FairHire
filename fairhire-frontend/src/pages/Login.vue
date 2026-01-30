<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api/api";
import PrimaryButton from "../components/primary-button/primary-button.vue";
import TextField from "../components/text-field.vue";
import DropDown from "../components/drop-down.vue";
const router = useRouter();

const name = ref("");
const email = ref("");
const role = ref("candidate"); // default
const bgColor = computed(() => "black");

const login = async () => {
  try {
    const res = await api.post("/auth/login", {
      name: name.value,
      email: email.value,
      role: role.value,
    });

    const user = res.data.user;

    // ✅ Store session
    sessionStorage.setItem("user_id", user.id);
    sessionStorage.setItem("role", user.role);

    // ✅ Redirect based on role
    if (user.role === "candidate") {
      router.push("/");
    } else {
      router.push("/recruiter");
    }
  } catch (err) {
    alert("Login failed");
    console.error(err);
  }
};
</script>

<template>
  <div
    class="h-full w-full transition-all duration-500 ease-in-out flex items-center justify-center bg-white"
  >
    <h2>Login</h2>

    <TextField
      placeholder="Full Name"
      v-model:value="name"
      :isEnabled="true"
      name="full_name"
    ></TextField>
    <TextField
      placeholder="Email Address"
      v-model:value="email"
      :isEnabled="true"
      name="email"
    ></TextField>

    <DropDown
      placeholder="Role"
      class="w-[260px]"
      :color="bgColor"
      :required="true"
      v-model="role"
      name="role"
      :options="['Candidate', 'Recruiter']"
    />

    <PrimaryButton value="Login" @action="() => login()" />
  </div>
</template>
