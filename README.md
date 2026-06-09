# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Estructura del proyecto

- `index.html` - Página principal del proyecto.
- `registro.html` - Formulario de registro/otra vista.
- `registro.css` - Estilos del formulario de registro.
- `server.js` - Servidor backend local.
- `vite.config.js` - Configuración de Vite.
- `package.json` / `package-lock.json` - Dependencias y scripts.
- `musical_group.db` - Archivo de base de datos local.
- `public/` - Recursos estáticos públicos.
- `src/` - Código fuente de la aplicación React.
  - `App.jsx` - Componente raíz de la aplicación.
  - `App.css` - Estilos del componente raíz.
  - `index.css` - Estilos globales.
  - `main.jsx` - Entrada principal de React.
  - `app/`
    - `models/` - Modelos/definiciones de datos.
      - `usuarios.ts`
    - `assets/` - Imágenes y otros activos.
  
  musical-group/
├─ public/
│  └─ (archivos estáticos: iconos, manifest, etc.)
├─ src/
│  ├─ assets/
│  │  ├─ images/
│  │  ├─ fonts/
│  │  └─ styles/
│  ├─ components/
│  │  ├─ Header/
│  │  │  ├─ Header.jsx
│  │  │  └─ Header.css
│  │  ├─ Footer/
│  │  └─ FormRegistro/
│  ├─ pages/
│  │  ├─ Home/
│  │  └─ Registro/
│  ├─ services/
│  │  └─ api.js
│  ├─ models/
│  │  └─ usuarios.ts
│  ├─ hooks/
│  │  └─ useForm.js
│  ├─ utils/
│  │  └─ helpers.js
│  ├─ App.jsx
│  ├─ App.css
│  ├─ index.css
│  └─ main.jsx
├─ server/
│  └─ server.js
├─ db/
│  └─ musical_group.db
├─ registro.html
├─ registro.css
├─ index.html
├─ package.json
├─ vite.config.js
└─ README.md