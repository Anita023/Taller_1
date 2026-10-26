const path = require('path');
const os = require('os');
const hash = require('object-hash');
const { getLongTime, getShortDate } = require('fechas-bitacora-anita023');
const almacen = require('./almacen');

// Cada función devuelve el mensaje que se le mostrará al usuario

function formatearNota(nota) {
  return `[${nota.id}] (${nota.etiqueta}) ${getShortDate('es-ES', nota.fecha)} — ${nota.texto}`;
}

function agregarNota(texto, etiqueta) {
  if (!texto || texto.trim() === '') {
    return 'Debes escribir el texto de la nota. Ejemplo: agregar "Hoy aprendí fs" nodejs';
  }
  if (!etiqueta || etiqueta.trim() === '') {
    etiqueta = 'general';
  }

  const notas = almacen.leerNotas();
  const id = hash(texto).substring(0, 8);

  for (const nota of notas) {
    if (nota.id === id) {
      return `Ya existe una nota igual (id ${id}). No se guardó.`;
    }
  }

  const nuevaNota = { id: id, texto: texto, etiqueta: etiqueta, fecha: Date.now() };
  notas.push(nuevaNota);
  almacen.guardarNotas(notas);
  return `Nota guardada [${id}] (${etiqueta}) — ${getLongTime('es-ES', nuevaNota.fecha)}`;
}

function listarNotas(textoN) {
  let cantidad = 5;
  let aviso = '';

  if (textoN !== undefined) {
    const numero = parseInt(textoN);
    if (isNaN(numero) || numero <= 0) {
      aviso = 'El valor de N no es válido, se usará 5.\n';
    } else {
      cantidad = numero;
    }
  }

  const notas = almacen.leerNotas();
  if (notas.length === 0) {
    return aviso + 'No hay notas guardadas.';
  }

  const ultimas = notas.slice(-cantidad);
  const lineas = [];
  for (const nota of ultimas) {
    lineas.push(formatearNota(nota));
  }
  return aviso + lineas.join('\n');
}

function buscarNotas(palabra) {
  if (!palabra || palabra.trim() === '') {
    return 'Debes indicar una palabra para buscar.';
  }

  const notas = almacen.leerNotas();
  const lineas = [];
  for (const nota of notas) {
    if (nota.texto.toLowerCase().includes(palabra.toLowerCase())) {
      lineas.push(formatearNota(nota));
    }
  }

  if (lineas.length === 0) {
    return `No se encontraron notas con "${palabra}".`;
  }
  return lineas.join('\n');
}

function borrarNota(id) {
  if (!id || id.trim() === '') {
    return 'Debes indicar el id de la nota a borrar.';
  }

  const notas = almacen.leerNotas();
  for (let i = 0; i < notas.length; i++) {
    if (notas[i].id === id) {
      notas.splice(i, 1); // quita 1 elemento en la posición i
      almacen.guardarNotas(notas);
      return `Nota ${id} eliminada.`;
    }
  }
  return `No existe ninguna nota con el id ${id}.`;
}

function respaldarNotas() {
  const ruta = almacen.crearRespaldo();
  return `Respaldo creado: ${ruta}`;
}

function exportarNotas(carpeta) {
  if (!carpeta || carpeta.trim() === '') {
    carpeta = os.homedir(); // por defecto, la carpeta personal
  }
  if (!path.isAbsolute(carpeta)) {
    return `La ruta "${carpeta}" no es absoluta. Ejemplo: ${os.homedir()}. No se movió nada.`;
  }
  if (!almacen.esCarpeta(carpeta)) {
    return `"${carpeta}" no existe o no es una carpeta. No se movió nada.`;
  }

  const notas = almacen.leerNotas();
  if (notas.length === 0) {
    return 'No hay notas para exportar.';
  }

  let texto = `BITÁCORA — exportación generada el ${getLongTime('es-ES', Date.now())}\n`;
  texto += `Total de notas: ${notas.length}\n`;
  for (const nota of notas) {
    texto += `\n[${nota.id}] (${nota.etiqueta}) ${getLongTime('es-ES', nota.fecha)}\n`;
    texto += `  ${nota.texto}\n`;
  }

  const origen = almacen.escribirExportacion(texto);
  const destino = almacen.moverArchivo(origen, carpeta);
  return `Exportadas ${notas.length} nota(s) en ${destino}`;
}

module.exports = {
  agregarNota,
  listarNotas,
  buscarNotas,
  borrarNota,
  respaldarNotas,
  exportarNotas,
};