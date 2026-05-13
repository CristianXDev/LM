# LM

<img width="1023" height="599" alt="Screenshot_1" src="https://github.com/user-attachments/assets/afeabe5c-1355-4b9a-8578-f1a4e1e7aec3" />

# 💹 LiveMonitor | Seguimiento Financiero en Tiempo Real

**LiveMonitor (LM)** es una plataforma web moderna diseñada para el seguimiento dinámico de indicadores económicos. El sistema permite visualizar de forma limpia y eficiente las tasas de cambio del **Dólar (USD)** y **Euro (EUR)** frente al **Bolívar (VES)**, comparando los valores oficiales del BCV y el mercado paralelo.

**URL del Proyecto:** https://lm-beige-two.vercel.app/

![Estado del Proyecto](https://img.shields.io/badge/Estado-En_Desarrollo-green?style=for-the-badge)
![Versión](https://img.shields.io/badge/Versión-0.2-blue?style=for-the-badge)

---

## 🚀 Características Principales

*   **Monitoreo en Vivo:** Visualización instantánea de tasas cambiarias (USD/EUR) con actualización automática.
*   **Interfaz High-Tech:** Diseño minimalista y moderno con una estética inspirada en interfaces de terminal y analítica de datos.
*   **Indicadores de Tendencia:** Espacio preparado para mostrar la dirección de los cambios en el mercado.
*   **Sección de Contacto Integrada:** Formulario estilizado para captación de leads o consultas técnicas. (Envía datos vía WhatsApp al número del proyecto).
*   **Totalmente Responsivo:** Optimizado para una experiencia fluida tanto en dispositivos móviles como en escritorio.
*   **Chatbot IA:** Asistente integrado (Groq) con chat y soporte de voz. Responde consultas de tasas, puede transcribir audio de entrada y generar respuestas por texto.

---

## 🛠️ Tecnologías Utilizadas

En el frontend se emplearon:

*   **HTML5 & CSS3**
*   **Bootstrap 5**
*   **JavaScript (Vanilla)**
*   **AOS (Animate On Scroll)**
*   **Geist Mono & Geist (fuentes)**
*   **Bootstrap Icons**
*   **Groq IA**
*   **DolarAPI**

---

## 📁 Estructura del Proyecto
```text
LM/
├── css/
│   └── style.css            # Estilos personalizados y variables de diseño
├── js/
│   ├── main.js              # Navbar, animación del canvas y manejadores de UI
│   ├── prices.js            # Obtención y renderizado de tasas
│   ├── chatbot.js           # Chatbot IA (chat + voz, integración con Groq)
│   ├── contact-whatsapp.js  # Formulario -> abre WhatsApp con mensaje prellenado
│   └── (otros scripts)
├── img/
└── index.html
```
---

## 🗺️ Roadmap (Próximamente)

- [ ] **Webhooks:** Integración con Telegram para alertas automáticas.
- [ ] **Histórico de Valoración:** Gráficas interactivas para analizar la evolución de las tasas.
- [ ] **Calculadora:** Conversor de moneda integrado basado en la tasa seleccionada.
- [ ] **Mejoras del Chatbot IA:** Añadir síntesis de voz (Text-to-Speech) para respuestas habladas y refinar los prompts/contexto para mayor precisión.

---

## 👤 Autor

Desarrollado con ❤️ por **CristianXDev**.

*   **LinkedIn:** [cristianxdev](https://www.linkedin.com/in/cristianxdev)

---

> **Nota:** Este proyecto se encuentra en su versión V0.2. Las funcionalidades de analítica histórica y notificaciones están en planificación; el chatbot IA y la integración de contacto vía WhatsApp ya se han añadido en el frontend.
