const notas = require('./notas');
const almacen = require('./almacen');

const comando = process.argv[2];
const argumento1 = process.argv[3];
const argumento2 = process.argv[4];
// Todo lo que sigue al comando, unido (sirve para frases y rutas con espacios)
const resto = process.argv.slice(3).join(' ');

const ayuda = `Uso: npm start -- <comando> [argumentos]

Comandos:
  agregar "<texto>" [etiqueta]   Guarda una nota (etiqueta por defecto: general)
  listar [N]                     Muestra las últimas N notas (por defecto 5)
  buscar <palabra>               Busca notas que contengan la palabra
  borrar <id>                    Elimina la nota con ese id
  respaldar                      Copia las notas a respaldos/notas_<marca-de-tiempo>.json
  exportar [carpeta]             Exporta las notas a un .txt en una ruta absoluta
                                 (por defecto, tu carpeta personal)
  ayuda                          Muestra esta ayuda`;

let mensaje = '';
let resultado = ''; // resumen corto para la bitácora (si queda vacío se usa el mensaje)

try {
  if (comando === 'agregar') {
    mensaje = notas.agregarNota(argumento1, argumento2);
  } else if (comando === 'listar') {
    mensaje = notas.listarNotas(argumento1);
  } else if (comando === 'buscar') {
    mensaje = notas.buscarNotas(resto);
  } else if (comando === 'borrar') {
    mensaje = notas.borrarNota(argumento1);
  } else if (comando === 'respaldar') {
    mensaje = notas.respaldarNotas();
  } else if (comando === 'exportar') {
    mensaje = notas.exportarNotas(resto);
  } else if (comando === 'ayuda' || comando === undefined) {
    mensaje = ayuda;
    resultado = 'ayuda mostrada';
  } else {
    mensaje = `Comando desconocido: "${comando}".\n\n${ayuda}`;
    resultado = 'comando desconocido, ayuda mostrada';
  }
} catch (error) {
  // Cualquier error (por ejemplo, notas.json dañado) llega aquí
  mensaje = `Error: ${error.message}`;
}

console.log(mensaje);

// Se anota en la bitácora (en una sola línea)
try {
  const nombre = comando || '(ninguno)';
  if (resultado === '') {
    resultado = mensaje.split('\n').join(' / ');
  }
  almacen.escribirLog(nombre, resultado);
} catch (error) {
  console.log(`No se pudo escribir en la bitácora: ${error.message}`);
}