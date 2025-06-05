// =============================================
// MÓDULO: GESTIÓN DE SENSORES Y HABITACIONES
// =============================================

class SensorManager {
    constructor() {
        this.temporizadores = {};
        this.init();
    }

    init() {
        this.setupSensorEvents();
    }

    setupSensorEvents() {
        document.querySelectorAll('.habitacion').forEach(habitacion => {
            const sensorId = habitacion.dataset.sensor;

            habitacion.addEventListener('mouseenter', () => {
                this.activarSensor(habitacion, sensorId);
            });

            habitacion.addEventListener('mouseleave', () => {
                this.desactivarSensor(habitacion, sensorId);
            });
        });
    }

    activarSensor(habitacion, sensorId) {
        const casa = habitacion.closest('.pagina');
        const altura = casa ? casa.dataset.altura || casa.id : null;
        // Activar luz visual
        habitacion.classList.add('luz-encendida');

        // Enviar datos al servidor
        this.enviarDatosSensor(sensorId, 0, altura);

        // Agregar fila a tabla si no existe
        this.agregarFilaTabla(sensorId);

        this.actualizarEstadoTabla(sensorId, 'encendido');

        // Iniciar temporizador
        this.iniciarTemporizador(sensorId);
    }

    desactivarSensor(habitacion, sensorId) {
        const casa = habitacion.closest('.pagina');
        const altura = casa ? casa.dataset.altura || casa.id : null;
        // Desactivar luz visual
        habitacion.classList.remove('luz-encendida');

        // Actualizar estado en tabla
        const duracion = this.detenerTemporizador(sensorId);

        // Detener temporizador
        this.enviarDatosSensor(sensorId, duracion, altura);
    }

    enviarDatosSensor(sensorId, segundos, altura) {
        const alturaCasa = altura;
        const fecha = new Date();

        const fechaFormateada = fecha.toLocaleDateString('es-AR');
        const horaFormateada = fecha.toLocaleTimeString('es-AR');


        fetch('http://localhost:8080/api/v1/eventos', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                altura: alturaCasa,
                sensor: sensorId,
                fecha: fechaFormateada,
                hora: horaFormateada,
                segundos: segundos
            })

        }).then(() => {
            console.log(`Evento registrado para ${sensorId}, duración: ${segundos} segundos`);
        }).catch(error => {
            console.error('Error al registrar el evento:', error);
        });
    }

    agregarFilaTabla(sensorId) {
        if (document.getElementById(`row-${sensorId}`)) return;

        const tbody = document.querySelector('.tabla-detalle tbody');
        if (!tbody) return;

        const row = document.createElement('tr');
        row.id = `row-${sensorId}`;
        row.innerHTML = `
            <td>${sensorId}</td>
            <td class="estado encendido">Encendido</td>
            <td>${new Date().toISOString().split('T')[0]}</td>
            <td>${new Date().toLocaleTimeString()}</td>
            <td><span id="timer-${sensorId}">00:00</span></td>
        `;
        tbody.appendChild(row);
    }

    actualizarEstadoTabla(sensorId, estado) {
        const row = document.getElementById(`row-${sensorId}`);
        if (!row) return;

        const estadoCell = row.querySelector('.estado');
        if (estadoCell) {
            estadoCell.textContent = estado === 'apagado' ? 'Apagado' : 'Encendido';
            estadoCell.classList.remove('encendido', 'apagado');
            estadoCell.classList.add(estado);
        }
    }

    iniciarTemporizador(sensorId) {
        const span = document.getElementById(`timer-${sensorId}`);
        if (!span) return;

        const now = new Date();
        let startTime = now;

        if (this.temporizadores[sensorId]) {
            const elapsed = this.temporizadores[sensorId].elapsedSeconds || 0;
            startTime = new Date(now.getTime() - elapsed * 1000);
        }

        this.temporizadores[sensorId] = {
            interval: setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                span.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            }, 1000),
            startTime: startTime,
            elapsedSeconds: this.temporizadores[sensorId]?.elapsedSeconds || 0
        };
    }

    detenerTemporizador(sensorId) {
        const timer = this.temporizadores[sensorId];
        if (timer) {
            clearInterval(timer.interval);
            const now = new Date();
            const diff = Math.floor((now - timer.startTime) / 1000);
            timer.elapsedSeconds = diff;
            this.temporizadores[sensorId] = timer;
            return diff;
        }
        return 0;
    }
}

