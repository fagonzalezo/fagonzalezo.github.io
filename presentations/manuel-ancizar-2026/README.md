# Lo premiado se repite — diapositivas

Cátedra Manuel Ancízar 2026. Guion (fuente de verdad): `../02-guion.md`. Cómo editar: `AUTHORING.md`.

## Presentar

```
cd 03-slides
python3 -m http.server 8000      # luego abrir http://localhost:8000
```
- **S**: vista del presentador (notas = narración del guion, reloj, siguiente diapositiva).
- **F**: pantalla completa · **Esc**: vista general · flechas / espacio: avanzar.
- Funciona sin red, salvo los videos (Breakout: «DQN Breakout» de DeepMind, y CoastRunners: YouTube). Para una sala sin red,
  descargue los videos y ponga su ruta en `js/config.js` (`VIDEO_LOCAL`).
- Para recortar la charla (50 min): `SKIP` en `js/config.js`, o `?skip=1-07,3-05,5-02,6-02` en la URL.
- `?draft` muestra en rojo las diapositivas con algo por verificar.

## Clics que conviene ensayar
- 1-03 y 1-05: la simulación de MENACE corre sola tras el clic (~25 s y ~11 s).
- 2-04: la fórmula aparece grande en el centro y espera un clic antes de irse a la esquina.
- 4-02: el juego de Shannon, 11 clics (las notas dicen qué muestra cada uno).
- 4-03: el mensaje atraviesa el canal en ~8 s tras el clic.
- 4-06: tres clics: la respuesta «143», la gráfica (la línea se dibuja sola), la frase final.
- 4-07: tres clics: Othello-GPT como caja (jugadas → siguiente jugada), el tablero adentro, la ficha que se voltea y las jugadas que cambian.
- 5-02: cuatro clics, uno por hebra que entra a la cuerda.
- 5-08: las líneas de la terminal aparecen solas al entrar.

## Reconstruir y revisar
```
python3 tools/build.py           # index.html a partir de src/ y js/diagrams/
tools/check.sh                   # desbordes y errores de JavaScript
tools/shoot.sh /tmp/shots        # capturas de todas las diapositivas (estado final)
```
