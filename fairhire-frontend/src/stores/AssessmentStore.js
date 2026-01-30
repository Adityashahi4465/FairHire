import { defineStore } from "pinia";
import axios from "axios";

baseurl = "http://127.0.0.1:8000";
export const useAssessmentStore = defineStore("AssessmentStore", {
  state: () => ({
    assessmentDetails: null,
    currentAssessmentDetails: null,
    assessmentsToBeCompleted: [],
    totalQuestions: 0,
    totalQuestionsAnswered: 0,

    // Active Assessment
    currentQuestion: 1,
    instructionPage: 1,
    getActiveAssessment: {},
    getQuestionsStatus: [],
    elapsedTime: 0,
    isAssessmentSubmitted: false,

    isManuallySubmitted: false,
    showLoader: false,
    showSubmitAssessmentLoader: false,
    isRecording: false,

    isLastQuestion: false,

    //Duration
    startTime: null,

    sampleAudio: null,
    sampleVideo: null,
  }),
  actions: {
    async getAssessmentByJobID(job_id, params = {}) {
      try {
        const res = await axios.get(`${baseurl}/${job_id}/assessments`, {
          params: params,
        });
        this.assessmentDetails = res?.data;
        return res?.data;
      } catch (error) {
        throw error;
      }
    },

    async getCandidateResponses(job_id, user_id) {
      try {
        const res = await axios.get(
          `candidate-jobs/${job_id}/result/${user_id}`,
          {},
        );
        return res?.data;
      } catch (error) {
        throw error;
      }
    },

    async submitOnewayAssessment(assessment_id, job_id, duration) {
      try {
        const res = await axios.post(
          `${assessment_id}/submit`,
          JSON.stringify(duration || this.elapsedTime),
          {
            params: {
              job_id: job_id,
            },
          },
        );
        return res?.data;
      } catch (error) {
        throw error;
      }
    },

    // resetStore() {
    //   this.job = null;
    //   this.assessements = [];
    //   this.assessmentDetails = null;
    //   this.currentAssessmentDetails = null;
    //   this.assessmentsToBeCompleted = [];
    //   this.totalQuestions = 0;
    //   this.totalQuestionsAnswered = 0;
    //   this.currentQuestion = 1;
    //   this.instructionPage = 1;
    //   this.getActiveAssessment = {};
    //   this.currentStage = null;
    //   this.getQuestionsStatus = [];
    //   this.elapsedTime = 0;
    //   this.isAssessmentSubmitted = false;
    //   this.notAllowBreaks = false;
    //   this.isManuallySubmitted = false;
    //   this.isLastQuestion = false;
    //   this.selectedOption = null;
    //   this.audioResponse = null;
    //   this.userInputFillUps = null;
    // },
    // partialResetStore() {
    //   this.currentQuestion = 1;
    //   this.currentStage = null;
    //   this.getQuestionsStatus = [];
    //   this.elapsedTime = 0;
    //   this.isAssessmentSubmitted = false;
    //   this.isManuallySubmitted = false;
    //   this.totalQuestionsAnswered = 0;
    //   this.totalQuestions = 0;
    //   this.isLastQuestion = false;
    //   this.selectedOption = null;
    //   this.audioResponse = null;
    //   this.userInputFillUps = null;
    // },
  },
});
