// script.js
// Lógica para cargar profesionales desde professionals.json,
// filtrar por especialidad y mostrar botones de contacto por WhatsApp.

const PROFESSIONALS_JSON_PATH = "./professionals.json";

/**
 * Estado en memoria de los profesionales.
 * @type {Array<{name: string, specialty: string, whatsapp: string, note?: string, highlights?: string[]}>}
 */
let allProfessionals = [];

document.addEventListener("DOMContentLoaded", () => {
  const specialtySelect = document.getElementById("specialtySelect");
  const professionalsList = document.getElementById("professionalsList");
  const statusMessage = document.getElementById("statusMessage");

  if (!specialtySelect || !professionalsList || !statusMessage) return;

  // Cargar datos iniciales
  loadProfessionals()
    .then((professionals) => {
      allProfessionals = professionals;
      // Render inicial con todas las especialidades
      renderProfessionals("all", professionalsList, statusMessage);
    })
    .catch((error) => {
      console.error("Error al cargar professionals.json:", error);
      statusMessage.textContent =
        "No pudimos cargar el listado de profesionales. Por favor, intentá nuevamente más tarde.";
    });

  // Escuchar cambios en el select de especialidad
  specialtySelect.addEventListener("change", () => {
    const selectedValue = specialtySelect.value;
    renderProfessionals(selectedValue, professionalsList, statusMessage);
  });
});

/**
 * Carga el archivo JSON con el listado de profesionales.
 * Devuelve una promesa con un array de profesionales.
 */
async function loadProfessionals() {
  const response = await fetch(PROFESSIONALS_JSON_PATH, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error("El formato de professionals.json no es un array.");
  }

  // Orden alfabético por nombre
  const sorted = [...data].sort((a, b) =>
    a.name.localeCompare(b.name, "es", { sensitivity: "base" })
  );

  return sorted;
}

/**
 * Renderiza la lista de profesionales en función de la especialidad seleccionada.
 * @param {string} specialty
 * @param {HTMLElement} container
 * @param {HTMLElement} statusElement
 */
function renderProfessionals(specialty, container, statusElement) {
  container.innerHTML = "";

  const filtered =
    specialty === "all"
      ? allProfessionals
      : allProfessionals.filter((p) => p.specialty === specialty);

  if (!filtered.length) {
    statusElement.textContent =
      "Por ahora no encontramos profesionales para esta especialidad. Probá elegir \"Todas las especialidades\" o volvé a intentar más tarde.";
    statusElement.classList.add("status-message--empty");
    return;
  }

  statusElement.textContent = `${filtered.length} profesional${
    filtered.length > 1 ? "es" : ""
  } encontrado${filtered.length > 1 ? "s" : ""}.`;
  statusElement.classList.remove("status-message--empty");

  filtered.forEach((professional) => {
    const card = createProfessionalCard(professional);
    container.appendChild(card);
  });
}

/**
 * Crea el elemento de card de un profesional.
 * @param {{name: string, specialty: string, whatsapp: string, note?: string, highlights?: string[]}} professional
 * @returns {HTMLDivElement}
 */
function createProfessionalCard(professional) {
  const card = document.createElement("article");
  card.className = "professional-card";

  const header = document.createElement("div");
  header.className = "professional-header";

  const nameEl = document.createElement("h2");
  nameEl.className = "professional-name";
  nameEl.textContent = professional.name;

  const specialtyEl = document.createElement("p");
  specialtyEl.className = "professional-specialty";
  specialtyEl.textContent = professional.specialty;

  header.appendChild(nameEl);
  header.appendChild(specialtyEl);

  card.appendChild(header);

  if (Array.isArray(professional.highlights) && professional.highlights.length) {
    const listEl = document.createElement("ul");
    listEl.className = "professional-highlights";

    professional.highlights.forEach((item) => {
      const li = document.createElement("li");
      li.textContent = item;
      listEl.appendChild(li);
    });

    card.appendChild(listEl);
  } else if (professional.note) {
    const noteEl = document.createElement("p");
    noteEl.className = "professional-extra";
    noteEl.textContent = professional.note;
    card.appendChild(noteEl);
  }

  const actions = document.createElement("div");
  actions.className = "professional-actions";

  const whatsappLink = document.createElement("a");
  whatsappLink.className = "whatsapp-button";
  whatsappLink.href = buildWhatsAppLink(professional);
  whatsappLink.target = "_blank";
  whatsappLink.rel = "noopener noreferrer";
  whatsappLink.setAttribute(
    "aria-label",
    `Contactar a ${professional.name} por WhatsApp`
  );

  const iconSpan = document.createElement("span");
  iconSpan.textContent = "🟢";

  const textSpan = document.createElement("span");
  textSpan.textContent = "Contactar por WhatsApp";

  whatsappLink.appendChild(iconSpan);
  whatsappLink.appendChild(textSpan);

  actions.appendChild(whatsappLink);
  card.appendChild(actions);

  return card;
}

/**
 * Construye el link de WhatsApp con un mensaje prellenado.
 * @param {{name: string, specialty: string, whatsapp: string}} professional
 * @returns {string}
 */
function buildWhatsAppLink(professional) {
  const baseUrl = "https://wa.me/";
  const phone = professional.whatsapp.replace(/[^0-9]/g, "");

  const text = `Hola ${professional.name}, te contacto desde el link de Instagram de Policonsultorios De la Quintana por una consulta de ${professional.specialty}.`;
  const encodedText = encodeURIComponent(text);

  return `${baseUrl}${phone}?text=${encodedText}`;
}


