<script setup>
import { colors } from '@ambitionui/theme'
import { defineProps } from 'vue'
defineProps({
  type: {
    type: String,
    default: 'button'
  },
  value: {
    type: String,
    required: true
  },
  icon: {
    type: Boolean,
    default: false
  },
  isEnabled: {
    type: Boolean,
    default: true
  },
  px: {
    type: String,
    default: '16px'
  },
  py: {
    type: String,
    default: '8px'
  },
  bgColor: {
    type: String,
    default: colors['ambition-fandango-color']
  },
  textColor: {
    type: String,
    default: 'white'
  },
  iconType: {
    type: String,
    default: 'Forward'
  },
  action: {
    type: Function,
    default: () => {
      return
    }
  }
})
</script>

<template>
  <button
    :type="type"
    :class="[
      'font-Poppins px-4 py-2 flex items-center justify-center rounded-[80px] border-2 w-full sm:w-auto',
      isEnabled
        ? 'cursor-pointer border-white'
        : 'bg-secondary-color border-secondary-color text-white',
      icon ? 'gap-2' : ''
    ]"
    :disabled="!isEnabled"
    :style="{
      backgroundColor: isEnabled ? bgColor : '',
      color: isEnabled ? textColor : '',
      paddingRight: `${px}`,
      paddingLeft: `${px}`,
      padding: `${py} ${px}`
    }"
    @click="$emit('action')"
  >
    <slot v-if="iconType === 'Backward'" name="icon"></slot>

    <span class="text-sm font-medium leading-[21px] whitespace-nowrap text-center">{{
      value
    }}</span>
    <slot v-if="iconType === 'Forward'" name="icon"></slot>
  </button>
</template>

<style scoped></style>
