import { createRoot } from "react-dom/client";
import { FormProvider } from "./components/FormContext.jsx";
import theme from "./theme.json";
import { ConfigProvider } from "antd";
import "./index.css";
import "./App.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import "@ant-design/v5-patch-for-react-19";
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <ConfigProvider theme={theme}>
      <FormProvider>
        <App />
      </FormProvider>
    </ConfigProvider>
  </BrowserRouter>
);
