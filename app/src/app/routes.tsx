import { createBrowserRouter, Outlet } from "react-router";
import { useEffect } from "react";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { Login } from "./components/pages/Login";
import { Conversas } from "./components/pages/Conversas";
import { Contatos } from "./components/pages/Contatos";
import { Relatorios } from "./components/pages/Relatorios";
import { Campanhas } from "./components/pages/Campanhas";
import { Configuracoes } from "./components/pages/Configuracoes";
import { Empresas } from "./components/pages/Empresas";

function ProtectedLayout() {
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      window.location.href = "/login";
    }
  }, [token]);

  if (!token) return null;
  return <Outlet />;
}

export const router = createBrowserRouter([
  { path: "/login", Component: Login },
  {
    element: <ProtectedLayout />,
    children: [
      {
        element: <Layout />,
        children: [
          { index: true, Component: Conversas },
          { path: "contatos", Component: Contatos },
          { path: "relatorios", Component: Relatorios },
          { path: "campanhas", Component: Campanhas },
          { path: "configuracoes", Component: Configuracoes },
          { path: "empresas", Component: Empresas },
        ],
      },
    ],
  },
]);
