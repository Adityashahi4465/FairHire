<script setup>
import { ref, defineEmits, watch, computed, onMounted, onUnmounted } from "vue";
import { ChevronDown, ChevronUp, InfoIcon } from "../../icons/";
import { colors, helpers } from "../theme/";
import { useField } from "vee-validate";
const props = defineProps({
  placeholder: {
    type: String,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
  required: {
    type: Boolean,
    default: false,
  },
  selected: {
    type: [Object, Array, String, Number],
  },
  errors: {
    type: Array,
    default: () => [],
  },
  searchText: {
    type: [String, Number],
    default: "",
  },
  filterOptions: {
    type: Boolean,
    default: true,
  },
  color: {
    type: String,
    default: colors["fandango-color"],
  },
  name: {
    type: String,
    default: "",
  },
  apiOptions: {
    type: Boolean,
    default: false,
  },
  isEnabled: {
    type: Boolean,
    default: true,
  },
  readonly: {
    type: Boolean,
    default: false,
  },
});

const {
  value: inputValue,
  errors,
  resetField,
} = useField(() => props.name, undefined, {
  initialValue: props.selected,
  syncVModel: "selected",
});

//----------------------------------- Computed ---------------------------------------------//
const options = computed(() => props.options);
const fadedColor = computed(() => helpers.fadeColor(props.color, "0.08"));
const hexColor = computed(() => helpers.RGBAToHexA(props.color, true));
const readonly = computed(() => props.readonly || false);
const timer = ref(null);
//----------------------------------- Refs --------------------------------------------------//
const requiredField = ref("");
const emit = defineEmits(["update:selected", "action"]);
const search = ref(props.selected);
const selectedOption = ref(props.selected);
const filteredOptions = ref([...props.options]);
const showOptions = ref(false);
function showDropdown() {
  showOptions.value = true;
}

//-------------------------------------------- Methods -------------------------------------//
function hideDropdown(option) {
  emit("update:selected", option ? option : search.value);
  emit("action", option ? option : search.value);
  showOptions.value = false;
}

function selectOption(option) {
  selectedOption.value = option;
  requiredField.value = "";
}

function clickHandler(option) {
  selectOption(option);
  emit("update:selected", option);
  emit("action", option);
  search.value = option;
  hideDropdown(option);
  resetField({
    value: option,
  });
}

function getLabelColor() {
  return `text-[${hexColor.value}]`;
}

function handleBlur(event) {
  if (timer.value) {
    clearTimeout(timer.value);
  }
  timer.value = setTimeout(() => {
    showOptions.value = false;
  }, 250);
}

//---------------------------------------------- Watchers ----------------------------------------//

watch(props.selected, (newValue) => {
  search.value = newValue;
});

watch(
  () => props.options,
  () => {
    if (props.searchText === "") {
      filteredOptions.value = [...props.options];
      return;
    }
    filteredOptions.value = [
      ...props.options?.filter((option) =>
        option?.toLowerCase()?.includes(props.searchText?.toLowerCase()),
      ),
    ];
    if (!filteredOptions.value.length) {
      filteredOptions.value = [...options.value];
    }
    search.value = props.searchText;
    showOptions.value = true;
  },
  { deep: true },
);

watch(
  () => props.searchText,
  () => {
    if (props.apiOptions) {
      return;
    }
    if (props.searchText === "") {
      filteredOptions.value = [...props.options];
      return;
    }
    filteredOptions.value = [
      ...(props.options?.filter((option) =>
        option?.toLowerCase()?.includes(props.searchText?.toLowerCase()),
      ) || []),
    ];
    if (!filteredOptions.value.length) {
      filteredOptions.value = [...options.value];
    }
    showOptions.value = true;
  },
  { deep: true },
);
</script>

<template>
  <div
    class="relative font-Poppins text-sm font-normal -tracking-[0.5%] dropdown435"
  >
    <input
      v-model="inputValue"
      autocomplete="off"
      type="text"
      :placeholder="placeholder"
      :class="[
        'inputEl pt-[15px] pb-3 pl-2 border-b-2 focus:outline-none rounded-[4px] placeholder-transparent w-full',
        showOptions ? 'pt-4 pb-2' : '',
        errors.length > 0 && !showOptions
          ? 'border-b-error-color'
          : 'border-b-disabled-color',
      ]"
      :style="{
        borderColor: showOptions ? color : '',
        backgroundColor:
          errors.length > 0 && !showOptions ? '#FFDEDE' : fadedColor,
      }"
      @focus="showDropdown()"
      @input="
        ($emit('update:selected', inputValue),
        emit('update:searchText', inputValue),
        emit('action', inputValue))
      "
      :required="required"
      :disabled="!isEnabled"
      :readonly="readonly"
      @blur="handleBlur"
    />
    <!-- For Up and down Arrow Icon  -->
    <div
      :class="[
        'absolute right-4 top-[20px] cursor-pointer',
        search ? 'top-[19px]' : 'top-[15px]',
      ]"
    >
      <ChevronDown
        @click="
          () => {
            if (showOptions) {
              hideDropdown();
            } else {
              showDropdown();
            }
          }
        "
        :class="[
          'transform duration-200 ease-out',
          showOptions && isEnabled ? 'rotate-180' : '',
        ]"
      />
    </div>

    <!-- For Placeholder to Label Transition  -->
    <label
      :class="[
        'labelEl pointer-events-none absolute block left-2 transition-all',
        showOptions
          ? 'top-[3px] text-[10px] leading-[15px] font-normal'
          : 'top-[15px] text-sm text-secondary-color',
        errors.length > 0 && !showOptions
          ? 'text-error-color'
          : getLabelColor(),
      ]"
      >{{ placeholder }}{{ required ? "*" : "" }}</label
    >

    <!-- For DropDown -->
    <ul
      v-if="showOptions && isEnabled"
      :class="[
        'absolute z-50 w-full left-0 top-full mt-2 list-none  font-medium shadow-[0px_4px_24px_0px_#00000014] rounded overflow-x-hidden  max-h-40 overflow-y-scroll scrollbar-hide',
      ]"
    >
      <li
        :class="[
          ' listItems py-3 px-3 hover:rounded-[5px] text-onbackground-color text-xs hover:transition-colors cursor-pointer ',
          index < options.length ? 'border-b border-[#FAFAFA]' : '',
        ]"
        v-for="(option, index) in filteredOptions"
        :key="`option-${index}`"
        @click="clickHandler(option)"
      >
        {{ option }}
      </li>
    </ul>
    <div class="errors flex flex-col gap-1 h-1">
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
.inputEl:not(:placeholder-shown) ~ .labelEl {
  top: 3px;
  font-size: 10px;
  color: v-bind(color);
  line-height: 15px;
}

input:not(:placeholder-shown) {
  border-color: v-bind(color);
  padding-top: 18.5px;
  padding-bottom: 8.5px;
}
.listItems:hover {
  background-color: v-bind(fadedColor);
}
</style>
