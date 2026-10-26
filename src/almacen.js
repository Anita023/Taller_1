const fs = require('fs');
const path = require('path');
const os = require('os');
const { getLongTime } = require('fechas-bitacora-anita023');

const DIR_DATA = path.join(__dirname, '..', 'data');
const DIR_RESPALDOS = path.join(__dirname, '..', 'respaldos');
const DIR_SALIDA = path.join(__dirname, '..', 'salida');
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
  const linea = `${getLongTime('es-ES', Date.now())} | ${comando} | ${resultado}\n`;
  fs.appendFileSync(ARCHIVO_LOG, linea);
}

// ---------- Parte 3: respaldo y exportación ----------

// Copia data/notas.json a respaldos/notas_<marca-de-tiempo>.json
function respaldarNotas() {
  asegurarArchivo();
  if (!fs.existsSync(DIR_RESPALDOS)) {
    fs.mkdirSync(DIR_RESPALDOS, { recursive: true });
  }
  const destino = path.join(DIR_RESPALDOS, `notas_${Date.now()}.json`);
  fs.copyFileSync(ARCHIVO_NOTAS, destino);
  return destino;
}

// Revisa que la carpeta destino sirva. Devuelve { ok, carpeta } o { ok: false, motivo }
function validarCarpetaDestino(carpeta) {
  const destino = carpeta || os.homedir();
  if (!path.isAbsolute(destino)) {
    return { ok: false, motivo: `La ruta "${destino}" no es absoluta. Ejemplo: ${os.homedir()}` };
  }
  if (!fs.existsSync(destino)) {
    return { ok: false, motivo: `La carpeta "${destino}" no existe.` };
  }
  if (!fs.statSync(destino).isDirectory()) {
    return { ok: false, motivo: `"${destino}" no es una carpeta.` };
  }
  return { ok: true, carpeta: destino };
}

// Escribe el texto en salida/exportacion.txt y devuelve la ruta del archivo
function escribirExportacion(texto) {
  if (!fs.existsSync(DIR_SALIDA)) {
    fs.mkdirSync(DIR_SALIDA, { recursive: true });
  }
  const archivo = path.join(DIR_SALIDA, 'exportacion.txt');
  fs.writeFileSync(archivo, texto);
  return archivo;
}

// Mueve un archivo. Si origen y destino están en discos distintos,
// renameSync falla con EXDEV: en ese caso se copia y luego se borra el original.
function moverArchivo(origen, carpetaDestino) {
  const destino = path.join(carpetaDestino, path.basename(origen));
  try {
    fs.renameSync(origen, destino);
  } catch (error) {
    if (error.code !== 'EXDEV') throw error;
    fs.copyFileSync(origen, destino);
    fs.unlinkSync(origen);
  }
  return destino;
}

module.exports = {
  leerNotas,
  guardarNotas,
  registrarAccion,
  respaldarNotas,
  validarCarpetaDestino,
  escribirExportacion,
  moverArchivo,
};