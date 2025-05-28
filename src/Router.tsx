import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { Container } from "./pages/Container";
import { NotFound } from "./pages/NotFound";
import { Register } from "./pages/Register";
import { Login } from "./pages/Login";
import { Settings } from "./pages/Settings";

let router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login/>
  },
  {
    path:"/register",
    element: <Register />,
  },
  {path:"/settings",
    element:<Settings/>
  },
  {
    path: "/draw",
    element: <Container />,
  },
  {
    path: "*",
    element: <NotFound />
  },
]);

export const Router = () => {
  return <RouterProvider router={router} />;
};