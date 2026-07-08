import { useState, useEffect } from 'react'

/**
 * RNF3-F — Persistencia local ante fallas
 *
 * Este Hook reemplaza a useState para los formularios. Automáticamente
 * guarda en localStorage cada cambio del estado, y lo restaura al
 * recargar la página.
 *
 * @param {string} key - Clave única para identificar este formulario en localStorage.
 * @param {any} initialValue - Valor por defecto si no hay borrador guardado.
 * @returns {[any, function, boolean, function]} [state, setState, isRestored, clearDraft]
 */
export default function useLocalDraft(key, initialValue) {
  // Inicialización perezosa: intentamos recuperar del localStorage primero
  const [state, setState] = useState(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        return JSON.parse(item)
      }
      return initialValue
    } catch (error) {
      console.error(`Error leyendo localStorage para la clave "${key}":`, error)
      return initialValue
    }
  })

  // Derivar isRestored dinámicamente en el render. Esto evita la necesidad
  // de usar un useEffect extra que causaría renders en cascada.
  const isRestored = JSON.stringify(state) !== JSON.stringify(initialValue)

  // Sincronizar automáticamente cada cambio de estado con el localStorage
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(state))
    } catch (error) {
      console.error(`Error guardando en localStorage para la clave "${key}":`, error)
    }
  }, [key, state])

  // Función para destruir explícitamente el borrador tras un envío exitoso
  const clearDraft = () => {
    try {
      window.localStorage.removeItem(key)
      setState(initialValue)
    } catch (error) {
      console.error(`Error borrando localStorage para la clave "${key}":`, error)
    }
  }

  return [state, setState, isRestored, clearDraft]
}
