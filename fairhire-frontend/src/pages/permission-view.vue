<script setup>
import { watch, computed, onMounted } from 'vue'
import { LeftBigArrow, RightNarrowArrow, CameraIcon, MicroPhoneIcon } from '@ambitionui/icons'
import { Buttons, QuizInputs } from '@ambitionui/ui'
import { JobsDashboard } from '@/layouts'
import { PermissionWrap } from '@ambitionui/wrappers'
import { useAssessmentStore } from '@/stores/AssessmentStore'
import { useCompanyStore } from '@/stores/Recuriter/CompanyStore'
import { useRecordingStore } from '@/stores/RecordingStore'
import { useRoute } from 'vue-router'
const RecordingStore = useRecordingStore()
const AssessmentStore = useAssessmentStore()
const CompanyStore = useCompanyStore()
const route = useRoute()
//------------------------------------------------ Computed ----------------------------------------------//
const companyData = computed(() => CompanyStore.companyDetails)
const textColor = computed(() => companyData?.value?.text_color || '#FFFFFF')
const bgColor = computed(() => companyData?.value?.background_color || '#7D4996')
const is_permission_required = computed(() => {
  const permission_assessments = ['oneway', 'english', 'multilingual']

  return (
    route?.query?.is_proctoring_enabled === 'true' ||
    route?.query?.is_kyc_verification_enabled === 'true' ||
    permission_assessments.includes(route?.params?.type?.toLowerCase())
  )
})
const is_take_sample = route.query?.is_take_sample === 'true' ? true : false
const show_assessment_instruction =
  route.query?.show_assessment_instruction === 'true' ? true : false
//------------------------------------------------ Methods ----------------------------------------------//
const handleNextPage = () => {
  if (is_take_sample) {
    AssessmentStore.setInstructionPage(2)
  } else if (show_assessment_instruction) {
    AssessmentStore.setInstructionPage(4)
  } else {
    AssessmentStore.setInstructionPage(5)
  }
}

//------------------------------------------------ Watchers ----------------------------------------------//
watch(
  () => RecordingStore.isCameraEnable,
  () => {
    if (is_permission_required.value) {
      if (RecordingStore.isCameraEnable) {
        RecordingStore.getMediaPermission('video')
      } else if (!RecordingStore.isCameraEnable) {
        RecordingStore.stopMedia('video')
      }
    }
  }
)

watch(
  () => RecordingStore.isMicroPhoneEnable,
  () => {
    if (RecordingStore.isMicroPhoneEnable) {
      RecordingStore.getMediaPermission('audio')
    } else if (!RecordingStore.isMicroPhoneEnable) {
      RecordingStore.stopMedia('audio')
    }
  }
)

//------------------------------------------------ Lifecycle Hooks ----------------------------------------------//
onMounted(() => {
  if (AssessmentStore.notAllowBreaks || !is_permission_required.value) {
    AssessmentStore.setInstructionPage(4)
  }
})
</script>

<template>
  <JobsDashboard>
    <template #main-content>
      <div class="flex flex-col gap-9 px-6 sm:px-12 max-w-[1135px] mt-12 m-auto">
        <!-- Permission Part -->
        <div class="flex flex-col w-full gap-9 mt-auto">
          <div class="flex gap-4 items-center">
            <LeftBigArrow
              v-if="!AssessmentStore.notAllowBreaks"
              class="cursor-pointer"
              @click="() => $router.push({ name: 'CandidateDashboardView' })"
            />
            <h2 class="text-onbackground-color text-sm sm:text-xl sm:font-medium">Permissions</h2>
          </div>
          <p class="text-sm leading-[21px] md:text-base font-medium text-onbackground-color">
            Your audio and video will be recorded for the proctoring purpose. Kindly grant the
            following permissions to start:
          </p>
          <div class="flex flex-col lg:flex-row gap-6 w-full">
            <!-- camera permission button -->
            <!-- {{ RecordingStore.isCameraEnable }} -->
            <PermissionWrap
              value="Camera"
              v-model:isEnable="RecordingStore.isCameraEnable"
              class="lg:w-1/2"
              :bgColor="bgColor"
              :textColor="textColor"
            >
              <template #icon>
                <CameraIcon :color="RecordingStore.isCameraEnable ? bgColor : '#858585'" />
              </template>
            </PermissionWrap>
            <!-- mic permission button -->
            <PermissionWrap
              value="Mic"
              v-model:isEnable="RecordingStore.isMicroPhoneEnable"
              class="lg:w-1/2"
              :bgColor="bgColor"
              :textColor="textColor"
            >
              <template #icon>
                <MicroPhoneIcon :color="RecordingStore.isMicroPhoneEnable ? bgColor : '#858585'" />
              </template>
            </PermissionWrap>
          </div>
          <!--   :isEnabled="isMicroPhoneEnable && isCameraEnable && videoStream && audioStream" -->
          <div class="flex justify-end">
            <Buttons.Primary
              value="Proceed"
              :icon="true"
              :bgColor="bgColor"
              :textColor="textColor"
              :isEnabled="
                RecordingStore.isMicroPhoneEnable &&
                RecordingStore.isCameraEnable &&
                RecordingStore.videoStream &&
                RecordingStore.audioStream
              "
              @action="handleNextPage"
            >
              <template #icon>
                <RightNarrowArrow :color="textColor" />
              </template>
            </Buttons.Primary>
          </div>
        </div>
        <!-- Recorder Part -->
        <div v-show="false" class="flex gap-6 w-full">
          <div class="flex flex-col">
            <!-- Video element for live recording -->
            <!-- Muted, to prevent echoing while recording -->
            <video
              width="320"
              height="240"
              :srcObject="RecordingStore.videoStream"
              autoplay
              muted
            ></video>
            <!-- <audio width="320" height="240" :src="RecordingStore.audioStream" controls></audio> -->
            <div class="flex gap-4 mt-4">
              <Buttons.Primary
                value="Start Recording"
                :icon="true"
                :color="bgColor"
                @action="
                  () => {
                    RecordingStore.startRecording('video')
                  }
                "
              >
                <!-- :disabled="!isCameraEnable || videoRecorder?.state !== 'inactive'" -->
                <template #icon>
                  <RightNarrowArrow :color="textColor" />
                </template>
              </Buttons.Primary>
              <Buttons.Secondary
                value="Stop"
                :icon="true"
                :color="bgColor"
                @action="() => RecordingStore.stopRecording('video')"
              >
                <!-- :disabled="!isRecordingVideo" -->
                <template #icon>
                  <RightNarrowArrow :color="textColor" />
                </template>
              </Buttons.Secondary>
              <!-- download button -->
              <Buttons.Primary
                v-if="RecordingStore.recordedAudio"
                value="Download"
                :icon="true"
                :color="bgColor"
                @action="RecordingStore.downloadRecordedVideo"
              >
                <template #icon>
                  <RightNarrowArrow :color="textColor" />
                </template>
              </Buttons.Primary>
            </div>
          </div>
          <div class="flex flex-col">
            <!-- Video element for playback after recording stops -->
            <video
              v-if="RecordingStore.recordedVideo"
              width="320"
              height="240"
              :src="RecordingStore.recordedVideo"
              controls
            ></video>
            <!-- <audio width="320" height="240" :src="RecordingStore.recordedAudio" controls></audio> -->
          </div>
        </div>
      </div>
    </template>
  </JobsDashboard>
</template>

<style scoped></style>
