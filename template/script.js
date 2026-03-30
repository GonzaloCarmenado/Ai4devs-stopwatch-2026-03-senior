document.addEventListener("DOMContentLoaded", () => {
  // --- Referencias a Elementos de la UI ---

  // Navegación
  const homeMenu = document.getElementById("home-menu")
  const stopwatchComponent = document.getElementById("stopwatch-component")
  const countdownComponent = document.getElementById("countdown-component")
  const btnStopwatch = document.getElementById("select-stopwatch")
  const btnCountdown = document.getElementById("select-countdown")
  const btnBack = document.getElementById("go-back")
  const btnFullscreen = document.getElementById("go-fullscreen")

  // Cronómetro
  const swDisplay = document.getElementById("sw-display")
  const swMsDisplay = document.getElementById("sw-ms")
  const swStartStopBtn = document.getElementById("sw-start-stop")
  const swClearBtn = document.getElementById("sw-clear")

  // Cuenta Atrás
  const cdDisplay = document.getElementById("cd-display")
  const cdMsDisplay = document.getElementById("cd-ms")
  const cdKeyboard = document.getElementById("cd-keyboard")
  const cdControls = document.getElementById("cd-controls")
  const cdSetStartBtn = document.getElementById("cd-set-start")
  const cdClearKeyBtn = document.getElementById("cd-clear-key")
  const cdStartStopBtn = document.getElementById("cd-start-stop")
  const cdClearBtn = document.getElementById("cd-clear")
  const numKeys = document.querySelectorAll(".btn-num")

  // --- Variables de Estado ---

  // Cronómetro
  let swInterval = null
  let swStartTime = 0
  let swElapsedTime = 0 // Tiempo transcurrido en ms
  let swIsRunning = false

  // Cuenta Atrás
  let cdInterval = null
  let cdTimeRemaining = 0 // Tiempo restante en ms
  let cdIsRunning = false
  let cdIsConfiguring = true // Empieza en modo teclado
  let cdInputString = "000000" // Cadena que representa HHMMSS de la entrada

  // ==========================================
  // --- LÓGICA DE NAVEGACIÓN ---
  // ==========================================

  function showComponent(componentId) {
    // Ocultar todos
    homeMenu.classList.remove("active-component")
    stopwatchComponent.classList.remove("active-component")
    countdownComponent.classList.remove("active-component")

    // Mostrar el seleccionado
    document.getElementById(componentId).classList.add("active-component")

    // Manejar botón de volver
    if (componentId === "home-menu") {
      btnBack.classList.add("hidden")
    } else {
      btnBack.classList.remove("hidden")
    }
  }

  btnStopwatch.addEventListener("click", () => {
    showComponent("stopwatch-component")
    resetStopwatch() // Asegurar que empieza limpio
  })

  btnCountdown.addEventListener("click", () => {
    showComponent("countdown-component")
    resetCountdown() // Asegurar que empieza limpio y en modo configurar
  })

  btnBack.addEventListener("click", () => {
    // Detener cualquier temporizador que esté corriendo al salir
    stopStopwatch()
    stopCountdown()
    showComponent("home-menu")
  })

  // ==========================================
  // --- LÓGICA DEL CRONÓMETRO ---
  // ==========================================

  function updateSwDisplay() {
    const totalMs = swElapsedTime
    const ms = Math.floor(totalMs % 1000)
    const seconds = Math.floor((totalMs / 1000) % 60)
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60)
    const hours = Math.floor(totalMs / (1000 * 60 * 60))

    const pad = (num, size) => num.toString().padStart(size, "0")

    swDisplay.textContent = `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`
    swMsDisplay.textContent = pad(ms, 3)
  }

  function startStopwatch() {
    if (!swIsRunning) {
      swStartTime = Date.now() - swElapsedTime
      swInterval = setInterval(() => {
        swElapsedTime = Date.now() - swStartTime
        updateSwDisplay()
      }, 10) // Actualizar cada 10ms aprox.

      swStartStopBtn.textContent = "Stop"
      swStartStopBtn.classList.remove("btn-start")
      swStartStopBtn.classList.add("btn-stop")
      swIsRunning = true
    }
  }

  function stopStopwatch() {
    if (swIsRunning) {
      clearInterval(swInterval)
      swStartStopBtn.textContent = "Start"
      swStartStopBtn.classList.remove("btn-stop")
      swStartStopBtn.classList.add("btn-start")
      swIsRunning = false
    }
  }

  function resetStopwatch() {
    stopStopwatch()
    swElapsedTime = 0
    updateSwDisplay()
  }

  swStartStopBtn.addEventListener("click", () => {
    if (swIsRunning) {
      stopStopwatch()
    } else {
      startStopwatch()
    }
  })

  swClearBtn.addEventListener("click", resetStopwatch)

  // ==========================================
  // --- LÓGICA DE LA CUENTA ATRÁS ---
  // ==========================================

  // Formatea el tiempo restante (en ms) al display
  function updateCdDisplay() {
    const totalMs = cdTimeRemaining
    const ms = Math.floor(totalMs % 1000)
    const seconds = Math.floor((totalMs / 1000) % 60)
    const minutes = Math.floor((totalMs / (1000 * 60)) % 60)
    const hours = Math.floor(totalMs / (1000 * 60 * 60))

    const pad = (num, size) => num.toString().padStart(size, "0")

    cdDisplay.textContent = `${pad(hours, 2)}:${pad(minutes, 2)}:${pad(seconds, 2)}`
    cdMsDisplay.textContent = pad(ms, 3)
  }

  // Actualiza el display basándose solo en lo que el usuario está escribiendo (HHMMSS)
  function updateCdConfigDisplay() {
    // Tomar la cadena "000000" y formatearla como "HH:MM:SS"
    const h = cdInputString.substring(0, 2)
    const m = cdInputString.substring(2, 4)
    const s = cdInputString.substring(4, 6)
    cdDisplay.textContent = `${h}:${m}:${s}`
    cdMsDisplay.textContent = "000" // Ms siempre cero al configurar
  }

  // Convierte la entrada del teclado (HHMMSS) a milisegundos reales
  function getMsFromInput() {
    const h = parseInt(cdInputString.substring(0, 2))
    const m = parseInt(cdInputString.substring(2, 4))
    const s = parseInt(cdInputString.substring(4, 6))
    return (h * 3600 + m * 60 + s) * 1000
  }

  function handleNumClick(num) {
    // Al configurar, mover la cadena hacia la izquierda
    cdInputString = cdInputString.substring(1) + num
    updateCdConfigDisplay()
  }

  function handleClearKey() {
    // Reiniciar la cadena de entrada
    cdInputString = "000000"
    updateCdConfigDisplay()
  }

  function setAndStartCountdown() {
    const timeInMs = getMsFromInput()
    if (timeInMs > 0) {
      cdTimeRemaining = timeInMs
      cdIsConfiguring = false

      // UI Cambio: Ocultar teclado, mostrar controles
      cdKeyboard.classList.add("hidden")
      cdControls.classList.remove("hidden")

      startCountdown()
    } else {
      alert("Please set a time greater than zero.")
    }
  }

  function startCountdown() {
    if (!cdIsRunning) {
      const countdownStartTime = Date.now()
      const initialTimeRemaining = cdTimeRemaining

      cdInterval = setInterval(() => {
        const now = Date.now()
        const delta = now - countdownStartTime
        cdTimeRemaining = Math.max(0, initialTimeRemaining - delta) // No bajar de 0

        updateCdDisplay()

        if (cdTimeRemaining <= 0) {
          clearInterval(cdInterval)
          cdIsRunning = false
          alert("Time is up!") // Simple alerta al terminar
          resetCountdown() // Volver al estado inicial
        }
      }, 10)

      cdStartStopBtn.textContent = "Stop"
      cdStartStopBtn.classList.remove("btn-start")
      cdStartStopBtn.classList.add("btn-stop")
      cdIsRunning = true
    }
  }

  function stopCountdown() {
    if (cdIsRunning) {
      clearInterval(cdInterval)
      cdStartStopBtn.textContent = "Start"
      cdStartStopBtn.classList.remove("btn-stop")
      cdStartStopBtn.classList.add("btn-start")
      cdIsRunning = false
    }
  }

  function resetCountdown() {
    stopCountdown()
    cdTimeRemaining = 0
    cdInputString = "000000"
    cdIsConfiguring = true
    updateCdConfigDisplay()

    // UI Cambio: Mostrar teclado, ocultar controles
    cdKeyboard.classList.remove("hidden")
    cdControls.classList.add("hidden")
  }

  // Eventos de Teclado Numérico
  numKeys.forEach((key) => {
    key.addEventListener("click", () => handleNumClick(key.getAttribute("data-val")))
  })

  cdClearKeyBtn.addEventListener("click", handleClearKey)
  cdSetStartBtn.addEventListener("click", setAndStartCountdown)

  // Eventos de Controles (Start/Stop/Clear)
  cdStartStopBtn.addEventListener("click", () => {
    if (cdIsRunning) {
      stopCountdown()
    } else {
      startCountdown()
    }
  })

  cdClearBtn.addEventListener("click", resetCountdown)

  // ==========================================
  // --- LÓGICA DE PANTALLA COMPLETA ---
  // ==========================================

  function toggleFullscreen() {
    const element = document.documentElement // Usar el documento entero

    if (!document.fullscreenElement) {
      if (element.requestFullscreen) {
        element.requestFullscreen()
      } else if (element.webkitRequestFullscreen) {
        /* Safari */
        element.webkitRequestFullscreen()
      } else if (element.msRequestFullscreen) {
        /* IE11 */
        element.msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if (document.webkitExitFullscreen) {
        /* Safari */
        document.webkitExitFullscreen()
      } else if (document.msExitFullscreen) {
        /* IE11 */
        document.msExitFullscreen()
      }
    }
  }

  // Actualizar el texto del botón cuando cambia el estado
  document.addEventListener("fullscreenchange", () => {
    if (document.fullscreenElement) {
      btnFullscreen.innerHTML = `
                <svg class="fullscreen-icon" viewBox="0 0 24 24">
                    <path d="M5 16h3v3h2v-5h-5v2zm14-7h-3v-3h-2v5h5v-2zm-14-7v3h-3v2h5v-5h-2zm14 14h-3v3h-2v-5h5v2z"/>
                </svg>
                Exit Fullscreen
            `
    } else {
      btnFullscreen.innerHTML = `
                <svg class="fullscreen-icon" viewBox="0 0 24 24">
                    <path d="M7 14h-3v3h-2v-5h5v2zm13-5h-3v-3h-2v5h5v-2zm-13-5v3h-3v2h5v-5h-2zm13 14h-3v3h-2v-5h5v2z"/>
                </svg>
                Go Fullscreen
            `
    }
  })

  btnFullscreen.addEventListener("click", toggleFullscreen)
})
