# Base Portfolio — Jeremías Gutiérrez

Portafolio personal construido con HTML, CSS y JavaScript puro (sin frameworks ni paso de build).
El contenido de la página se carga en tiempo de ejecución desde dos archivos JSON:

- `info.json` — perfil, textos del sitio, herramientas, contacto y footer.
- `projects.json` — proyectos destacados, como un arreglo de objetos.

## Desarrollo local

Como el sitio usa `fetch()` para leer los `.json`, el navegador bloquea esa lectura si abres
`index.html` directamente (protocolo `file://`). Sirve la carpeta con cualquier servidor estático:

```bash
npx serve .
# o la extensión "Live Server" de VS Code
```

## Publicación en GitHub Pages

Este repo no requiere build ni dependencias: es HTML/CSS/JS estático y GitHub Pages lo sirve tal cual.

1. En GitHub, ve a **Settings → Pages**.
2. En **Build and deployment → Source**, selecciona **Deploy from a branch**.
3. Elige la rama **main** y la carpeta **/ (root)**.
4. Guarda. El sitio quedará publicado en `https://jeremias0711.github.io/Base-Portfolio-/`.

El archivo `.nojekyll` evita que GitHub procese el sitio con Jekyll, para que se sirvan los archivos
tal como están.
