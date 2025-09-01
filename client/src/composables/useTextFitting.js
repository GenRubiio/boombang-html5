/**
 * Composable para ajuste automático de tamaño de texto
 */
export function useTextFitting() {
  /**
   * Ajusta el tamaño de un label específico para que quepa en su contenedor
   * @param {HTMLElement} container - El contenedor del label
   * @param {string} labelSelector - Selector CSS para encontrar el label dentro del contenedor
   */
  const fitOneLabel = (container, labelSelector = '.fit_label') => {
    const label = container.querySelector(labelSelector)
    if (!label) return

    // Resetear estilos antes de medir
    label.style.transform = "scale(1)"
    label.style.fontSize = ""
    label.style.maxWidth = "none"

    const cs = getComputedStyle(container)
    const available =
      container.clientWidth -
      parseFloat(cs.paddingLeft) -
      parseFloat(cs.paddingRight)

    // Evitar salto de línea y medir ancho real
    label.style.whiteSpace = "nowrap"

    const needed = label.scrollWidth

    if (needed <= available) {
      // Cabe tal cual
      label.style.transform = ""
      label.style.maxWidth = "100%"
      label.style.textOverflow = ""
      label.style.overflow = ""
      return
    }

    // 1) Intento 1: escalar con transform solo el texto (no el contenedor)
    const scale = Math.max(0.6, available / needed) // límite mínimo 0.6
    label.style.transform = `scale(${scale})`
    label.style.transformOrigin = "center center"
    label.style.display = "inline-block"

    // 2) Fallback visual si ni con 0.6 se ve bien: ellipsis
    if (available / needed < 0.6) {
      label.style.transform = "scale(1)"
      label.style.maxWidth = available + "px"
      label.style.overflow = "hidden"
      label.style.textOverflow = "ellipsis"
    }
  }

  /**
   * Ajusta todos los labels dentro de los contenedores especificados
   * @param {HTMLElement} rootElement - Elemento raíz donde buscar los contenedores
   * @param {string} containerSelector - Selector CSS para los contenedores
   * @param {string} labelSelector - Selector CSS para los labels
   */
  const fitAllLabels = (rootElement, containerSelector, labelSelector = '.fit_label') => {
    if (!rootElement || !containerSelector) return

    const containers = rootElement.querySelectorAll(containerSelector)
    containers.forEach(container => fitOneLabel(container, labelSelector))
  }

  return {
    fitOneLabel,
    fitAllLabels
  }
}
