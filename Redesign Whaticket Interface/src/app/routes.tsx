import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Login } from "./components/pages/Login";
import { Conversas } from "./components/pages/Conversas";
import { Contatos } from "./components/pages/Contatos";
import { Relatorios } from "./components/pages/Relatorios";
import { Campanhas } from "./components/pages/Campanhas";
import { Configuracoes } from "./components/pages/Configuracoes";

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Conversas },
      { path: "contatos", Component: Contatos },
      { path: "relatorios", Component: Relatorios },
      { path: "campanhas", Component: Campanhas },
      { path: "configuracoes", Component: Configuracoes },
    ],
  },
]);
