import { Button, Form, message } from "antd";
import FormItem from "antd/es/form/FormItem";
import Input from "antd/es/input/Input";
import { Endpoint } from "../constant/Endpoint";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function ForgotPassword() {
  const [forgetForm] = Form.useForm();
  const navigate = useNavigate();

  const handleUpdate = async () => {
    try {
      const values = await forgetForm.validateFields();
      const { username, password, confirmpassword } = values;

      if (password !== confirmpassword) {
        message.error("Passwords do not match");
        return;
      }
      const payload = {
        username: username,
        password: password,
      };

      const response = await axios.post(
        `localhost:${Endpoint.forgetpassword}`,
        payload
      );

      message.success(response.data.message);
      forgetForm.resetFields();
      navigate("/Admin/login");
    } catch (error) {
      console.error(error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error("Something went wrong");
      }
    }
  };

  return (
    <>
      <div className="h-screen flex justify-center items-center ">
        <div className=" md:min-w-[400px] !p-5">
          <div className="flex justify-center">
            <img
              src="/ChatGPT Image May 22, 2025, 12_02_14 PM.png"
              className="w-[100px] h-[100px]"
            />
          </div>
          <h1 className="text-4xl text-center font-medium !m-4">
            Forgot Password
          </h1>
          <Form
            layout="vertical"
            onFinish={handleUpdate}
            requiredMark={false}
            form={forgetForm}
          >
            <FormItem
              label="Password"
              name="password"
              rules={[
                { required: true, message: "Please Enter Your Password" },
                {
                  pattern:
                    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/,

                  message: `Password must be at least 8 characters long and contain at least one lowercase, one uppercase, one special character and one number`,
                },
              ]}
            >
              <Input.Password placeholder="Enter your password" size="large" />
            </FormItem>
            <FormItem
              label="Confirm Password"
              name="confirmpassword"
              rules={[
                { required: true, message: "Please Enter Your Password" },
              ]}
            >
              <Input.Password
                placeholder="Enter your password again"
                size="large"
              />
            </FormItem>
            <FormItem>
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                className="!w-full !mt-2"
                // disabled={!payload}
              >
                Update
              </Button>
            </FormItem>
          </Form>
        </div>
      </div>
    </>
  );
}

export default ForgotPassword;
