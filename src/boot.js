/*
 * boot.js: el arranque. Es el último archivo del <script>, así que todo lo demás ya está definido.
 * Espera a que carguen las fuentes Andika y Fredoka (para que los textos del lienzo no salgan con otra letra),
 * pero como mucho 2,5 s (sin internet pueden no llegar nunca). Después va a la portada (go('title'))
 * y arranca el bucle de dibujo frame() de adult.js, que ya se repite solo con requestAnimationFrame.
 */
Promise.race([Promise.all([document.fonts.load(`700 100px Andika`),document.fonts.load(`700 100px Fredoka`)]),new Promise(r=>setTimeout(r,2500))]).catch(()=>{}).then(()=>{go('title');requestAnimationFrame(frame)});
