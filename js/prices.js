const CACHE_KEY = 'dolar_data_cache';
const CACHE_TIME = 10 * 60 * 1000; // 10 minutos en milisegundos

async function fetchData(){

    // 1. Intentar obtener datos del caché
    const cached = localStorage.getItem(CACHE_KEY);
    const now = Date.now();

    if (cached){

        const parsedCache = JSON.parse(cached);

        // Si el caché tiene menos de 10 minutos, usarlo
        if (now - parsedCache.timestamp < CACHE_TIME) {
            console.log("Usando datos de caché");
            renderUI(parsedCache.data);
            return;
        }
    }

    // 2. Si no hay caché o expiró, hacer las peticiones
    console.log("Solicitando nuevos datos a la API...");

    try{

        const urls = [
            'https://ve.dolarapi.com/v1/dolares/oficial',
            'https://ve.dolarapi.com/v1/dolares/paralelo',
            'https://ve.dolarapi.com/v1/euros/oficial',
            'https://ve.dolarapi.com/v1/euros/paralelo'
        ];

        const [uOfi, uPara, eOfi, ePara] = await Promise.all(
            urls.map(url => fetch(url).then(res => res.json()))
            );

        const allData = { uOfi, uPara, eOfi, ePara };

        // 3. Guardar en localStorage con el timestamp actual
        localStorage.setItem(CACHE_KEY, JSON.stringify({
            timestamp: now,
            data: allData
        }));

        renderUI(allData);

    } catch (error){

        console.error("Error al obtener datos:", error);
    }
}

function renderUI(data){

    //Formatear y mostrar USD
    updateElement('usd-oficial', data.uOfi);
    updateElement('usd-paralelo', data.uPara);

    //Formatear y mostrar EUR
    updateElement('eur-oficial', data.eOfi);
    updateElement('eur-paralelo', data.ePara);
}

function updateElement(id, info){

    const valEl = document.getElementById(id);
    const trendContainer = document.getElementById(`trend-${id}`);

    if (valEl && info){

        valEl.textContent = `${info.promedio.toFixed(2)} Bs`;

        if (trendContainer) {
            const textSpan = trendContainer.querySelector('.mono');
            trendContainer.classList.remove('trend-up', 'trend-down', 'trend-neutral');

            if (info.cambio > 0) {
                trendContainer.classList.add('trend-up');
                textSpan.textContent = `▲ ${info.porcentaje}%`;
            } else if (info.cambio < 0) {
                trendContainer.classList.add('trend-down');
                textSpan.textContent = `▼ ${Math.abs(info.porcentaje)}%`;
            } else {
                trendContainer.classList.add('trend-neutral');
                textSpan.textContent = 'Estable';
            }
        }
    }
}

//Iniciar carga
document.addEventListener('DOMContentLoaded', fetchData);