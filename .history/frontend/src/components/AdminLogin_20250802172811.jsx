import { Button, Form, Card, Typography, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import Input from "antd/es/input/Input";
import { useState, useEffect } from "react";
import { Result } from "antd";

import { Endpoint } from "../constant/Endpoint";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../constant/ROUTE";

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
      <div className="h-screen flex justify-center items-center ">
        <div className=" md:min-w-[400px] !p-5">
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
              <div className="flex justify-center">
                <img
                  src="/ChatGPT Image May 22, 2025, 12_02_14 PM.png"
                  className="w-[100px] h-[100px]"
                />
              </div>
              <h1 className="text-4xl text-center font-medium !m-4">
                Admin Login
              </h1>
              <Form
                layout="vertical"
                onFinish={handleLogin}
                requiredMark={false}
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
                  className="relative"
                >
                  <Input.Password
                    placeholder="Enter your password"
                    size="large"
                  />
                  <Button
                    type="link"
                    href={ROUTES.ForgotPassword}
                    className="!absolute top-10 right-0 !pr-0 "
                  >
                    Forgot Password ?
                  </Button>
                </FormItem>
                <FormItem>
                  <Button
                    htmlType="submit"
                    type="primary"
                    size="large"
                    className="!w-full"
                  >
                    Login
                  </Button>
                </FormItem>
              </Form>
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default AdminLogin;
