# React + Vite

## API & auth (cookies)

- Set **`VITE_API_URL`** (see `.env.example`) — requests use **`${VITE_API_URL}/api`**.
- The shared Axios client (`src/services/apiClient.js`) uses **`withCredentials: true`** so **httpOnly** session cookies from login/register are sent on **login, register, profile, logout, leads, payments**, etc.
- If the backend also returns a JWT in JSON, it is still saved under **`localStorage`** (`token`) and sent as **`Authorization: Bearer`** when present.
- Your API must allow credentials in CORS: **`Access-Control-Allow-Credentials: true`** and **`Access-Control-Allow-Origin`** set to your app origin (e.g. `http://localhost:5173`), not `*`.

---

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
