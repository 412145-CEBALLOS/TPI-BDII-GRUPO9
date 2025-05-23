//Casa
document.querySelectorAll('.habitacion').forEach(hab => {
    hab.addEventListener('mouseenter', () => {
        const sensor = hab.dataset.sensor;
        console.log(`Sensor activado en: ${sensor}`);

        // Enviar evento al backend (simulado)
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
