// contact-whatsapp.js
// Send contact form via WhatsApp link

// Init handler on DOM ready
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("contactForm");
  const phone = "5804124327197"; // destination number without +

  if (!form) return;

  // Form submit handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (document.getElementById("name")?.value || "").trim();
    const email = (document.getElementById("email")?.value || "").trim();
    const project = (document.getElementById("project")?.value || "").trim();
    const msg = (document.getElementById("msg")?.value || "").trim();

    // Build message text
    let text = "Nuevo contacto desde LiveMonitor:%0A";
    text += `Nombre: ${encodeURIComponent(name)}%0A`;
    text += `Email: ${encodeURIComponent(email)}%0A`;
    if (project) text += `Proyecto: ${encodeURIComponent(project)}%0A`;
    if (msg) text += `Mensaje: ${encodeURIComponent(msg)}%0A`;

    const url = `https://wa.me/${phone}?text=${text}`;

    // Open WhatsApp link in new tab
    window.open(url, "_blank");

    // Reset form
    form.reset();
  });
});
