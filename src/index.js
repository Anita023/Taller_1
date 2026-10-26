const { agregarNota, listarNotas, buscarNotas, borrarNota } = require('./notas');
const { registrarAccion } = require('./almacen');
const { formatearFechaLarga, formatearFechaCorta } = require('./fechas');

const [comando, ...argumentos] = process.argv.slice(2);

const TEXTO_AYUDA = `Uso: npm start -- <comando> [argumentos]

Comandos:
  agregar "<texto>" [etiqueta]   Guarda una nota (etiqueta por defecto: general)
  listar [N]                     Muestra las últimas N notas (por defecto 5)
  buscar <palabra>               Busca notas que contengan la palabra
  borrar <id>                    Elimina la nota con ese id
  ayuda                          Muestra esta ayuda`;

function formatearNota(nota) {
  return `[${nota.id}] (${nota.etiqueta}) ${formatearFechaCorta(nota.fecha)} — ${nota.texto}`;
}

// Cada caso devuelve { mensaje, resultado }:
//   mensaje   -> lo que se le muestra al usuario
//   resultado -> resumen de una sola línea para data/bitacora.log
function ejecutar() {
  switch (comando) {
    case 'agregar': {
      const texto = (argumentos[0] || '').trim();
      const etiqueta = argumentos[1];
      if (!texto) {
        const mensaje = 'Debes escribir el texto de la nota. Ejemplo: agregar "Hoy aprendí fs" nodejs';
        return { mensaje, resultado: 'texto vacío, no se guardó' };
      }
      const { ok, nota } = agregarNota(texto, etiqueta);
      const mensaje = ok
        ? `Nota guardada [${nota.id}] (${nota.etiqueta}) — ${formatearFechaLarga(nota.fecha)}`
        : `Ya existe una nota igual (id ${nota.id}). No se guardó.`;
      const resultado = ok ? `nota guardada [${nota.id}]` : `duplicada de [${nota.id}], no se guardó`;
      return { mensaje, resultado };
    }

    case 'listar': {
      let cantidad = parseInt(argumentos[0]);
      let aviso = '';
      if (argumentos[0] === undefined) {
        cantidad = 5;
      } else if (isNaN(cantidad) || cantidad <= 0) {
        cantidad = 5;
        aviso = 'El valor de N no es válido, se usará 5.\n';
      }
      const notas = listarNotas(cantidad);
      const nota = aviso ? ' (N inválido, se usó 5)' : '';
      if (notas.length === 0) {
        return { mensaje: `${aviso}No hay notas guardadas.`, resultado: `0 notas mostradas${nota}` };
      }
      return {
        mensaje: aviso + notas.map(formatearNota).join('\n'),
        resultado: `${notas.length} nota(s) mostradas${nota}`,
      };
    }

    case 'buscar': {
      const palabra = argumentos.join(' ').trim();
      if (!palabra) {
        return { mensaje: 'Debes indicar una palabra para buscar.', resultado: 'sin palabra' };
      }
      const notas = buscarNotas(palabra);
      if (notas.length === 0) {
        return { mensaje: `No se encontraron notas con "${palabra}".`, resultado: `0 coincidencias para "${palabra}"` };
      }
      return {
        mensaje: notas.map(formatearNota).join('\n'),
        resultado: `${notas.length} coincidencia(s) para "${palabra}"`,
      };
    }

    case 'borrar': {
      const id = (argumentos[0] || '').trim();
      if (!id) {
        return { mensaje: 'Debes indicar el id de la nota a borrar.', resultado: 'sin id' };
      }
      const borrada = borrarNota(id);
      return borrada
        ? { mensaje: `Nota ${id} eliminada.`, resultado: `nota [${id}] eliminada` }
        : { mensaje: `No existe ninguna nota con el id ${id}.`, resultado: `id [${id}] inexistente` };
    }

    case 'ayuda':
      return { mensaje: TEXTO_AYUDA, resultado: 'ayuda mostrada' };

    case undefined:
      return { mensaje: TEXTO_AYUDA, resultado: 'sin comando, ayuda mostrada' };

    default:
      return {
        mensaje: `Comando desconocido: "${comando}".\n\n${TEXTO_AYUDA}`,
        resultado: 'comando desconocido, ayuda mostrada',
      };
  }
}

// La bitácora nunca debe ser la causa de que el programa se rompa
function anotarEnLog(nombre, resultado) {
  try {
    registrarAccion(nombre, resultado);
  } catch (error) {
    console.log(`No se pudo escribir en la bitácora: ${error.message}`);
  }
}

try {
  const { mensaje, resultado } = ejecutar();
  console.log(mensaje);
  anotarEnLog(comando || '(ninguno)', resultado);
} catch (error) {
  console.log(`Error: ${error.message}`);
  anotarEnLog(comando || '(ninguno)', `error: ${error.message}`);
}