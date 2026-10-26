const fs = require('fs');
const path = require('path');
const { formatearFechaLarga } = require('./fechas');

const DIR_DATA = path.join(__dirname, '..', 'data');
const ARCHIVO_NOTAS = path.join(DIR_DATA, 'notas.json');
const ARCHIVO_LOG = path.join(DIR_DATA, 'bitacora.log');

function asegurarArchivo() {
  if (!fs.existsSync(DIR_DATA)) {
    fs.mkdirSync(DIR_DATA, { recursive: true });
  }
  if (!fs.existsSync(ARCHIVO_NOTAS)) {
    fs.writeFileSync(ARCHIVO_NOTAS, '[]');
  }
}

function leerNotas() {
  asegurarArchivo();
  const contenido = fs.readFileSync(ARCHIVO_NOTAS, 'utf8');
  try {
    const notas = JSON.parse(contenido);
    if (!Array.isArray(notas)) throw new Error('No es un arreglo');
    return notas;
  } catch (error) {
    throw new Error(
      `El archivo ${ARCHIVO_NOTAS} está dañado. Corrígelo o bórralo para empezar de nuevo.`
    );
  }
}

function guardarNotas(notas) {
  asegurarArchivo();
  fs.writeFileSync(ARCHIVO_NOTAS, JSON.stringify(notas, null, 2));
}

function registrarAccion(comando, resultado) {
  asegurarArchivo();
  const linea = `${formatearFechaLarga(Date.now())} | ${comando} | ${resultado}\n`;
  fs.appendFileSync(ARCHIVO_LOG, linea);
}

module.exports = { leerNotas, guardarNotas, registrarAccion };