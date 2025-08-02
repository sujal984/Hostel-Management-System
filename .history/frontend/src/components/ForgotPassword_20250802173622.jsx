import React from "react";

function ForgotPassword() {
  return (
    <>
      <>
        <div className="flex justify-center">
          <img
            src="/ChatGPT Image May 22, 2025, 12_02_14 PM.png"
            className="w-[100px] h-[100px]"
          />
        </div>
        <h1 className="text-4xl text-center font-medium !m-4">Admin Login</h1>
        <Form
          layout="vertical"
          onFinish={handleLogin}
          requiredMark={false}
          form={form}
        >
          <FormItem
            label="Username"
            name="User_Name"
            rules={[{ required: true, message: "Please Enter Your Username" }]}
          >
            <Input placeholder="Enter your username" size="large" />
          </FormItem>
          <FormItem
            label="Password"
            name="Password"
            rules={[{ required: true, message: "Please Enter Your Password" }]}
            className="relative"
          >
            <Input.Password placeholder="Enter your password" size="large" />
            <Button
              type="link"
              href="/forgot"
              className="!absolute top-10 right-0 !pr-0 opacity-70"
            >
              Forgot Password ?
            </Button>
          </FormItem>
          <FormItem>
            <Button
              htmlType="submit"
              type="primary"
              size="large"
              className="!w-full !mt-2"
            >
              Login
            </Button>
          </FormItem>
        </Form>
      </>
    </>
  );
}

export default ForgotPassword;