// =============================================
// MÓDULO: NAVEGACIÓN ENTRE PÁGINAS (ACTUALIZADO)
// =============================================

class NavigationManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupPageNavigation();
        this.setupSectionNavigation();
    }

    setupPageNavigation() {
        // Navegación entre casas
        const casas = ["casa1.html", "casa2.html", "casa3.html"];
        const currentFile = window.location.pathname.split("/").pop();
        const currentFolder = window.location.pathname.split("/").slice(-2, -1)[0];

        const pathToIndex = currentFolder === "Pages" ? "../index.html" : "index.html";
        const pathPrefix = currentFolder === "Pages" ? "" : "Pages/";

        this.setupNextButton(casas, currentFile, pathPrefix);
        this.setupPrevButton(casas, currentFile, pathToIndex, pathPrefix);
    }

    setupNextButton(casas, currentFile, pathPrefix) {
        const btnSiguiente = document.getElementById("btn-siguiente");
        if (!btnSiguiente) return;

        if (currentFile === "index.html") {
            btnSiguiente.addEventListener("click", () => {
                window.location.href = "Pages/casa1.html";
            });
        } else if (casas.includes(currentFile)) {
            const index = casas.indexOf(currentFile);
            if (index < casas.length - 1) {
                btnSiguiente.addEventListener("click", () => {
                    window.location.href = pathPrefix + casas[index + 1];
                });
            }
        }
    }

    setupPrevButton(casas, currentFile, pathToIndex, pathPrefix) {
        const btnAnterior = document.getElementById("btn-anterior");
        if (!btnAnterior) return;

        btnAnterior.addEventListener("click", () => {
            if (currentFile === "casa1.html") {
                window.location.href = pathToIndex;
            } else if (casas.includes(currentFile)) {
                const index = casas.indexOf(currentFile);
                if (index > 0) {
                    window.location.href = pathPrefix + casas[index - 1];
                }
            }
        });
    }

    setupSectionNavigation() {
        // Navegación a estadísticas
        const btnEstadisticas = document.querySelector('.btn-estadisticas');
        if (btnEstadisticas) {
            btnEstadisticas.addEventListener('click', () => {
                this.mostrarSeccion('panel-analisis');
                this.ocultarFlechasNavegacion(); // NUEVA FUNCIÓN
                this.inicializarFiltroAnalisis();
            });
        }

        // Botón volver
        const btnVolver = document.getElementById('btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                this.ocultarSeccion('panel-analisis');
                this.mostrarSeccionCasa(); // NUEVA FUNCIÓN
                this.mostrarFlechasNavegacion(); // NUEVA FUNCIÓN
            });
        }
    }

    // =============================================
    // NUEVAS FUNCIONES PARA CONTROLAR FLECHAS
    // =============================================

    ocultarFlechasNavegacion() {
        const navegacionCasas = document.querySelector('.navegacion-casas');
        if (navegacionCasas) {
            navegacionCasas.style.display = 'none';
        }
    }

    mostrarFlechasNavegacion() {
        const navegacionCasas = document.querySelector('.navegacion-casas');
        if (navegacionCasas) {
            navegacionCasas.style.display = 'flex';
        }
    }

    mostrarSeccionCasa() {
        // Determinar qué casa mostrar basándose en la URL actual
        const currentFile = window.location.pathname.split("/").pop();
        let casaId = 'casa1'; // default

        if (currentFile === 'casa1.html') casaId = 'casa1';
        else if (currentFile === 'casa2.html') casaId = 'casa2';
        else if (currentFile === 'casa3.html') casaId = 'casa3';

        this.mostrarSeccion(casaId);
    }

    ocultarSeccionesEstaticas() {
        // Ocultar todas las secciones estáticas del HTML
        const seccionesEstaticas = document.querySelectorAll('.bloque-analisis');
        seccionesEstaticas.forEach(seccion => {
            seccion.style.display = 'none';
        });
    }

    mostrarSeccion(sectionId) {
        document.querySelectorAll('.pagina').forEach(p => p.style.display = 'none');
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'block';
    }

    ocultarSeccion(sectionId) {
        const section = document.getElementById(sectionId);
        if (section) section.style.display = 'none';
    }

    inicializarFiltroAnalisis() {
        const filtro = document.getElementById('filtro-casa');
        if (filtro) filtro.value = "casa1";

        // Activar la primera tab por defecto
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
            setTimeout(() => {
                this.activateTab(firstTab);
                this.renderSeccionAnalisis(firstTab.dataset.seccion);
            }, 100);
        }
    }

    activateTab(activeTab) {
        document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("activa"));
        activeTab.classList.add("activa");
    }
}

