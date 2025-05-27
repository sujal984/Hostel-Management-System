// import ProtectedRoute from "./components/ProtectedRoute";
// import ReverseProtectedRoute from "./components/ReverseProtectedRoute";
// import { Routes, Route } from "react-router-dom";
// import { ROUTES } from "./constant/ROUTE";
// import Page404 from "./components/Page404";

// import "./App.css";

// function App() {
//   const isAdminLoggedIn = localStorage.getItem("admin_logged_in") === "true";
//   return (
//     <Routes>
//       {Object.values(ROUTES).map((route) => {
//         const Component = route.component;
//         return (
//           // {is}
//           <Route
//             key={route.path}
//             path={route.path}
//             element={
//               route.path === "/Admin/dashboard" ||
//               (route.path.startsWith("/Admin/") &&
//                 route.path !== "/Admin/login") ? (
//                 <ProtectedRoute>
//                   <Component />
//                 </ProtectedRoute>
//               ) : route.path === "/Admin/login" ? (
//                 <Component />
//               ) : (
//                 <Component />
//               )
//             }
//           />
//         );
//       })}

//       <Route path="*" element={<Page404 />} />
//     </Routes>
//   );
// }

// export default App;
import ProtectedRoute from "./components/ProtectedRoute";

import { Routes, Route, Navigate } from "react-router-dom";
import { ROUTES } from "./constant/ROUTE";
import Page404 from "./components/Page404";
import "./App.css";

function App() {
  const isAdminLoggedIn = localStorage.getItem("admin_logged_in") === "true";

  return (
    <Routes>
      {Object.values(ROUTES).map((route) => {
        const Component = route.component;

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
                element={<Component />}
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
                  <Component />
                </ProtectedRoute>
              }
            />
          );
        }

        return (
          <Route key={route.path} path={route.path} element={<Component />} />
        );
      })}

      <Route path="*" element={<Page404 />} />
    </Routes>
  );
}

export default App;
