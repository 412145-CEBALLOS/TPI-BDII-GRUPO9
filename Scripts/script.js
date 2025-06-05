let casa1 = {
    uso: {
        masUsada: null,
        promedio: null,
        ultimoUso: null,
        sinUso: null
    },
    consumo: {
        diario: null,
        mensual: null,
        costo: null,
        escalon: null,
        bonificacion: null,
        alerta: null
    },
    habitos: {
        franjaActiva: null,
        diaActivo: null,
        pico: null
    },
    comparativas: {
        variacion: null,
        top3: null,
        porHabitacion: null
    }
};
let casa2 = {
    uso: {
        masUsada: null,
        promedio: null,
        ultimoUso: null,
        sinUso: null
    },
    consumo: {
        diario: null,
        mensual: null,
        costo: null,
        escalon: null,
        bonificacion: null,
        alerta: null
    },
    habitos: {
        franjaActiva: null,
        diaActivo: null,
        pico: null
    },
    comparativas: {
        variacion: null,
        top3: null,
        porHabitacion: null
    }
};
let casa3 = {
    uso: {
        masUsada: null,
        promedio: null,
        ultimoUso: null,
        sinUso: null
    },
    consumo: {
        diario: null,
        mensual: null,
        costo: null,
        escalon: null,
        bonificacion: null,
        alerta: null
    },
    habitos: {
        franjaActiva: null,
        diaActivo: null,
        pico: null
    },
    comparativas: {
        variacion: null,
        top3: null,
        porHabitacion: null
    }
};