// =============================================
// MÓDULO: DATOS Y ANÁLISIS
// =============================================

class DataManager {
    constructor() {
        this.datosPorCasa = {
            casa1: {
                uso: {
                    masUsada: "Cocina", //hecho
                    promedio: "3m 20s", //hecho (solo segundos)
                    ultimoUso: "Dormitorio - 2025-05-22 22:15", //hecho
                    sinUso: ["Oficina"] //hecho (mes actual)
                },
                consumo: {
                    diario: "12.5 kWh",
                    mensual: "352.3 kWh",
                    costo: "$42.276",
                    escalon: 2, // desde la bd
                    bonificacion: "10%", // desde la bd
                    alerta: "89% del límite alcanzado" // desde la bd
                },
                habitos: {
                    franjaActiva: "18:00–22:00", //hecho (una sola hora)
                    diaActivo: "Miércoles",
                    pico: "21:00 - 3.2 kWh"
                },
                comparativas: {
                    variacion: "+5%",
                    top3: [
                        { casa: "Casa 3", consumo: "412 kWh" },
                        { casa: "Casa 1", consumo: "352 kWh" },
                        { casa: "Casa 2", consumo: "291 kWh" }
                    ],
                    porHabitacion: {
                        Cocina: 120,
                        Living: 95,
                        Dormitorio: 80,
                        Oficina: 30
                    }
                }
            },
            casa2: {
                uso: {
                    masUsada: "Living",
                    promedio: "2m 40s",
                    ultimoUso: "Baño - 2025-05-21 18:30",
                    sinUso: []
                },
                consumo: {
                    diario: "10.2 kWh",
                    mensual: "291.1 kWh",
                    costo: "$34.932",
                    escalon: 1,
                    bonificacion: "0%",
                    alerta: "72% del límite"
                },
                habitos: {
                    franjaActiva: "17:00–21:00",
                    diaActivo: "Lunes",
                    pico: "20:00 - 2.8 kWh"
                },
                comparativas: {
                    variacion: "-3%",
                    top3: [
                        { casa: "Casa 3", consumo: "412 kWh" },
                        { casa: "Casa 1", consumo: "352 kWh" },
                        { casa: "Casa 2", consumo: "291 kWh" }
                    ],
                    porHabitacion: {
                        Cocina: 80,
                        Comedor: 65,
                        Dormitorio: 70,
                        Baño: 50
                    }
                }
            },
            casa3: {
                uso: {
                    masUsada: "Suite Master",
                    promedio: "4m 10s",
                    ultimoUso: "Entrada - 2025-05-23 20:10",
                    sinUso: ["Terraza"]
                },
                consumo: {
                    diario: "15.8 kWh",
                    mensual: "412.0 kWh",
                    costo: "$49.440",
                    escalon: 3,
                    bonificacion: "0%",
                    alerta: "98% del límite"
                },
                habitos: {
                    franjaActiva: "19:00–23:00",
                    diaActivo: "Viernes",
                    pico: "22:00 - 3.7 kWh"
                },
                comparativas: {
                    variacion: "+8%",
                    top3: [
                        { casa: "Casa 3", consumo: "412 kWh" },
                        { casa: "Casa 1", consumo: "352 kWh" },
                        { casa: "Casa 2", consumo: "291 kWh" }
                    ],
                    porHabitacion: {
                        Entrada: 100,
                        Salón: 110,
                        Cocina: 95,
                        Master: 120
                    }
                }
            }
        };
    }

