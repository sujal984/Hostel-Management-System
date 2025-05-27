import { Button, Form, Card, Typography, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import Input from "antd/es/input/Input";
import { useState, useEffect } from "react";
import { Result } from "antd";
import { Link } from "react-router-dom";

import axios from "axios";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

function AdminLogin() {
  const [showResult, setShowResult] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  useEffect(() => {
    if (localStorage.getItem("admin_logged_in") === "true") {
      navigate("/Admin/dashboard");
    }
  }, [navigate]);
  const handleLogin = async (values) => {
    try {
      const response = await axios.post("http://localhost:8000/login/", {
        User_Name: values.User_Name,
        Password: values.Password,
      });
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
      localStorage.removeItem("admin_logged_in");
    }
  };
  const handleTryAgain = () => {
    setShowResult(false);
    form.resetFields();
  };
  return (
    <div className="center-container" style={{ minHeight: "100vh" }}>
      <Card style={{ height: "100%", padding: 32 }}>
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
            <Title level={3} className="form-title">
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
                <Input placeholder="Enter your username" />
              </FormItem>
              <FormItem
                label="Password"
                name="Password"
                rules={[
                  { required: true, message: "Please Enter Your Password" },
                ]}
              >
                <Input.Password placeholder="Enter your password" />
              </FormItem>
              <FormItem>
                <Button
                  htmlType="submit"
                  type="primary"
                  className="full-width-btn"
                >
                  Login
                </Button>
              </FormItem>
              <p style={{ textAlign: "center" }}>
                <Link to="/">User?</Link>
              </p>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
}

export default AdminLogin;
