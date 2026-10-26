const fs = require('fs');
const path = require('path');
const { getLongTime } = require('fechas-bitacora-anita023');

// Rutas armadas desde la ubicación de este archivo (no dependen de dónde ejecutes)
const carpetaData = path.join(__dirname, '..', 'data');
const archivoNotas = path.join(carpetaData, 'notas.json');
const archivoLog = path.join(carpetaData, 'bitacora.log');
const carpetaRespaldos = path.join(__dirname, '..', 'respaldos');
const carpetaSalida = path.join(__dirname, '..', 'salida');

// Si no existe la carpeta data o el archivo notas.json, los crea
function crearArchivoSiNoExiste() {
  if (!fs.existsSync(carpetaData)) {
    fs.mkdirSync(carpetaData);
  }
  if (!fs.existsSync(archivoNotas)) {
    fs.writeFileSync(archivoNotas, '[]');
  }
}

function leerNotas() {
  crearArchivoSiNoExiste();
  const texto = fs.readFileSync(archivoNotas, 'utf-8');
  try {
    return JSON.parse(texto);
  } catch (error) {
    throw new Error(`El archivo ${archivoNotas} está dañado. Corrígelo o bórralo para empezar de nuevo.`);
  }
}

function guardarNotas(notas) {
  crearArchivoSiNoExiste();
  fs.writeFileSync(archivoNotas, JSON.stringify(notas, null, 2));
}

// Agrega una línea al final de bitacora.log: fecha | comando | resultado
function escribirLog(comando, resultado) {
  crearArchivoSiNoExiste();
  const linea = `${getLongTime('es-ES', Date.now())} | ${comando} | ${resultado}\n`;
  fs.appendFileSync(archivoLog, linea);
}

// Copia notas.json a respaldos/notas_<marca-de-tiempo>.json
function crearRespaldo() {
  crearArchivoSiNoExiste();
  if (!fs.existsSync(carpetaRespaldos)) {
    fs.mkdirSync(carpetaRespaldos);
  }
  const destino = path.join(carpetaRespaldos, `notas_${Date.now()}.json`);
  fs.copyFileSync(archivoNotas, destino);
  return destino;
}

function esCarpeta(ruta) {
  return fs.existsSync(ruta) && fs.statSync(ruta).isDirectory();
}

// Crea salida/exportacion.txt con el texto y devuelve su ruta
function escribirExportacion(texto) {
  if (!fs.existsSync(carpetaSalida)) {
    fs.mkdirSync(carpetaSalida);
  }
  const archivo = path.join(carpetaSalida, 'exportacion.txt');
  fs.writeFileSync(archivo, texto);
  return archivo;
}

// Mueve el archivo. Si están en discos distintos (error EXDEV), copia y luego borra.
function moverArchivo(origen, carpetaDestino) {
  const destino = path.join(carpetaDestino, path.basename(origen));
  try {
    fs.renameSync(origen, destino);
  } catch (error) {
    if (error.code !== 'EXDEV') {
      throw error;
    }
    fs.copyFileSync(origen, destino);
    fs.unlinkSync(origen);
  }
  return destino;
}

module.exports = {
  leerNotas,
  guardarNotas,
  escribirLog,
  crearRespaldo,
  esCarpeta,
  escribirExportacion,
  moverArchivo,
};