    getDatosCasa(casaId) {
        return this.datosPorCasa[casaId] || null;
    }

    getAllCasas() {
        return this.datosPorCasa;
    }
}

// =============================================
// MÓDULO: ANÁLISIS Y REPORTES
// =============================================

class AnalysisManager {
    constructor(dataManager) {
        this.dataManager = dataManager;
        this.casaActual = "casa1";
        this.charts = {}; // Para almacenar instancias de gráficos
        this.init();
    }

    init() {
        this.setupFilters();
        this.setupTabs();
    }

    setupFilters() {
        const filtroCasa = document.getElementById('filtro-casa');
        if (filtroCasa) {
            filtroCasa.addEventListener('change', (e) => {
                this.casaActual = e.target.value;
                this.handleCasaChange();
            });
        }
    }

    setupTabs() {
        const tabs = document.querySelectorAll(".tab-btn");
        tabs.forEach(tab => {
            tab.addEventListener("click", () => {
                this.activateTab(tab);
                const seccion = tab.dataset.seccion;
                this.renderSeccionAnalisis(seccion);
            });
        });
        // Activar la primera tab por defecto al cargar
        if (tabs.length > 0) {
            this.activateTab(tabs[0]);
            this.renderSeccionAnalisis(tabs[0].dataset.seccion);
        }
    }

    activateTab(activeTab) {
        document.querySelectorAll(".tab-btn").forEach(t => t.classList.remove("activa"));
        activeTab.classList.add("activa");
    }

    handleCasaChange() {
        if (this.casaActual === "todas") {
            this.showAllCasasMessage();
        } else {
            const tabActiva = document.querySelector(".tab-btn.activa")?.dataset.seccion || "uso";
            this.renderSeccionAnalisis(tabActiva);
        }
    }

    showAllCasasMessage() {
        const contenedor = document.getElementById("contenedor-estadisticas");
        if (contenedor) {
            contenedor.innerHTML = `<p>Seleccioná una casa específica para ver sus datos.</p>`;
        }
    }

