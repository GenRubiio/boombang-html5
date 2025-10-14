import { onMounted, onBeforeUnmount, ref } from 'vue'
import { OverlayScrollbars } from 'overlayscrollbars'
import 'overlayscrollbars/overlayscrollbars.css'
import '@/assets/styles/overlay-scrollbars-custom.css'

export function useOverlayScrollbars(options = {}) {
  const osInstance = ref(null)

  const initScrollbars = (element, customOptions = {}) => {
    if (!element) return

    const defaultOptions = {
      scrollbars: {
        theme: 'os-theme-dark',
        visibility: 'auto',
        autoHide: 'never',
        autoHideDelay: 0,
      },
      overflow: {
        x: 'hidden',
        y: 'scroll',
      },
      paddingAbsolute: false,
      ...options,
      ...customOptions,
    }

    osInstance.value = OverlayScrollbars(element, defaultOptions)
    return osInstance.value
  }

  const destroyScrollbars = () => {
    if (osInstance.value) {
      osInstance.value.destroy()
      osInstance.value = null
    }
  }

  onBeforeUnmount(() => {
    destroyScrollbars()
  })

  return {
    osInstance,
    initScrollbars,
    destroyScrollbars,
  }
}
