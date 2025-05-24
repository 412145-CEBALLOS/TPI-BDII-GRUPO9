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
        // Activar luz visual
        habitacion.classList.add('luz-encendida');

        // Enviar datos al servidor
        this.enviarDatosSensor(sensorId);

        // Agregar fila a tabla si no existe
        this.agregarFilaTabla(sensorId);

        // Iniciar temporizador
        this.iniciarTemporizador(sensorId);
    }

    desactivarSensor(habitacion, sensorId) {
        // Desactivar luz visual
        habitacion.classList.remove('luz-encendida');

        // Actualizar estado en tabla
        this.actualizarEstadoTabla(sensorId, 'apagado');

        // Detener temporizador
        this.detenerTemporizador(sensorId);
    }

    enviarDatosSensor(sensor) {
        console.log(`Sensor activado en: ${sensor}`);

        fetch('/api/sensor/encendido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                habitacion: sensor,
                timestamp: new Date().toISOString()
            })
        }).catch(error => {
            console.error('Error enviando datos del sensor:', error);
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

        const start = new Date();
        this.temporizadores[sensorId] = {
            interval: setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now - start) / 1000);
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                span.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            }, 1000),
            startTime: start
        };
    }

    detenerTemporizador(sensorId) {
        const timer = this.temporizadores[sensorId];
        if (timer) {
            clearInterval(timer.interval);
            delete this.temporizadores[sensorId];
        }
    }
}