//#region oculto
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

        // Agregar fila a tabla si no existe
        this.agregarFilaTabla(sensorId);

        this.actualizarEstadoTabla(sensorId, 'encendido');

        // Iniciar temporizador
        this.iniciarTemporizador(sensorId);
    }

    desactivarSensor(habitacion, sensorId) {
        const casa = habitacion.closest('.pagina');
        const altura = casa ? casa.dataset.altura || casa.id : null;

        habitacion.classList.remove('luz-encendida');
        this.actualizarEstadoTabla(sensorId, 'apagado');

        // Detener temporizador y obtener duración
        const duracion = this.detenerTemporizador(sensorId);

        // Enviar datos solo si la duración fue mayor a 0
        if (duracion > 0) {
            this.enviarDatosSensor(sensorId, duracion, altura);
        }
    }

    enviarDatosSensor(sensorId, segundos, altura) {
        const alturaCasa = altura;
        const fecha = new Date();

        const dia = String(fecha.getDate()).padStart(2, '0');
        const mes = String(fecha.getMonth() + 1).padStart(2, '0');
        const anio = fecha.getFullYear();
        const fechaFormateada = `${dia}/${mes}/${anio}`;
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
        if (this.temporizadores[sensorId]) return;
        const span = document.getElementById(`timer-${sensorId}`);
        if (!span) return;

        span.textContent = "00:00";
        
        const startTime = new Date();

        this.temporizadores[sensorId] = {
            interval: setInterval(() => {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);
                const min = Math.floor(diff / 60);
                const sec = diff % 60;
                span.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
            }, 1000),
            startTime: startTime,
        };
    }

    detenerTemporizador(sensorId) {
        const timer = this.temporizadores[sensorId];
        if (timer) {
            clearInterval(timer.interval);
            const now = new Date();
            const diff = Math.floor((now - timer.startTime) / 1000);
            delete this.temporizadores[sensorId];
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
        let casaId = '176'; // default

        if (currentFile === 'casa1.html') casaId = '176';
        else if (currentFile === 'casa2.html') casaId = '186';
        else if (currentFile === 'casa3.html') casaId = '199';

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
//#endregion
class DataManager {
    constructor() {
        this.datosPorCasa = {
            casa1: {
                uso: {
                    masUsada: null,
                    promedio: null,
                    ultimoUso: null,
                    sinUso: null
                },
                consumo: {
                    diario: null,
                    mensual: null,
                    costo: null,
                    escalon: 2,
                    bonificacion: "10%", // desde la bd
                    alerta: null
                },
                habitos: {
                    franjaActiva: null,
                    diaActivo: "Miércoles",
                    pico: "3.2 kWh"
                },
                comparativas: {
                    variacion: "+5%",
                    top3: null,
                    porHabitacion: null
                }
            },
            casa2: {
                uso: {
                    masUsada: null,
                    promedio: null,
                    ultimoUso: null,
                    sinUso: null
                },
                consumo: {
                    diario: null,
                    mensual: null,
                    costo: null,
                    escalon: null,
                    bonificacion: "0%",
                    alerta: null
                },
                habitos: {
                    franjaActiva: null,
                    diaActivo: "Lunes",
                    pico: "2.8 kWh"
                },
                comparativas: {
                    variacion: "-3%",
                    top3: null,
                    porHabitacion: null
                }
            },
            casa3: {
                uso: {
                    masUsada: null,
                    promedio: null,
                    ultimoUso: null,
                    sinUso: null
                },
                consumo: {
                    diario: null,
                    mensual: null,
                    costo: null,
                    escalon: null,
                    bonificacion: "0%",
                    alerta: null
                },
                habitos: {
                    franjaActiva: null,
                    diaActivo: "Viernes",
                    pico: "3.7 kWh"
                },
                comparativas: {
                    variacion: "+8%",
                    top3: null,
                    porHabitacion: null
                }
            }
        };
    }

    getDatosCasa(casaId) {
        return this.datosPorCasa[casaId] || null;
    }

    cargarDatos() {
        //#region casa 1
        this.datosPorCasa.casa1.uso.masUsada = casa1.uso.masUsada;
        this.datosPorCasa.casa1.uso.promedio = casa1.uso.promedio;
        this.datosPorCasa.casa1.uso.ultimoUso = casa1.uso.ultimoUso;
        this.datosPorCasa.casa1.uso.sinUso = casa1.uso.sinUso;

        this.datosPorCasa.casa1.consumo.diario = casa1.consumo.diario;
        this.datosPorCasa.casa1.consumo.mensual = casa1.consumo.mensual;
        this.datosPorCasa.casa1.consumo.escalon = casa1.consumo.escalon;
        this.datosPorCasa.casa1.consumo.costo = casa1.consumo.costo;
        this.datosPorCasa.casa1.consumo.alerta = casa1.consumo.alerta;

        this.datosPorCasa.casa1.habitos.franjaActiva = casa1.habitos.franjaActiva;
        this.datosPorCasa.casa1.comparativas.top3 = casa1.comparativas.top3;
        this.datosPorCasa.casa1.comparativas.porHabitacion = casa1.comparativas.porHabitacion;
        console.log(this.datosPorCasa.casa1.comparativas.porHabitacion);
        //#endregion
        //#region casa 2
        this.datosPorCasa.casa2.uso.masUsada = casa2.uso.masUsada;
        this.datosPorCasa.casa2.uso.promedio = casa2.uso.promedio;
        this.datosPorCasa.casa2.uso.ultimoUso = casa2.uso.ultimoUso;
        this.datosPorCasa.casa2.uso.sinUso = casa2.uso.sinUso;

        this.datosPorCasa.casa2.consumo.diario = casa2.consumo.diario;
        this.datosPorCasa.casa2.consumo.mensual = casa2.consumo.mensual;
        this.datosPorCasa.casa2.consumo.escalon = casa2.consumo.escalon;
        this.datosPorCasa.casa2.consumo.costo = casa2.consumo.costo;
        this.datosPorCasa.casa2.consumo.alerta = casa2.consumo.alerta;

        this.datosPorCasa.casa2.habitos.franjaActiva = casa2.habitos.franjaActiva;
        this.datosPorCasa.casa2.comparativas.top3 = casa2.comparativas.top3;
        this.datosPorCasa.casa2.comparativas.porHabitacion = casa2.comparativas.porHabitacion;
        console.log(this.datosPorCasa.casa2.comparativas.porHabitacion);
        //#endregion
        //#region casa 3
        this.datosPorCasa.casa3.uso.masUsada = casa3.uso.masUsada;
        this.datosPorCasa.casa3.uso.promedio = casa3.uso.promedio;
        this.datosPorCasa.casa3.uso.ultimoUso = casa3.uso.ultimoUso;
        this.datosPorCasa.casa3.uso.sinUso = casa3.uso.sinUso;

        this.datosPorCasa.casa3.consumo.diario = casa3.consumo.diario;
        this.datosPorCasa.casa3.consumo.mensual = casa3.consumo.mensual;
        this.datosPorCasa.casa3.consumo.escalon = casa3.consumo.escalon;
        this.datosPorCasa.casa3.consumo.costo = casa3.consumo.costo;
        this.datosPorCasa.casa3.consumo.alerta = casa3.consumo.alerta;

        this.datosPorCasa.casa3.habitos.franjaActiva = casa3.habitos.franjaActiva;
        this.datosPorCasa.casa3.comparativas.top3 = casa3.comparativas.top3;
        this.datosPorCasa.casa3.comparativas.porHabitacion = casa3.comparativas.porHabitacion;
        console.log(this.datosPorCasa.casa3.comparativas.porHabitacion);
        //#endregion
    }

}
//#region oculto 2
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
        const btnFiltrar = document.getElementById('btn-filtrar');
        if (btnFiltrar) {
            btnFiltrar.addEventListener('click', () => {
                this.filtrarPorRangoDeFechas();
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
                <h3>Uso de habitaciones</h3>
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
                <h3>Consumo y costos</h3>
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
                <h3>Hábitos y horarios</h3>
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
                <h3>Comparativas</h3>
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
    filtrarPorRangoDeFechas() {
        const altura = document.getElementById('filtro-casa').value;
        const fechaInicioRaw = document.getElementById('filtro-desde').value;
        const fechaFinRaw = document.getElementById('filtro-hasta').value;

        if (!altura || !fechaInicioRaw || !fechaFinRaw) {
            alert('Completá todos los campos');
            return;
        }

        const fechaInicio = formatearFecha(fechaInicioRaw);
        const fechaFin = formatearFecha(fechaFinRaw);
        
        //NUEVO
        this.cambiarCasaPorAltura(altura);

        const contenedor = document.getElementById("contenedor-estadisticas");
        if (contenedor) {
            contenedor.innerHTML = '<div class="loading">Cargando datos filtrados...</div>';
        }

        getRangoDeFechas(altura, fechaInicio, fechaFin).then(eventos => {
            this.procesarEventosFiltrados(eventos);
        })
            .catch(error => {
                console.error('Error al obtener eventos:', error);

            // Procesar eventos y actualizar gráfico según la tab activa
            const tabActiva = document.querySelector(".tab-btn.activa")?.dataset.seccion || "uso";
            this.actualizarGraficoConEventos(tabActiva, eventos);
        });
    }
    // NUEVA: Procesar eventos filtrados
    procesarEventosFiltrados(eventos) {
        const contenedor = document.getElementById('resultados-analisis');
        if (contenedor) {
            contenedor.style.display = 'block';
            contenedor.style.visibility = 'visible';

            if (!eventos || eventos.length === 0) {
                contenedor.innerHTML = `<p>No se encontraron eventos en ese rango.</p>`;
                // Mostrar datos por defecto
                const tabActiva = document.querySelector(".tab-btn.activa")?.dataset.seccion || "uso";
                this.renderSeccionAnalisis(tabActiva);
                return;
            }
        }

        // Procesar eventos y actualizar gráfico según la tab activa
        const tabActiva = document.querySelector(".tab-btn.activa")?.dataset.seccion || "uso";
        this.actualizarGraficoConEventos(tabActiva, eventos);
    }

    cambiarCasaPorAltura(altura) {
        switch(altura) {
            case '176':
                this.casaActual = 'casa1';
                break;
            case '186':
                this.casaActual = 'casa2';
                break;
            case '199':
                this.casaActual = 'casa3';
                break;
            default:
                this.casaActual = 'casa1';
        }

        // Actualizar el filtro visual
        const filtroCasa = document.getElementById('filtro-casa');
        if (filtroCasa) {
            filtroCasa.value = this.casaActual;
        }
    }

    // Nueva función para actualizar gráficos con eventos filtrados
    actualizarGraficoConEventos(seccion, eventos) {
        const contenedor = document.getElementById("contenedor-estadisticas");
        if (!contenedor) return;

        // Destruir gráficos existentes
        this.destroyExistingCharts();

        switch (seccion) {
            case "uso":
                this.renderUsoFiltrado(contenedor, eventos);
                break;
            case "consumo":
                this.renderConsumoFiltrado(contenedor, eventos);
                break;
            case "habitos":
                this.renderHabitosFiltrado(contenedor, eventos);
                break;
            case "comparativas":
                this.renderComparativasFiltrado(contenedor, eventos);
                break;
        }
    }

// Función para procesar eventos por habitación
    procesarEventosPorHabitacion(eventos) {
        const habitaciones = {};
        eventos.forEach(evento => {
            const sensor = evento.sensor;
            if (!habitaciones[sensor]) {
                habitaciones[sensor] = 0;
            }
            habitaciones[sensor]++;
        });
        return habitaciones;
    }

// Función para procesar eventos por día
    procesarEventosPorDia(eventos) {
        const dias = {};
        eventos.forEach(evento => {
            const fecha = evento.fecha;
            if (!dias[fecha]) {
                dias[fecha] = 0;
            }
            dias[fecha] += parseFloat(evento.segundos) / 3600; // Convertir a horas
        });
        return dias;
    }

// Función para procesar eventos por hora
    procesarEventosPorHora(eventos) {
        const horas = {};
        eventos.forEach(evento => {
            const hora = evento.hora.split(':')[0] + ':00';
            if (!horas[hora]) {
                horas[hora] = 0;
            }
            horas[hora]++;
        });
        return horas;
    }

// Renderizar sección USO con datos filtrados
    renderUsoFiltrado(contenedor, eventos) {
        const habitacionesUso = this.procesarEventosPorHabitacion(eventos);
        const totalEventos = eventos.length;
        const habitacionMasUsada = Object.keys(habitacionesUso).reduce((a, b) =>
            habitacionesUso[a] > habitacionesUso[b] ? a : b);

        contenedor.innerHTML = `
        <div class="bloque-analisis">
            <h3>Uso de habitaciones (Filtrado)</h3>
            <ul class="lista-analisis">
                <li><strong>Total de activaciones:</strong> ${totalEventos}</li>
                <li><strong>Habitación más usada:</strong> ${habitacionMasUsada} (${habitacionesUso[habitacionMasUsada]} veces)</li>
                <li><strong>Habitaciones detectadas:</strong> ${Object.keys(habitacionesUso).length}</li>
            </ul>
            <canvas id="graficoUsoHabitaciones" height="250"></canvas>
        </div>
    `;

        setTimeout(() => this.createUsoChart(habitacionesUso), 0);
    }

// Renderizar sección CONSUMO con datos filtrados
    renderConsumoFiltrado(contenedor, eventos) {
        const consumoPorDia = this.procesarEventosPorDia(eventos);
        const totalHoras = Object.values(consumoPorDia).reduce((a, b) => a + b, 0);
        const promedioKwh = (totalHoras * 0.1).toFixed(2); // Estimación simple

        contenedor.innerHTML = `
        <div class="bloque-analisis">
            <h3>Consumo (Filtrado)</h3>
            <ul class="lista-analisis">
                <li><strong>Total de horas de uso:</strong> ${totalHoras.toFixed(1)} horas</li>
                <li><strong>Consumo estimado:</strong> ${promedioKwh} kWh</li>
                <li><strong>Días con actividad:</strong> ${Object.keys(consumoPorDia).length}</li>
            </ul>
            <canvas id="graficoConsumoSemanal" height="250"></canvas>
        </div>
    `;

        setTimeout(() => this.createConsumoChartFiltrado(consumoPorDia), 0);
    }

// Renderizar sección HÁBITOS con datos filtrados
    renderHabitosFiltrado(contenedor, eventos) {
        const usoPorHora = this.procesarEventosPorHora(eventos);
        const horaMasActiva = Object.keys(usoPorHora).reduce((a, b) =>
            usoPorHora[a] > usoPorHora[b] ? a : b);

        contenedor.innerHTML = `
        <div class="bloque-analisis">
            <h3>🕒 Hábitos y horarios (Filtrado)</h3>
            <ul class="lista-analisis">
                <li><strong>Hora más activa:</strong> ${horaMasActiva} (${usoPorHora[horaMasActiva]} activaciones)</li>
                <li><strong>Total de franjas activas:</strong> ${Object.keys(usoPorHora).length}</li>
            </ul>
            <canvas id="graficoHabitosHorarios" height="250"></canvas>
        </div>
    `;

        setTimeout(() => this.createHabitosChartFiltrado(usoPorHora), 0);
    }

// Renderizar sección COMPARATIVAS con datos filtrados
    renderComparativasFiltrado(contenedor, eventos) {
        const habitacionesUso = this.procesarEventosPorHabitacion(eventos);
        const tiempoPorHabitacion = {};

        // Calcular tiempo total por habitación
        eventos.forEach(evento => {
            const sensor = evento.sensor;
            if (!tiempoPorHabitacion[sensor]) {
                tiempoPorHabitacion[sensor] = 0;
            }
            tiempoPorHabitacion[sensor] += parseFloat(evento.segundos);
        });

        // Convertir a horas y estimar kWh
        Object.keys(tiempoPorHabitacion).forEach(hab => {
            tiempoPorHabitacion[hab] = (tiempoPorHabitacion[hab] / 3600 * 0.1).toFixed(2);
        });

        const habitacionesHtml = Object.entries(tiempoPorHabitacion)
            .map(([hab, kwh]) => `<li>${hab}: ${kwh} kWh</li>`).join("");

        contenedor.innerHTML = `
        <div class="bloque-analisis">
            <h3>Comparativas (Filtrado)</h3>
            <ul class="lista-analisis">
                <li><strong>Consumo estimado por habitación:</strong><ul>${habitacionesHtml}</ul></li>
            </ul>
            <canvas id="graficoConsumoHabitaciones" height="250"></canvas>
        </div>
    `;

        setTimeout(() => this.createComparativasChart(tiempoPorHabitacion), 0);
    }

// Gráfico de consumo adaptado para datos filtrados
    createConsumoChartFiltrado(consumoPorDia) {
        const canvas = document.getElementById('graficoConsumoSemanal');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Ordenar fechas y limitar a últimos 7 días si hay muchos
        const fechasOrdenadas = Object.keys(consumoPorDia).sort();
        const fechasLimitadas = fechasOrdenadas.slice(-7);
        const datosLimitados = fechasLimitadas.map(fecha => consumoPorDia[fecha]);

        this.charts.consumo = new Chart(ctx, {
            type: 'line',
            data: {
                labels: fechasLimitadas,
                datasets: [{
                    label: 'Horas de uso',
                    data: datosLimitados,
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
                            label: ctx => `${ctx.raw.toFixed(1)} horas`
                        }
                    }
                },
                scales: {
                    y: {
                        ticks: {
                            color: '#cbf7ed',
                            callback: function(value) {
                                return value.toFixed(1) + ' h';
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

// Gráfico de hábitos adaptado para datos filtrados
    createHabitosChartFiltrado(usoPorHora) {
        const canvas = document.getElementById('graficoHabitosHorarios');
        if (!canvas || !window.Chart) return;

        const ctx = canvas.getContext('2d');

        // Asegurar que tenemos todas las horas del día
        const horasCompletas = {};
        for (let i = 0; i < 24; i++) {
            const hora = i.toString().padStart(2, '0') + ':00';
            horasCompletas[hora] = usoPorHora[hora] || 0;
        }

        this.charts.habitos = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(horasCompletas),
                datasets: [{
                    label: 'Activaciones por hora',
                    data: Object.values(horasCompletas),
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

}

// =============================================
// INICIALIZACIÓN DE LA APLICACIÓN
// =============================================

class SmartHomeApp {
    constructor() {
        this.dataManager = new DataManager();
        this.dataManager.cargarDatos();
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
//#endregion
document.addEventListener('DOMContentLoaded', async () => {
    //#region casa 1
    casa1.uso.masUsada = await getHabitacionMasUsada(176);
    casa1.uso.promedio = await getTiempoPromedioPorHabitacion(176, casa1.uso.masUsada);
    casa1.uso.ultimoUso = await getUltimaDeteccion(176);
    casa1.uso.sinUso = await getHabitacionesSinUso(176);
    let consumos = await getConsumoPorDiaSemanaYMes(176);
    consumos = sumarConsumoPorTipo(consumos);
    casa1.consumo.diario = consumos.dia/30 + "kWh";
    casa1.consumo.mensual = consumos.mes + "kWh";
    casa1.consumo.costo = await getCostoEstimadoMensual(176, 2025, 6);
    casa1.consumo.costo = "$" + (casa1.consumo.costo * 100);
    const conAlerta = await getConsumoMensualAlerta(176,"06/2025", 21);
    casa1.consumo.alerta = conAlerta.alerta;
    const escalon = await getEscalonTarifario(176,"06/2025");
    casa1.consumo.escalon = Object.values(escalon)[0];
    casa1.habitos.franjaActiva = await getHoraMasActiva(176);
    casa1.comparativas.top3 = await getTop3CasasMayorConsumo();
    const general = await getConsumoCasaHabitacion(176)
    casa1.comparativas.porHabitacion = agruparPorHabitacion(general.porHabitacion);
    //#endregion
    //#region casa 2
    casa2.uso.masUsada = await getHabitacionMasUsada(186);
    casa2.uso.promedio = await getTiempoPromedioPorHabitacion(186, casa2.uso.masUsada);
    casa2.uso.ultimoUso = await getUltimaDeteccion(186);
    casa2.uso.sinUso = await getHabitacionesSinUso(186);
    let consumos2 = await getConsumoPorDiaSemanaYMes(186);
    consumos2 = sumarConsumoPorTipo(consumos2);
    casa2.consumo.diario = consumos2.dia/30 + "kWh";
    casa2.consumo.mensual = consumos2.mes + "kWh";
    casa2.consumo.costo = await getCostoEstimadoMensual(186, 2025, 4);
    casa2.consumo.costo = "$" + (casa2.consumo.costo * 100);
    const conAlerta2 = await getConsumoMensualAlerta(186,"06/2025", 21);
    casa2.consumo.alerta = conAlerta2.alerta;
    const escalon2 = await getEscalonTarifario(186,"06/2025");
    casa2.consumo.escalon = Object.values(escalon2)[0];
    casa2.habitos.franjaActiva = await getHoraMasActiva(186);
    casa2.comparativas.top3 = await getTop3CasasMayorConsumo();
    const general2 = await getConsumoCasaHabitacion(186)
    casa2.comparativas.porHabitacion = agruparPorHabitacion(general2.porHabitacion);
    //#endregion
    //#region casa 3
    casa3.uso.masUsada = await getHabitacionMasUsada(199);
    casa3.uso.promedio = await getTiempoPromedioPorHabitacion(199, casa3.uso.masUsada);
    casa3.uso.ultimoUso = await getUltimaDeteccion(199);
    casa3.uso.sinUso = await getHabitacionesSinUso(199);
    let consumos3 = await getConsumoPorDiaSemanaYMes(199);
    consumos3 = sumarConsumoPorTipo(consumos3);
    casa3.consumo.diario = consumos3.dia/30 + "kWh";
    casa3.consumo.mensual = consumos3.mes + "kWh";
    casa3.consumo.costo = await getCostoEstimadoMensual(199, 2025, 4);
    casa3.consumo.costo = "$" + (casa3.consumo.costo * 100);
    const conAlerta3 = await getConsumoMensualAlerta(199,"04/2025", 1);
    casa3.consumo.alerta = conAlerta3.alerta;
    const escalon3 = await getEscalonTarifario(199,"06/2025");
    casa3.consumo.escalon = Object.values(escalon3)[0];
    casa3.habitos.franjaActiva = await getHoraMasActiva(199);
    casa3.comparativas.top3 = await getTop3CasasMayorConsumo();
    const general3 = await getConsumoCasaHabitacion(199)
    casa3.comparativas.porHabitacion = agruparPorHabitacion(general3.porHabitacion);
    //endregion

    new SmartHomeApp();
});

function agruparPorHabitacion(data) {
    const porHabitaciones = {};

    data.forEach(item => {
        porHabitaciones[item.habitacion] = item.consumo;
    });

    return porHabitaciones;
}

function sumarConsumoPorTipo(consumos) {
    const resultado = {};

    consumos.forEach(item => {
        const tipo = item.tipo;
        const consumo = item.consumo;

        if (!resultado[tipo]) {
            resultado[tipo] = 0;
        }

        resultado[tipo] += consumo;
    });

    return resultado;
}

// habitación más usada
async function getHabitacionMasUsada(altura) {
    try {
        const response = await fetch('http://localhost:8080/api/v1/habitacion-mas-usada/' + altura);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar la habitación`);
        }

        return await response.text();
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

        return await response.text();
    } catch (error) {
        console.error('Error al consultar:', error);
    }
}

async function getConsumoPorDiaSemanaYMes(altura) {
    try {
        const response = await fetch(`http://localhost:8080/api/v1/consumo-dia-semana-mes/`+altura);

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

        return response.text();
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

        return await response.text();
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
//Obtener eventos por rango de fechas
async function getRangoDeFechas(altura, fechaInicio, fechaFin) {
    try {
        const url = `http://localhost:8080/api/v1/rango-fechas/${altura}?fechaInicio=${encodeURIComponent(fechaInicio)}&fechaFin=${encodeURIComponent(fechaFin)}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`Error ${response.status} al consultar el rango de fechas`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error al consultar rango de fechas:', error);
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


function formatearFecha(fechaIso) {
    const [year, month, day] = fechaIso.split("-");
    return `${day}/${month}/${year}`;
}


