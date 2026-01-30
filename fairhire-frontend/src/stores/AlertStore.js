import { defineStore } from "pinia";

export const useAlertStore = defineStore('AlertStore', {
  state: () => ({
    showPrompt: false,
    showLoader: false,
    isAlertStatusSuccess: true,
    alertMessage: '',
  }),
  actions: {
    showAlert(message, isAlertStatusSuccess, delay) {
      if (delay) {
        setTimeout(() => {
          this.showPrompt = false
        }, delay)
      }
      this.showPrompt = true
      this.alertMessage = message || 'Some error ocurred, please try again later.'
      this.isAlertStatusSuccess = isAlertStatusSuccess
    },
    setShowLoader(value) {
      this.showLoader = value
    }
  }
})