    // Función para destruir gráficos existentes
    destroyExistingCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && typeof chart.destroy === 'function') {
                chart.destroy();
            }
        });
        this.charts = {};
    }

    renderSeccionAnalisis(seccion) {
        const data = this.dataManager.getDatosCasa(this.casaActual);
        if (!data) return;

        const contenedor = document.getElementById("contenedor-estadisticas");
        if (!contenedor) return;

        // Destruir gráficos existentes antes de crear nuevos
        this.destroyExistingCharts();

        contenedor.innerHTML = "";

        switch (seccion) {
            case "uso":
                this.renderUsoSection(contenedor, data.uso);
                break;
            case "consumo":
                this.renderConsumoSection(contenedor, data.consumo);
                break;
            case "habitos":
                this.renderHabitosSection(contenedor, data.habitos);
                break;
            case "comparativas":
                this.renderComparativasSection(contenedor, data.comparativas);
                break;
        }
    }

    renderUsoSection(contenedor, usoData) {
        // Datos simulados para el gráfico de uso
        const habitacionesUso = {
            'Cocina': 45,
            'Living': 32,
            'Dormitorio': 28,
            'Baño': 18,
            'Oficina': 12,
            'Cochera': 8
        };

        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>📊 Uso de habitaciones</h3>
                <ul class="lista-analisis">
                    <li><strong>Habitación más usada:</strong> ${usoData.masUsada}</li>
                    <li><strong>Tiempo promedio de uso:</strong> ${usoData.promedio}</li>
                    <li><strong>Último uso:</strong> ${usoData.ultimoUso}</li>
                    <li><strong>Habitaciones sin uso este mes:</strong> ${usoData.sinUso.join(", ") || "Ninguna"}</li>
                </ul>
                <canvas id="graficoUsoHabitaciones" height="250"></canvas>
            </div>
        `;

        setTimeout(() => this.createUsoChart(habitacionesUso), 0);
    }

    renderConsumoSection(contenedor, consumoData) {
        // Datos simulados para gráfico de consumo semanal
        const consumoSemanal = {
            'Lun': 8.2,
            'Mar': 9.1,
            'Mié': 12.8,
            'Jue': 11.4,
            'Vie': 15.3,
            'Sáb': 18.7,
            'Dom': 16.2
        };

        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>⚡ Consumo y costos</h3>
                <ul class="lista-analisis">
                    <li><strong>Consumo diario:</strong> ${consumoData.diario}</li>
                    <li><strong>Consumo mensual:</strong> ${consumoData.mensual}</li>
                    <li><strong>Boleta estimada:</strong> ${consumoData.costo}</li>
                    <li><strong>Escalón tarifario:</strong> ${consumoData.escalon}</li>
                    <li><strong>Bonificación aplicada:</strong> ${consumoData.bonificacion}</li>
                    <li><strong>Alerta de consumo:</strong> ${consumoData.alerta}</li>
                </ul>
                <canvas id="graficoConsumoSemanal" height="250"></canvas>
            </div>
        `;

        setTimeout(() => this.createConsumoChart(consumoSemanal), 0);
    }

    renderHabitosSection(contenedor, habitosData) {
        // Datos simulados para gráfico de hábitos por hora
        const usoHorario = {
            '6:00': 2,
            '8:00': 8,
            '10:00': 12,
            '12:00': 15,
            '14:00': 18,
            '16:00': 22,
            '18:00': 35,
            '20:00': 42,
            '22:00': 38,
            '24:00': 25
        };

        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>🕒 Hábitos y horarios</h3>
                <ul class="lista-analisis">
                    <li><strong>Franja horaria más activa:</strong> ${habitosData.franjaActiva}</li>
                    <li><strong>Día más activo:</strong> ${habitosData.diaActivo}</li>
                    <li><strong>Pico horario:</strong> ${habitosData.pico}</li>
                </ul>
                <canvas id="graficoHabitosHorarios" height="250"></canvas>
            </div>
        `;

        setTimeout(() => this.createHabitosChart(usoHorario), 0);
    }

    renderComparativasSection(contenedor, comparativasData) {
        const top3 = comparativasData.top3.map(t => `<li>${t.casa} - ${t.consumo}</li>`).join("");
        const porHabitacion = Object.entries(comparativasData.porHabitacion)
            .map(([hab, val]) => `<li>${hab}: ${val} kWh</li>`).join("");

        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>📈 Comparativas</h3>
                <ul class="lista-analisis">
                    <li><strong>Variación mensual:</strong> ${comparativasData.variacion}</li>
                    <li><strong>Top 3 casas:</strong><ul>${top3}</ul></li>
                    <li><strong>Consumo por habitación:</strong><ul>${porHabitacion}</ul></li>
                </ul>
                <canvas id="graficoConsumoHabitaciones" height="250"></canvas>
            </div>
        `;

        setTimeout(() => this.createComparativasChart(comparativasData.porHabitacion), 0);
    }

    // =============================================
    // GRÁFICOS ESPECÍFICOS POR SECCIÓN
    // =============================================

    createUsoChart(habitacionesUso) {
        const canvas = document.getElementById('graficoUsoHabitaciones');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        this.charts.uso = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(habitacionesUso),
                datasets: [{
                    label: 'Activaciones',
                    data: Object.values(habitacionesUso),
                    backgroundColor: [
                        '#5eb8ff',
                        '#4facfe',
                        '#00f2fe',
                        '#667eea',
                        '#764ba2',
                        '#f093fb'
                    ],
                    borderWidth: 2,
                    borderColor: '#1e2230'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: { color: '#cbf7ed' }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.label}: ${ctx.raw} activaciones`
                        }
                    }
                }
            }
        });
    }

    createConsumoChart(consumoSemanal) {
        const canvas = document.getElementById('graficoConsumoSemanal');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        this.charts.consumo = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Object.keys(consumoSemanal),
                datasets: [{
                    label: 'Consumo diario (kWh)',
                    data: Object.values(consumoSemanal),
                    borderColor: '#4facfe',
                    backgroundColor: 'rgba(79, 172, 254, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4facfe',
                    pointBorderColor: '#cbf7ed',
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbf7ed' }
                    },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.raw} kWh`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#cbf7ed',
                            callback: function(value) {
                                return value + ' kWh';
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbf7ed' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }

    createHabitosChart(usoHorario) {
        const canvas = document.getElementById('graficoHabitosHorarios');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        this.charts.habitos = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(usoHorario),
                datasets: [{
                    label: 'Actividad por hora',
                    data: Object.values(usoHorario),
                    borderColor: '#5eb8ff',
                    backgroundColor: 'rgba(94, 184, 255, 0.2)',
                    borderWidth: 2,
                    pointBackgroundColor: '#5eb8ff',
                    pointBorderColor: '#cbf7ed',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true,
                        labels: { color: '#cbf7ed' }
                    }
                },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.2)' },
                        grid: { color: 'rgba(255,255,255,0.2)' },
                        pointLabels: { color: '#cbf7ed' },
                        ticks: {
                            color: '#cbf7ed',
                            backdropColor: 'transparent'
                        }
                    }
                }
            }
        });
    }

    createComparativasChart(porHabitacionData) {
        const canvas = document.getElementById('graficoConsumoHabitaciones');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        this.charts.comparativas = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(porHabitacionData),
                datasets: [{
                    label: 'Consumo (kWh)',
                    data: Object.values(porHabitacionData),
                    backgroundColor: '#5eb8ff',
                    borderRadius: 8,
                    borderSkipped: false
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        callbacks: {
                            label: ctx => `${ctx.raw} kWh`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#cbf7ed',
                            callback: function(value) {
                                return value + ' kWh';
                            }
                        },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    },
                    x: {
                        ticks: { color: '#cbf7ed' },
                        grid: { color: 'rgba(255,255,255,0.1)' }
                    }
                }
            }
        });
    }
}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

