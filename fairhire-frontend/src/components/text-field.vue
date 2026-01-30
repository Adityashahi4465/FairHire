<script setup>
import { ref, computed, watch } from "vue";
import { colors, helpers } from "../theme";
import { useField } from "vee-validate";
import { InfoIcon } from "../../icons";
const requiredField = ref("");
const props = defineProps({
  value: {
    type: [String, Number],
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  placeholder: {
    type: String,
    default: "",
  },
  errors: {
    type: Array,
    default: () => [],
  },
  color: {
    type: String,
    default: colors["fandango-color"],
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  type: {
    type: String,
    default: "text",
  },
  name: {
    type: String,
    default: "",
  },
});

//---------------------------------------------- Computed ----------------------------------------------//
const type = computed(() => props?.type || "text");

const { value: inputValue, errors } = useField(() => props.name, undefined, {
  initialValue: props.value,
  syncVModel: "value",
});

function checkIfEmpty() {
  if (!props.value && props.required) {
    requiredField.value = "This is required Field";
  } else {
    requiredField.value = "";
  }
}
const fadedColor = computed(() => helpers.fadeColor(props.color, "0.08"));
</script>

<template>
  <div :class="['relative font-Poppins font-normal w-full text-sm']">
    <input
      :type="type"
      :placeholder="placeholder"
      v-model="inputValue"
      :required="required"
      :disabled="!isEnabled"
      @input="$emit('update:value', $event.target.value)"
      @blur="checkIfEmpty()"
      :class="[
        'inputEl px-2 py-[18.5px] rounded-[4px] w-full border-b-2 placeholder-transparent focus:outline-none',
        errors.length > 0
          ? 'border-error-color bg-error-faded-color'
          : 'border-disabled-color',
        'pt-[15px] pb-[12px]',
      ]"
      :style="{
        backgroundColor: errors.length > 0 ? '' : fadedColor,
      }"
    />
    <label
      :class="[
        'labelEl pointer-events-none absolute block top-[3px] left-2 text-[10px] leading-[15px] font-normal transition-[0.3s]',
        errors.length > 0 ? 'text-error-color' : color,
      ]"
      >{{ placeholder }}{{ required ? "*" : "" }}
    </label>
    <div class="errors flex flex-col h-1">
      <div
        v-for="(error, index) in errors"
        :key="label + 'error-' + index"
        class="flex items-center gap-1 text-[10px] text-error-color"
      >
        <InfoIcon />
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
input:placeholder-shown ~ .labelEl {
  top: 15px;
  font-size: 14px;
  line-height: 22px;
  color: rgba(133, 133, 133, 1);
}
input:not(:placeholder-shown) {
  border-color: v-bind(color);
  padding-top: 18.5px;
  padding-bottom: 8.5px;
}
.inputEl:not(:placeholder-shown) ~ .labelEl {
  color: v-bind(color);
}

input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Hide the arrows for input[type=number] in Firefox */
input[type="number"] {
  -moz-appearance: textfield;
}
</style>
