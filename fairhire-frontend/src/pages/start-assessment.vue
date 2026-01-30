<script setup>
import { LeftBigArrow, RightNarrowArrow } from "@ambitionui/icons";
import { Buttons, Loader } from "@ambitionui/ui";
import { JobsDashboard } from "@/layouts";
import { useAssessmentStore } from "@/stores/AssessmentStore";
import { reactive, computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useRecordingStore } from "@/stores/RecordingStore";
import { useAuthStore } from "@/stores/AuthStore";
import { useAlertStore } from "@/stores/AlertStore";
import { useCompanyStore } from "@/stores/Recuriter/CompanyStore";
import { captureImageFromVideo } from "@/utils/functions/proctoring/image-capture";
import * as faceApi from "face-api.js";
import getNetworkSpeed from "@/utils/functions/get-network-speed";
//------------------------------------ Store -----------------------------------------------//
const RecordingStore = useRecordingStore();
const AlertStore = useAlertStore();
const AuthStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const AssessmentStore = useAssessmentStore();
const CompanyStore = useCompanyStore();
const networkSpeed = ref(1);

//------------------------------------ Computed -----------------------------------------------//
const companyData = computed(() => CompanyStore.companyDetails);
const textColor = computed(() => companyData?.value?.text_color || "#FFFFFF");
const bgColor = computed(
  () => companyData?.value?.background_color || "#7D4996",
);
const allow_another_round = computed(
  () => route.query?.allow_another_round || false,
);
const networkSpeedThreshold = computed(() => {
  return companyData.value?.workflow?.min_network_speed_allowded || 2; // Default to 2 mb/s if not set
});
const is_network_speed_test = computed(
  () => CompanyStore.is_network_speed_test ?? true,
);
const isProctoringEnabled = computed(
  () => route?.query?.is_proctoring_enabled === "true" || false,
);
const is_permission_required = computed(() => {
  const permission_assessments = ["oneway", "english", "multilingual"];
  return (
    isProctoringEnabled.value ||
    route?.query?.is_kyc_verification_enabled === "true" ||
    permission_assessments.includes(route?.params?.type?.toLowerCase())
  );
});
//------------------------------------ Refs -----------------------------------------------//
const data = reactive({
  showConfirmationModal: false,
  confirmationMessage: "",
});
const userAgent = ref(navigator.userAgent);
const isProctoringError = ref(false);
const videoRef = ref(null);
const timer = ref(null);
const networkTimer = ref(null);
//------------------------------------ Methods -----------------------------------------------//

//function to detect if an ios device
function isIOS() {
  return /iPhone|iPad|iPod/.test(userAgent.value);
}

//function to start the assessment
const handleStartAssessment = async () => {
  try {
    AlertStore.showLoader = true;
    AssessmentStore.isAssessmentSubmitted = false;
    const type = route.params.type;
    const assessmentId = route.params.assessmentId;
    if (companyData.value?.workflow?.kyc_verification) {
      let imageUrl = await captureImageFromVideo(videoRef.value, "url");
      imageUrl = imageUrl.split(",")[1];
      await AuthStore.uploadSelfie(imageUrl);
    }

    const query = {
      params: {
        assessmentId: assessmentId,
      },
      query: {
        language: route.query?.language || "english",
        is_proctoring_enabled: route?.query?.is_proctoring_enabled || false,
        is_kyc_verification_enabled:
          route?.query?.is_kyc_verification_enabled || false,
        show_assessment_instruction:
          route.query?.show_assessment_instruction || "true",
      },
    };
    if (type == "multilingual") {
      query.query.multilingual_assessment_language =
        AssessmentStore.multilingualAssessmentLanguage?.toLowerCase() ||
        "english";
    }

    if (type == "functional") {
      router.push({
        name: "CandidateFunctionalAssessmentView",
        ...query,
      });
    } else if (type == "english") {
      router.push({
        name: "CandidateEnglishAssessmentView",
        ...query,
      });
    } else if (type == "multilingual") {
      router.push({
        name: "CandidateMultilingualAssessmentView",
        ...query,
      });
    } else if (type == "ctq") {
      router.push({
        name: "CandidateCTQAssessmentView",
        ...query,
      });
    } else if (type == "psychometric") {
      router.push({
        name: "CandidatePsychometricAssessmentView",
        ...query,
      });
    } else if (type == "coding" || type == "algorise") {
      router.push({
        name: "CandidateAlgoriseAssessmentView",
        ...query,
      });
    } else if (type == "typing") {
      router.push({
        name: "CandidateTypingAssessmentView",
        ...query,
      });
    } else if (type == "excel") {
      router.push({
        name: "CandidateExcelAssessmentView",
        ...query,
      });
    } else if (type == "oneway") {
      await CompanyStore.onewayCreditDeduction(
        AssessmentStore.job?.proctoring_settings?.is_enabled,
        AssessmentStore.job?.proctoring_settings?.proctoring_type,
        assessmentId,
        route.params.jobId,
        allow_another_round.value,
      );
      router.push({
        name: "CandidateOnewayAssessmentView",
        ...query,
      });
    }
  } catch (error) {
    console.log(error);
    AlertStore.showAlert(
      error?.response?.data?.detail || "An error occurred while starting.",
      false,
      10000,
    );
  } finally {
    AlertStore.showLoader = false;
  }
};

