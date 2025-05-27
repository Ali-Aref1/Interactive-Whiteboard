import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Home } from "./pages/Home";
import { Container } from "./pages/Container";
import { NotFound } from "./pages/NotFound";
import { Register } from "./pages/Register";

let router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path:"/register",
    element: <Register />,

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