class SmartHomeApp {
    constructor() {
        this.dataManager = new DataManager();
        this.sensorManager = new SensorManager();
        this.navigationManager = new NavigationManager();
        this.analysisManager = new AnalysisManager(this.dataManager);

        this.init();
    }

    init() {
        console.log('Smart Home App inicializada');
        // Aquí podrías agregar más lógica de inicialización global
    }
}

// =============================================
// INICIALIZACIÓN AL CARGAR EL DOM
// =============================================

document.addEventListener('DOMContentLoaded', () => {
    new SmartHomeApp();
});

// habitación más usada
async function getHabitacionMasUsada(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/habitacion-mas-usada/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar la habitación`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// tiempo promedio de uso por habitación
async function getTiempoPromedioPorHabitacion(altura, sensor) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/tiempo-promedio/'+ altura +'?sensor=' + sensor);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el tiempo`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}


async function getConsumoPorDiaSemanaYMes(altura) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/consumo-dia-semana-mes/{altura}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el consumo`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar consumo:', error);
    }
}







async function getCostoEstimadoMensual(altura, mes, anio) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/costo-estimado/${altura}/${mes}/${anio}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el costo estimado mensual`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar costo estimado mensual:', error);
    }
}



// Determinar hora más activa
async function getHoraMasActiva(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/hora-mas-detecciones/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar la hora`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}


async function getEscalonTarifario(altura, fecha) {
    try {
        const url = new URL('http://localhost:8080/api/v1/escalon-tarifario');
        url.searchParams.append('altura', altura);
        url.searchParams.append('fecha', fecha);

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el escalón tarifario`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar escalón tarifario:', error);
    }
}