// =============================================
// MÓDULO: NAVEGACIÓN ENTRE PÁGINAS
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
                this.inicializarFiltroAnalisis();
            });
        }

        // Botón volver
        const btnVolver = document.getElementById('btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', () => {
                this.ocultarSeccion('panel-analisis');
                this.mostrarSeccion('casa1');
            });
        }
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
                    masUsada: "Cocina",
                    promedio: "3m 20s",
                    ultimoUso: "Dormitorio - 2025-05-22 22:15",
                    sinUso: ["Oficina"]
                },
                consumo: {
                    diario: "12.5 kWh",
                    mensual: "352.3 kWh",
                    costo: "$42.276",
                    escalon: 2,
                    bonificacion: "10%",
                    alerta: "89% del límite alcanzado"
                },
                habitos: {
                    franjaActiva: "18:00–22:00",
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

    renderPanelCompleto(casaId) {
        const data = this.dataManager.getDatosCasa(casaId);
        if (!data) return;

        const contenedor = document.getElementById("contenedor-estadisticas");
        if (!contenedor) return;

        contenedor.innerHTML = this.generateCompleteAnalysis(data);
        this.createChart(data.comparativas.porHabitacion);
    }

    renderSeccionAnalisis(seccion) {
        const data = this.dataManager.getDatosCasa(this.casaActual);
        if (!data) return;

        const contenedor = document.getElementById("contenedor-estadisticas");
        if (!contenedor) return;

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
        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>Uso de habitaciones</h3>
                <ul class="lista-analisis">
                    <li><strong>Habitación más usada:</strong> ${usoData.masUsada}</li>
                    <li><strong>Tiempo promedio de uso:</strong> ${usoData.promedio}</li>
                    <li><strong>Último uso:</strong> ${usoData.ultimoUso}</li>
                    <li><strong>Habitaciones sin uso este mes:</strong> ${usoData.sinUso.join(", ") || "Ninguna"}</li>
                </ul>
            </div>
        `;
    }

    renderConsumoSection(contenedor, consumoData) {
        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>Consumo y costos</h3>
                <ul class="lista-analisis">
                    <li><strong>Consumo diario:</strong> ${consumoData.diario}</li>
                    <li><strong>Consumo mensual:</strong> ${consumoData.mensual}</li>
                    <li><strong>Boleta estimada:</strong> ${consumoData.costo}</li>
                    <li><strong>Escalón tarifario:</strong> ${consumoData.escalon}</li>
                    <li><strong>Bonificación aplicada:</strong> ${consumoData.bonificacion}</li>
                    <li><strong>Alerta de consumo:</strong> ${consumoData.alerta}</li>
                </ul>
            </div>
        `;
    }

    renderHabitosSection(contenedor, habitosData) {
        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>Hábitos y horarios</h3>
                <ul class="lista-analisis">
                    <li><strong>Franja horaria más activa:</strong> ${habitosData.franjaActiva}</li>
                    <li><strong>Día más activo:</strong> ${habitosData.diaActivo}</li>
                    <li><strong>Pico horario:</strong> ${habitosData.pico}</li>
                </ul>
            </div>
        `;
    }

    renderComparativasSection(contenedor, comparativasData) {
        const top3 = comparativasData.top3.map(t => `<li>${t.casa} - ${t.consumo}</li>`).join("");
        const porHabitacion = Object.entries(comparativasData.porHabitacion)
            .map(([hab, val]) => `<li>${hab}: ${val} kWh</li>`).join("");

        contenedor.innerHTML = `
            <div class="bloque-analisis">
                <h3>Comparativas</h3>
                <ul class="lista-analisis">
                    <li><strong>Variación mensual:</strong> ${comparativasData.variacion}</li>
                    <li><strong>Top 3 casas:</strong><ul>${top3}</ul></li>
                    <li><strong>Consumo por habitación:</strong><ul>${porHabitacion}</ul></li>
                </ul>
                <canvas id="graficoConsumoHabitaciones" height="250"></canvas>
            </div>
        `;

        setTimeout(() => this.createChart(comparativasData.porHabitacion), 0);
    }

    generateCompleteAnalysis(data) {
        return `
            ${this.renderUsoSection(document.createElement('div'), data.uso)}
            ${this.renderConsumoSection(document.createElement('div'), data.consumo)}
            ${this.renderHabitosSection(document.createElement('div'), data.habitos)}
            ${this.renderComparativasSection(document.createElement('div'), data.comparativas)}
        `;
    }

    createChart(porHabitacionData) {
        const canvas = document.getElementById('graficoConsumoHabitaciones');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(porHabitacionData),
                datasets: [{
                    label: 'Consumo (kWh)',
                    data: Object.values(porHabitacionData),
                    backgroundColor: '#5eb8ff',
                    borderRadius: 8
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
                        ticks: { color: '#cbf7ed' }
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

// =============================================
// TODO: FUNCIONALIDADES PENDIENTES
// =============================================


// TODO: Implementar cálculo de la habitación más usada
// Obtener todas las activaciones agrupadas por habitación
// Contar cantidad de veces que cada habitación fue utilizada
// Devolver la habitación con mayor cantidad de usos o ranking completo

// TODO: Calcular tiempo promedio de uso por habitación
// Sumar duración total de uso por habitación
// Dividir por la cantidad de activaciones de cada habitación
// Mostrar resultado en segundos o minutos promedio

// TODO: Generar reporte de consumo de energía por día, semana y mes
// Agrupar los eventos por fecha (día, semana y mes)
// Sumar el campo de consumo energético (Wh o duración estimada en kWh)
// Devolver estructura para mostrar como gráfico o tabla comparativa

// TODO: Calcular costo estimado de la boleta de luz mensual
// Tomar consumo total mensual por casa
// Multiplicar por tarifa energética definida (ej. $120/kWh)
// Mostrar total estimado en pesos argentinos

// TODO: Determinar franja horaria más activa
// Extraer hora de cada evento
// Agrupar y contar activaciones por hora (0–23)
// Mostrar la hora con mayor cantidad de encendidos por casa o habitación

// TODO: Detectar escalón tarifario alcanzado por cada casa
// Sumar consumo mensual y compararlo contra límites de escalones (ej. 300, 600 kWh)
// Etiquetar el escalón alcanzado: 1, 2 o 3

// TODO: Comparar consumo entre meses consecutivos
// Agrupar consumo por mes
// Calcular variación porcentual con respecto al mes anterior
// Determinar si el consumo subió, bajó o se mantuvo

// TODO: Aplicar bonificación por consumo estable
// Detectar si el consumo actual se mantiene dentro de un margen estable (±5%)
// Si se cumple, aplicar una bonificación del 10% al costo total

// TODO: Emitir alerta si se supera un límite de consumo
// Verificar si el consumo acumulado del mes supera el 90% del límite configurado por el usuario
// Si se cumple, generar un mensaje de alerta (visual o por notificación)

// TODO: Mostrar top 3 casas con mayor consumo
// Agrupar consumo total por casa
// Ordenar de mayor a menor
// Devolver las tres casas con mayor consumo mensual

// TODO: Calcular consumo por casa dividido por habitación
// Agrupar los eventos por casaId y habitacion
// Sumar la energía consumida en cada habitación de cada casa
// Permitir mostrar gráficos comparativos internos por vivienda

// TODO: Detectar hábitos de uso por días de la semana
// Obtener el día (lunes, martes, etc.) de cada activación
// Contar la frecuencia de uso por cada día
// Mostrar los días con mayor y menor consumo por casa

// TODO: Registrar el último uso de cada habitación
// Obtener el último evento registrado para cada habitación
// Mostrar la fecha y hora exacta del último uso
// Útil para mostrar “última actividad” en el panel principal

// TODO: Identificar habitaciones que no se usaron en el mes
// Listar todas las habitaciones por casa
// Filtrar las que no tienen activaciones durante el mes actual
// Mostrar en reporte de inactividad o eficiencia

// TODO: Detectar picos de consumo por hora
// Calcular el total de consumo agrupado por hora del día
// Identificar horas con consumo inusualmente alto respecto al promedio diario
// Útil para alertas o recomendaciones de eficiencia energética



