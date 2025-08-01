import { Button, Form, Card, Typography, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import Input from "antd/es/input/Input";
import { useState, useEffect } from "react";
import { Result } from "antd";
import { Helmet } from "react-helmet";
import { Endpoint } from "../constant/Endpoint";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function AdminLogin({ title }) {
  const [showResult, setShowResult] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") === "true") {
      navigate("/Admin/dashboard");
    }
  }, [navigate]);
  const handleLogin = async (values) => {
    console.log("run");
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}${Endpoint.adminlogin}`,
        {
          User_Name: values.User_Name,
          Password: values.Password,
        }
      );
      if (response.data && response.data.message === "Login successful") {
        message.success("Login successful");
        localStorage.setItem("admin_logged_in", "true");
        navigate("/Admin/dashboard");
      } else {
        setShowResult(true);

        localStorage.removeItem("admin_logged_in");
      }
    } catch (error) {
      setShowResult(true);
      console.log(error);
      localStorage.removeItem("admin_logged_in");
    }
  };
  const handleTryAgain = () => {
    setShowResult(false);
    form.resetFields();
  };
  return (
    <>
      <div className="h-full">
        <Card
          className="app-card"
          style={{
            minWidth: 350,
            maxWidth: 400,
            margin: "0 auto",
          }}
        >
          {showResult ? (
            <Result
              status="error"
              title="Login Failed"
              subTitle="Invalid username or password."
              extra={[
                <Button type="primary" key="tryagain" onClick={handleTryAgain}>
                  Try Again
                </Button>,
              ]}
            />
          ) : (
            <>
              <Title
                level={3}
                className="form-title"
                style={{ marginBottom: 32 }}
              >
                Admin Login
              </Title>
              <Form
                layout="vertical"
                onFinish={handleLogin}
                className="responsive-form"
                form={form}
              >
                <FormItem
                  label="Username"
                  name="User_Name"
                  rules={[
                    { required: true, message: "Please Enter Your Username" },
                  ]}
                >
                  <Input placeholder="Enter your username" size="large" />
                </FormItem>
                <FormItem
                  label="Password"
                  name="Password"
                  rules={[
                    { required: true, message: "Please Enter Your Password" },
                  ]}
                >
                  <Input.Password
                    placeholder="Enter your password"
                    size="large"
                  />
                </FormItem>
                <FormItem>
                  <Button
                    htmlType="submit"
                    type="primary"
                    className="full-width-btn"
                    size="large"
                    style={{ marginTop: 8 }}
                  >
                    Login
                  </Button>
                </FormItem>
              </Form>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

export default AdminLogin;
