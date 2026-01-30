import { defineStore } from 'pinia'
import Recorder from 'recordrtc'
export const useRecordingStore = defineStore('RecordingStore', {
  state: () => ({
    //video
    videoStream: null,
    videoRecorder: null,
    recordedVideo: null,
    recordedVideoUrl: null,
    isRecordingVideo: false,
    isCameraEnable: false,
    mp4RecordedVideo: null,
    videoPaused: false,
    //audio
    audioStream: null,
    audioRecorder: null,
    recordedAudio: null,
    recorderAudioUrl: null,
    isRecordingAudio: false,
    isMicroPhoneEnable: false,

    // proctoring video
    proctoringRecorder: null,
    proctoringRecordedVideo: null,
    isRecordingProctoringVideo: false,

    // Image
    image: null
  }),
  actions: {
    async getMediaPermission(type) {
      try {
        const newStream = await navigator.mediaDevices.getUserMedia({ [type]: true })

        if (type === 'video') {
          this.videoStream = newStream
          if (this.audioStream) {
            this.videoStream.addTrack(this.audioStream.getAudioTracks()[0])
          }
          this.createMediaRecorder('video')
        } else if (type === 'audio') {
          this.audioStream = newStream
          if (this.videoStream) {
            this.videoStream.addTrack(this.audioStream.getAudioTracks()[0])
          }
          this.createMediaRecorder('audio')
        }
      } catch (error) {
        throw error
      }
    },
    async createMediaRecorder(type) {
      try {
        if (type === 'video') {
          this.videoRecorder = await Recorder(this.videoStream, {
            type: 'video',
            mimeType: 'video/mp4',
            recorderType: Recorder.MediaStreamRecorder
          })
        } else if (type === 'audio') {
          this.audioRecorder = Recorder(this.audioStream, {
            type: 'audio',
            mimeType: 'audio/wav',
            numberOfAudioChannels: 1,
            recorderType: Recorder.StereoAudioRecorder
          })
        }
      } catch (error) {
        throw error
      }
    },
    async startRecording(type) {
      try {
        if (type == 'video') {
          this.videoRecorder = null
          await this.getMediaPermission('video')
          await this.getMediaPermission('audio')
          await this.videoRecorder?.startRecording()
        } else if (type == 'audio') {
          this.audioRecorder = null
          await this.getMediaPermission('audio')
          await this.audioRecorder?.startRecording()
        }
      } catch (error) {
        throw error
      }
    },
    async resumeRecording(type) {
      try {
        if (type == 'video') {
          if (this.videoRecorder) {
            await this.videoRecorder?.resumeRecording()
          }
        }
        if (type == 'audio') {
          if (this.audioRecorder) {
            await this.audioRecorder?.resumeRecording()
          }
        }
      } catch (error) {
        throw error
      }
    },
    async pauseRecording(type) {
      try {
        if (type == 'video') {
          if (this.videoRecorder) {
            await this.videoRecorder?.pauseRecording()
          }
        }
        if (type == 'audio') {
          if (this.audioRecorder) {
            await this.audioRecorder?.pauseRecording()
          }
        }
      } catch (error) {
        throw error
      }
    },
    async stopRecording(type) {
      try {
        if (type == 'video') {
          if (this.videoRecorder) {
            await this.videoRecorder?.stopRecording(async () => {
              this.recordedVideo = await this.videoRecorder?.getBlob()
            })
          }
        }
        if (type == 'audio') {
          if (this.audioRecorder) {
            await this.audioRecorder?.stopRecording(() => {
              this.recordedAudio = this.audioRecorder?.getBlob()
            })
          }
        }
      } catch (error) {
        throw error
      }
    },
    async startProctoringRecording() {
      try {
        if (!this.videoStream) {
          await this.getMediaPermission('video')
        }
        if (!this.audioStream) {
          await this.getMediaPermission('audio')
        }
        this.proctoringRecorder = new Recorder(this.videoStream, {
          type: 'video',
          mimeType: 'video/webm',
          recorderType: Recorder.MediaStreamRecorder
        })
        this.proctoringRecorder.startRecording()
        this.isRecordingProctoringVideo = true
      } catch (error) {
        throw error
      }
    },
    async stopProctoringRecording() {
      try {
        if (this.proctoringRecorder) {
          await this.proctoringRecorder.stopRecording(() => {
            this.proctoringRecordedVideo = this.proctoringRecorder.getBlob()
          })
          this.isRecordingProctoringVideo =
            // Stop all tracks to release the stream
            this.proctoringStream?.getTracks()?.forEach((track) => track.stop())
          this.proctoringStream = null
        }
      } catch (error) {
        throw error
      }
    },
    downloadRecordedAudio() {
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style = 'display: none'
      a.href = this.recorderAudioUrl
      a.download = 'recorded_audio.webm'
      a.click()
      window.open(this.recordedAudio, '_blank')
    },
    async downloadRecordedVideo() {
      const a = document.createElement('a')
      document.body.appendChild(a)
      a.style = 'display: none'
      a.href = this.recordedVideoUrl
      a.download = 'recorded_video.webm'
      a.click()
      // window.open(this.recordedVideoUrl, '_blank')
    },
    async stopMedia(type) {
      try {
        if (type == 'video') {
          await this.stopRecording('video')
          if (this.videoStream) {
            this.videoStream?.getTracks()?.forEach((track) => {
              track.stop()
            })
            this.videoStream = null
          }
          this.isCameraEnable = false
        }
        if (type == 'audio') {
          await this.stopRecording('audio')
          if (this.audioStream) {
            this.audioStream?.getTracks()?.forEach((track) => {
              track.stop()
            })
            this.audioStream = null
          }
          this.isMicroPhoneEnable = false
        }
      } catch (error) {
        throw error
      }
    },
    async resetStore() {
      try {
        await this.stopMedia('video')
        await this.stopMedia('audio')
        if (this.isRecordingProctoringVideo) {
          await this.stopProctoringRecording()
        }
      } catch (error) {
        throw error
      } finally {
        // Reset video states
        this.videoStream = null
        this.videoRecorder = null
        this.recordedVideo = null
        this.recordedVideoUrl = null
        this.isRecordingVideo = false
        this.isCameraEnable = false

        // Reset audio states
        this.audioStream = null
        this.audioRecorder = null
        this.recordedAudio = null
        this.recorderAudioUrl = null
        this.isRecordingAudio = false
        this.isMicroPhoneEnable = false

        // Reset proctoring states
        this.proctoringRecorder = null
        this.proctoringRecordedVideo = null
        this.isRecordingProctoringVideo = false
      }
    }
  }
})
