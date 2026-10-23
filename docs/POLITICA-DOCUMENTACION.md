# Política de documentación

**Regla general: ningún cambio está terminado hasta que está documentado.** Vale para todos los que tocan el proyecto: personas y Claude. Un cambio sin su documentación no se publica.

El objetivo es que cualquier programador, también uno que empieza, pueda abrir el proyecto en cualquier momento y entender cómo está hecho y cómo añadir cosas, sin tener que preguntar a nadie.

## 1. Qué hay que documentar en cada cambio

### 1.1. En el código (siempre)

1. **Cabecera de cada función nueva o modificada.** Justo encima de la función, un comentario en castellano que diga:
   - qué hace y para qué sirve;
   - qué recibe (cada parámetro) y qué devuelve;
   - si escribe en el estado guardado `S`, en qué campos;
   - quién la llama o desde dónde se usa, si no es evidente.

   Ejemplo:
   ```js
   // zoneOpen(z): ¿está abierta la zona z? El jardín y las zonas sin edad siempre. Bosque/montaña: si está el
   // modo libre (S.unlockAll) o la edad del niño llega (ZAGE[z] <= AGE()); si no, cuando la zona anterior está
   // abierta y tiene 6 flores. No escribe en S.
   function zoneOpen(z){...}
   ```
2. **Comentarios dentro de la función cuando la lógica es compleja**: cálculos 3D, reglas de qué está abierto, temporizadores, cosas que se hacen en un orden concreto por algún motivo. Explica **por qué**, no repitas lo que ya dice el código.
3. **Cabecera del archivo** (`/* ... */` o `//` al principio de cada `.js`): si el cambio añade globales que usan otros archivos, nuevas dependencias o una parte nueva del archivo, actualízala.
4. **Los comentarios tienen que decir la verdad.** Si cambias lo que hace una función, cambia su comentario en el mismo commit. Si borras código, borra sus comentarios. Un comentario equivocado es peor que ninguno.
5. Los métodos de objetos (por ejemplo `draw()`, `tap()` de una escena o los componentes de juegos) siguen la misma regla aunque la comprobación automática no los mire.

### 1.2. En `docs/` (según lo que cambies)

| Si cambias... | Actualiza |
|---|---|
| Cómo está organizado el código: un archivo nuevo, el orden de `build.sh`, una capa o envoltura nueva, el flujo del niño, la capa 3D | [ARQUITECTURA.md](ARQUITECTURA.md) |
| La forma de añadir algo (objeto 3D, tema, juego, componente, cuento, dibujo, tienda, escena, zona de adultos) o el proceso de montar, probar y publicar | [COMO-AGREGAR.md](COMO-AGREGAR.md) (su receta) |
| Un campo nuevo o distinto del estado guardado `S` | [ESTADO-GUARDADO.md](ESTADO-GUARDADO.md) (tabla de campos, con su valor por defecto) |
| Cómo habla Tito o el proceso de grabar voces | [VOCES.md](VOCES.md) |
| Diálogos nuevos o cambiados de `say()` | `dialogos/pendientes.txt` (una por línea, texto exacto) y el catálogo `dialogos/todos.csv` (`python3 herramientas/voces/dialogos.py`). Ver [dialogos/LEEME.md](../dialogos/LEEME.md) |
| Arreglas un fallo de la lista, o encuentras uno que no arreglas | [PROBLEMAS-CONOCIDOS.md](PROBLEMAS-CONOCIDOS.md) (quítalo o añádelo) |
| Una herramienta, una prueba o un comando nuevo | El README y la sección del proceso en COMO-AGREGAR.md |
| Una regla de trabajo nueva | `CLAUDE.md` y esta política |

Si ninguna fila encaja pero un programador nuevo necesitaría saberlo, escríbelo en el documento donde lo buscaría primero.

### 1.3. En el registro de cambios (cada vez que se publica)

Cada versión publicada (cada vez que sube `VER`) añade una entrada **arriba del todo** de [CAMBIOS.md](CAMBIOS.md):

```md
## v1.N (AAAA-MM-DD)
- Qué cambia para el niño o la familia, en una frase sencilla.
- Qué cambia por dentro (archivos y funciones principales), si es útil para otro programador.
- Frases nuevas pendientes de grabar, si las hay.
```

### 1.4. En el commit

El mensaje del commit dice qué cambia y por qué, en castellano. Si es una versión publicada, empieza por la versión (`v1.580: ...`).

## 2. Cómo se comprueba

Antes de cada commit:

1. **Comprobación automática de comentarios**:
   ```sh
   python3 tests/comentarios.py
   ```
   Revisa que cada `.js` de `src/` tenga cabecera de archivo y que cada función escrita al principio de una línea tenga un comentario encima. Tiene que terminar con `TODO BIEN`. Para que se ejecute sola en cada commit, actívala una vez en tu copia del repo:
   ```sh
   git config core.hooksPath herramientas/git-hooks
   ```
   (Con eso, `git commit` se para si falta un comentario o si cambias `src/` sin tocar ningún documento. Si de verdad el cambio no necesita documentación, puedes saltártelo con `git commit --no-verify`, pero explícalo en el mensaje del commit.)
2. **Repaso a mano con la lista** (la misma está en la plantilla de los pull requests, `.github/pull_request_template.md`):
   - [ ] Cada función nueva o cambiada tiene su comentario de cabecera, y es correcto.
   - [ ] La lógica complicada lleva comentarios dentro.
   - [ ] Los comentarios de lo que he cambiado o borrado siguen siendo verdad.
   - [ ] He actualizado los documentos de `docs/` que tocan (tabla 1.2).
   - [ ] He apuntado los diálogos nuevos o cambiados en `dialogos/pendientes.txt` y he rehecho `dialogos/todos.csv`.
   - [ ] Si publico: he subido `VER` y he añadido la entrada en `docs/CAMBIOS.md`.

## 3. Estilo

- Castellano de España, frases cortas y sencillas. Escribe para alguien que no conoce el proyecto.
- Explica el porqué ("se hace así porque…") y los avisos ("ojo: si cambias esto, también…").
- Nombra las cosas como en el código (`S.flowers`, `finishGame`, `world3d.js`) para que se puedan buscar con `grep`.
- No hace falta comentar lo obvio (`i++`), pero ante la duda, comenta.
