const hash = require('object-hash');
const { leerNotas, guardarNotas } = require('./almacen');

function agregarNota(texto, etiqueta) {
  const notas = leerNotas();
  const id = hash(texto).substring(0, 8);

  const repetida = notas.find((nota) => nota.id === id);
  if (repetida) {
    return { ok: false, nota: repetida };
  }

  // Si la etiqueta no viene (o viene vacía), se usa "general"
  const etiquetaFinal = (etiqueta || '').trim() || 'general';
  const nota = { id, texto, etiqueta: etiquetaFinal, fecha: Date.now() };
  notas.push(nota);
  guardarNotas(notas);
  return { ok: true, nota };
}

function listarNotas(cantidad) {
  const notas = leerNotas();
  return notas.slice(-cantidad);
}

function buscarNotas(palabra) {
  const notas = leerNotas();
  const buscada = palabra.toLowerCase();
  return notas.filter((nota) => nota.texto.toLowerCase().includes(buscada));
}

function borrarNota(id) {
  const notas = leerNotas();
  const restantes = notas.filter((nota) => nota.id !== id);
  if (restantes.length === notas.length) {
    return false;
  }
  guardarNotas(restantes);
  return true;
}

module.exports = { agregarNota, listarNotas, buscarNotas, borrarNota };