// TODO: Comparar consumo entre meses consecutivos
// Agrupar consumo por mes
// Calcular variación porcentual con respecto al mes anterior
// Determinar si el consumo subió, bajó o se mantuvo



// TODO: Aplicar bonificación por consumo estable
// Detectar si el consumo actual se mantiene dentro de un margen estable (±5%)
// Si se cumple, aplicar una bonificación del 10% al costo total






async function getConsumoMensualAlerta(altura, fecha, limite) {
    try {
        const url = new URL('http://localhost:8080/api/v1/consumo-mensual-alerta');
        url.searchParams.append('altura', altura);
        url.searchParams.append('fecha', fecha);
        url.searchParams.append('limite', limite);

        const response = await fetch(url.toString());

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar consumo mensual`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar consumo mensual con alerta:', error);
    }
}



async function getTop3CasasMayorConsumo() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/top3-casas');

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el top 3 de casas`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar top 3 casas:', error);
    }
}





async function getConsumoCasaHabitacion(altura) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/consumo-casa-habitacion/${altura}`);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el consumo total`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar el consumo total de la casa:', error);
    }
}




async function getConsumoDia(altura) {
    const fecha = "02/03/2025";

    const url = `http://localhost:8080/api/v1/consumo-dia?altura=${altura}&fecha=${encodeURIComponent(fecha)}`;

    try {
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar consumo por día`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al obtener consumo por día:", error);
    }
}



// último uso de la casa
async function getUltimaDeteccion(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/ultima-deteccion/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar la ultima detección`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// habitaciones que no se usaron en el mes
async function getHabitacionesSinUso(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/sensores-sin-deteccion/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar los sensores`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

async function consumoPorHora(altura, fecha) {
    try {
        const url = `http://localhost:8080/api/v1/consumo-hora?altura=${altura}&fecha=${encodeURIComponent(fecha)}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar consumo por hora`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al obtener consumo por hora:', error);
    }
}



// obtener todas las casas
async function getCasas() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/casas');

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar las casas`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// obtener una casa por su altura
async function getCasaById(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/casas/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar las casas`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// obtener todos los eventos
async function getEventos() {
    try {
        const response = await fetch('http://localhost:8080/api/v1/eventos');

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar los eventos`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// obtener eventos por su altura
async function getEventosById(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/eventos/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar las casas`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

// Subir evento a la bd
function postEvento(altura, sensor, segundos) {
    const fechaHora = obtenerFechaHora();

    fetch('http://localhost:8080/api/v1/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "_id": 1,
            "altura": altura,
            "sensor": sensor,
            "fecha": fechaHora.fecha,
            "hora": fechaHora.hora,
            "segundos": segundos,
        })
    }).catch(error => {
        console.error('Error subiendo el movimiento:', error);
    });
}

function obtenerFechaHora() {
    const ahora = new Date();

    // Obtener componentes de fecha
    const dia = String(ahora.getDate()).padStart(2, "0");
    const mes = String(ahora.getMonth() + 1).padStart(2, "0"); // Los meses van de 0 a 11
    const ano = ahora.getFullYear();

    // Obtener componentes de hora
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    return {
        fecha: `${dia}/${mes}/${ano}`,
        hora: `${horas}:${minutos}:${segundos}`,
    };
}