import ProtectedRoute from "./components/ProtectedRoute";

import { WithHelmet } from "./helper/WithHelmet";
import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constant/ROUTE";
import Page404 from "./components/Page404";
import "./App.css";

function App() {
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in") === "true";

  return (
    <Routes>
      {Object.values(ROUTES).map((route) => {
        const withHelmetComponent = WithHelmet(route.component, route.title);
        const Component = withHelmetComponent;

        // console.log(route.title);

        if (route.path === "/Admin/login") {
          // If logged in and on /Admin/login, redirect manually to dashboard
          if (isAdminLoggedIn) {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Navigate to="/Admin/dashboard" replace />}
              />
            );
          } else {
            return (
              <Route
                key={route.path}
                path={route.path}
                element={<Component title={route.title} />}
              />
            );
          }
        }

        if (
          route.path === "/Admin/dashboard" ||
          (route.path.startsWith("/Admin/") && route.path !== "/Admin/login")
        ) {
          return (
            <Route
              key={route.path}
              path={route.path}
              element={
                <ProtectedRoute>
                  <Component title={route.title} />
                </ProtectedRoute>
              }
            />
          );
        }

        return (
          <Route
            key={route.path}
            path={route.path}
            element={<Component title={route.title} />}
          />
        );
      })}

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default App;
