//Casa
document.querySelectorAll('.habitacion').forEach(hab => {
    hab.addEventListener('mouseenter', () => {
        const sensor = hab.dataset.sensor;
        console.log(`Sensor activado en: ${sensor}`);

        fetch('/api/sensor/encendido', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                habitacion: sensor,
                timestamp: new Date().toISOString()
            })
        });
    });
});
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


















const casas = ["casa1.html", "casa2.html", "casa3.html"]; // Casas.html
const currentFile = window.location.pathname.split("/").pop();
const currentFolder = window.location.pathname.split("/").slice(-2, -1)[0]; // Detecta si estás en "Pages"

// Ir al index desde la carpeta "Pages/"
const pathToIndex = currentFolder === "Pages" ? "../index.html" : "index.html";

// Esto ve si estas en la raíz y agrega "Pages/" en caso de que cambies la página
const pathPrefix = currentFolder === "Pages" ? "" : "Pages/";

// Botón siguiente
const btnSiguiente = document.getElementById("btn-siguiente");
if (btnSiguiente) {
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

// Botón anterior
const btnAnterior = document.getElementById("btn-anterior");
if (btnAnterior) {
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
