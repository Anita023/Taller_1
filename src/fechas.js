function formatearFechaLarga(marca) {
  return new Intl.DateTimeFormat('es-CO', {
    dateStyle: 'full',
    timeStyle: 'long',
  }).format(new Date(marca));
}

function formatearFechaCorta(marca) {
  return new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(marca));
}

module.exports = { formatearFechaLarga, formatearFechaCorta };