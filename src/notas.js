const hash = require('object-hash');
const {
  leerNotas,
  guardarNotas,
  respaldarNotas: copiarRespaldo,
  validarCarpetaDestino,
  escribirExportacion,
  moverArchivo,
} = require('./almacen');
const { formatearFechaLarga } = require('./fechas');

function agregarNota(texto, etiqueta) {
  const notas = leerNotas();
  const id = hash(texto).substring(0, 8);

  const repetida = notas.find((nota) => nota.id === id);
  if (repetida) {
    return { ok: false, nota: repetida };
  }

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

function respaldarNotas() {
  return copiarRespaldo();
}

function armarTextoExportacion(notas) {
  const encabezado = `BITÁCORA — exportación generada el ${formatearFechaLarga(Date.now())}\nTotal de notas: ${notas.length}\n`;
  const cuerpo = notas
    .map((n) => `\n[${n.id}] (${n.etiqueta}) ${formatearFechaLarga(n.fecha)}\n  ${n.texto}`)
    .join('\n');
  return `${encabezado}${cuerpo}\n`;
}

function exportarNotas(carpeta) {
  const validacion = validarCarpetaDestino(carpeta);
  if (!validacion.ok) return validacion;

  const notas = leerNotas();
  if (notas.length === 0) {
    return { ok: false, motivo: 'No hay notas para exportar.' };
  }

  const origen = escribirExportacion(armarTextoExportacion(notas));
  const archivo = moverArchivo(origen, validacion.carpeta);
  return { ok: true, archivo, total: notas.length };
}

module.exports = {
  agregarNota,
  listarNotas,
  buscarNotas,
  borrarNota,
  respaldarNotas,
  exportarNotas,
};