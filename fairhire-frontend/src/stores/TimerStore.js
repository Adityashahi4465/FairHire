import { defineStore } from 'pinia'

export const useTimerStore = defineStore('timer', {
  state: () => ({
    startTime: null,
    elapsedTime: 0,
    timerInterval: null,
    duration: 0,
    isDurationComplete: false,
    isQuestionDurationComplete: false,
    pausedTime: 0
  }),

  actions: {
    async startTimer(duration) {
      this.duration = duration
      const storedStartTime = sessionStorage.getItem('timerStartTime')
      const storedElapsedTime = sessionStorage.getItem('pausedTime')

      if (storedStartTime) {
        this.startTime = parseInt(storedStartTime, 10)
        this.pausedTime = storedElapsedTime ? parseInt(storedElapsedTime, 10) : 0
      } else {
        this.startTime = new Date().getTime()
        sessionStorage.setItem('timerStartTime', this.startTime.toString())
        this.pausedTime = 0
      }

      this.timerInterval = setInterval(() => {
        this.elapsedTime = this.pausedTime + (new Date().getTime() - this.startTime)
      }, 1000)
    },

    pauseTimer() {
      if (!this.startTime || !this.timerInterval) {
        console.warn('Timer is not running, nothing to pause.')
        return
      }

      clearInterval(this.timerInterval)
      this.timerInterval = null
      this.pausedTime = this.elapsedTime
      sessionStorage.setItem('pausedTime', this.pausedTime.toString())
    },

    resumeTimer() {
      if (!this.startTime && this.pausedTime === 0) {
        console.warn('No timer to resume.')
        return
      }

      if (this.timerInterval) {
        console.warn('Timer is already running.')
        return
      }

      const storedPausedTime = sessionStorage.getItem('pausedTime')
      this.pausedTime = storedPausedTime ? parseInt(storedPausedTime, 10) : this.pausedTime

      this.startTime = new Date().getTime()
      this.timerInterval = setInterval(() => {
        this.elapsedTime = this.pausedTime + (new Date().getTime() - this.startTime)
      }, 1000)
    },

    async stopTimer() {
      this.isDurationComplete = false
      this.isQuestionDurationComplete = false
      this.elapsedTime = 0
      this.duration = 0
      this.startTime = null
      this.pausedTime = 0
      sessionStorage.removeItem('timerStartTime')
      sessionStorage.removeItem('pausedTime')
      clearInterval(this.timerInterval)
      this.timerInterval = null
    },

    async resetStore() {
      try {
        await this.stopTimer()
      } catch (error) {
        console.log(error)
      } finally {
        this.isDurationComplete = false
        this.isQuestionDurationComplete = false

        this.startTime = null
        this.elapsedTime = 0
        this.duration = 0
        this.timerInterval = null
        this.pausedTime = 0
      }
    }
  }
})
