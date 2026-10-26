# bitacora-cli

Aplicación de consola para llevar una bitácora de lo que aprendes cada día, sin salir de la terminal. Guarda las notas en un archivo, rechaza las notas repetidas, genera respaldos y puede exportarlas a un archivo de texto.

Hecha con Node.js (CommonJS), el módulo nativo `fs`, el paquete `object-hash` y un paquete propio de fechas, `fechas-bitacora-anita023`.

## Instalación

Requiere Node.js 20.12 o superior y npm.

```bash
git clone https://github.com/Anita023/Taller_1.git
cd Taller_1
npm install
```

El paquete de fechas es propio. Mientras no esté publicado en npm, se enlaza en local desde la carpeta del paquete:

```bash
cd ../fechas-bitacora-anita023
npm link
cd ../Taller_1
npm link fechas-bitacora-anita023
```

Si el paquete ya está publicado, basta con `npm install fechas-bitacora-anita023`.

## Comandos

Todos se ejecutan con `npm start -- <comando>`.

| Comando | Qué hace | Ejemplo |
| --- | --- | --- |
| `agregar "<texto>" [etiqueta]` | Guarda una nota. La etiqueta por defecto es `general`. Rechaza notas repetidas. | `npm start -- agregar "Hoy aprendí a usar fs" nodejs` |
| `listar [N]` | Muestra las últimas N notas (por defecto 5). | `npm start -- listar 3` |
| `buscar <palabra>` | Muestra las notas que contienen la palabra, sin distinguir mayúsculas. | `npm start -- buscar fs` |
| `borrar <id>` | Elimina la nota con ese id. | `npm start -- borrar 3d79f3e7` |
| `respaldar` | Copia `data/notas.json` a `respaldos/notas_<marca-de-tiempo>.json`. | `npm start -- respaldar` |
| `exportar [carpeta]` | Genera un `.txt` con todas las notas y lo mueve a una ruta absoluta (por defecto, la carpeta personal). | `npm start -- exportar "C:\Users\ANA MARIA\Desktop"` |
| `ayuda` | Muestra cómo se usa cada comando. También aparece si no se escribe comando o si no existe. | `npm start -- ayuda` |

### Ejemplo de uso

```
$ npm start -- agregar "Hoy aprendí a usar fs" nodejs
Nota guardada [3d79f3e7] (nodejs) — jueves, 22 de octubre de 2026, 10:10:30 GMT-5

$ npm start -- agregar "Hoy aprendí a usar fs" nodejs
Ya existe una nota igual (id 3d79f3e7). No se guardó.

$ npm start -- listar 3
[3d79f3e7] (nodejs) 22/10/2026 — Hoy aprendí a usar fs
```

## Estructura

```
bitacora-cli/
├── src/
│   ├── index.js    # lee los argumentos y decide qué comando ejecutar
│   ├── notas.js    # lógica: agregar, listar, buscar, borrar, respaldar, exportar
│   └── almacen.js  # todo lo que toca fs: notas.json, bitacora.log, respaldos
├── data/           # notas.json y bitacora.log (se crean solos, no van a Git)
├── respaldos/      # copias de notas.json (no va a Git)
├── salida/         # carpeta temporal de exportar (no va a Git)
├── package.json
└── README.md
```

Las fechas las da el paquete propio `fechas-bitacora-anita023`, que antes era `src/fechas.js`.

## Reflexión

**1. ¿Por qué elegiste CommonJS o ES Modules? ¿Qué cambió en tu package.json y en la forma de importar?**

Elegí CommonJS porque mi paquete de fechas también lo es y así todo el proyecto usa el mismo sistema, sin mezclar. En `package.json` quedó `"type": "commonjs"`. Los módulos se importan con `require(...)` y se exportan con `module.exports`, en lugar de `import` y `export`.

**2. `fs`, `object-hash` y fechas (tu paquete) se importan distinto del módulo local `notas.js`. ¿Cuál es la diferencia y cómo decide Node dónde buscar cada uno?**

Un módulo local se importa con una ruta que empieza por `./`, como `require('./notas')`, y Node la busca relativa al archivo que la escribe. Los otros se importan solo por su nombre. Si el nombre es un módulo nativo como `fs`, Node lo toma de su propio núcleo. Si no, lo busca en la carpeta `node_modules`, subiendo por las carpetas padre hasta encontrarlo. `object-hash` está ahí porque lo instalé con npm, y mi paquete de fechas aparece ahí como enlace simbólico gracias a `npm link`.

**3. ¿Por qué `data/notas.json` se resuelve distinto si ejecutas el programa desde otra carpeta?**

Una ruta relativa como `data/notas.json` se interpreta desde la carpeta donde se ejecuta el comando (`process.cwd()`), no desde donde está el archivo. Si ejecuto desde `src/`, buscaría `src/data/notas.json`. Por eso construyo la ruta con `path.join(__dirname, '..', 'data')`, ya que `__dirname` siempre es la carpeta de `almacen.js`, sin importar desde dónde se ejecute.

**4. ¿Por qué `node_modules/` no se sube a Git y cómo recupera otra persona las dependencias?**

`node_modules/` pesa mucho y se puede regenerar, así que subirlo solo llenaría el repositorio. Lo que sí se sube son `package.json` y `package-lock.json`, que dicen qué paquetes y qué versiones se necesitan. Otra persona clona el repositorio y ejecuta `npm install`, que vuelve a descargar todo.

**5. ¿Qué diferencia viste al importar tu paquete CommonJS desde tu proyecto?**

Como mi bitácora también es CommonJS, no vi ninguna diferencia: lo importo con `const { getLongTime, getShortDate } = require('fechas-bitacora-anita023')`, igual que cualquier otro paquete. Si la bitácora fuera ES Modules, habría que usar `import` en lugar de `require`, y Node igualmente carga el paquete CommonJS. Lo más seguro sería importar el objeto completo (`import fechas from '...'`) y sacar las funciones de ahí.