const handleGoBack = () => {
  if (route.query?.show_assessment_instruction === "false") {
    router.push({
      name: "beginInstruction",
      query: {
        jobId: route.params.jobId,
        assessmentId: route.params.assessmentId,
        type: route.params.type,
      },
    });
  } else {
    AssessmentStore.setInstructionPage(AssessmentStore.instructionPage - 1);
  }
};

async function updateNetworkSpeed() {
  try {
    // if (is_network_speed_test.value) {
    //   return
    // }
    // is_network_speed_test.value = true
    const speed = await getNetworkSpeed();
    if (networkSpeed.value !== speed) {
      networkSpeed.value = speed;
    }
  } catch (err) {
    networkSpeed.value = 0;
  } finally {
    // is_network_speed_test.value = false
  }
}

function getColorForSpeed(speed) {
  if (speed <= 2) return "#D22222"; // Red
  if (speed <= 5) return "#FFBF58"; //  Yellow
  return "#049942"; // Solid Green
}

const isButtonEnabled = computed(() => {
  if (!isProctoringError.value) {
    if (
      is_network_speed_test.value === true &&
      networkSpeed.value > networkSpeedThreshold.value
    )
      return true;
    else if (!is_network_speed_test.value) return true;
  }
  return false;
});

//------------------------------------ Watchers -----------------------------------------------//
watch(
  companyData,
  () => {
    if (is_permission_required.value) {
      RecordingStore.getMediaPermission("video");
    }
  },
  {
    immediate: true,
  },
);

//------------------------------------ Life cycle hooks -------------------------------------//
onMounted(async () => {
  if (isProctoringEnabled.value) {
    await faceApi.nets.tinyFaceDetector.loadFromUri("/models");
    const FACE_CHECK_INTERVAL = 1000; // ms
    timer.value = setInterval(async () => {
      const video = videoRef.value;
      if (!video) {
        return;
      }

      // Detect faces
      const detections = await faceApi.detectAllFaces(
        video,
        new faceApi.TinyFaceDetectorOptions(),
      );
      if (detections.length === 1) {
        isProctoringError.value = false;
      } else {
        isProctoringError.value = true;
      }
    }, FACE_CHECK_INTERVAL); // Run detection every 100ms
  }

  if (is_network_speed_test.value) {
    await updateNetworkSpeed();
    // Start interval
    networkTimer.value = setInterval(async () => {
      await updateNetworkSpeed();
    }, 30000);
  }
});

watch(
  is_network_speed_test,
  async () => {
    console.log(is_network_speed_test.value);
    if (is_network_speed_test.value) {
      await updateNetworkSpeed();
      // Start interval
      networkTimer.value = setInterval(async () => {
        await updateNetworkSpeed();
      }, 30000);
    }
  },
  { immediate: true },
);

onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value);
  }
  if (networkTimer.value) {
    clearInterval(networkTimer.value);
  }
});

watch(
  () => RecordingStore.videoStream,
  (newValue) => {
    if (newValue && videoRef.value) {
      videoRef.value.srcObject = newValue;
    }
  },
);
</script>

<template>
  <JobsDashboard>
    <template #main-content>
      <Loader
        v-model:show="AlertStore.showLoader"
        message="Please wait while processing."
      />
      <div
        class="flex flex-col gap-9 px-6 md:px-12 max-w-[1135px] mt-12 m-auto"
      >
        <div class="flex gap-4 items-center w-full">
          <LeftBigArrow class="cursor-pointer" @click="handleGoBack" />
          <h2 class="text-onbackground-color text-sm md:text-xl font-medium">
            You are about to start
          </h2>
        </div>
        <div
          class="flex flex-col items-center justify-center"
          v-if="RecordingStore?.videoStream"
        >
          <div class="rounded-lg overflow-hidden">
            <video
              playsinline
              :srcObject="RecordingStore.videoStream"
              height="300px"
              :class="[
                isProctoringEnabled
                  ? isProctoringError
                    ? 'border-[#D22222] border-[4px]'
                    : 'border-[#00B300] border-[4px]'
                  : '',
              ]"
              ref="videoRef"
              width="400px"
              autoplay
              muted
            ></video>
          </div>
        </div>
      </div>
    </template>
  </JobsDashboard>
</template>

<style scoped></style>
