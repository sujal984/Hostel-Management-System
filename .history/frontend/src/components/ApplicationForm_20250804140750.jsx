import {
  DatePicker,
  Form,
  Input,
  Button,
  Select,
  Typography,
  message,
  Result,
} from "antd";
import { useFormContext } from "./FormContext";
import { useState } from "react";
import StepForms from "./StepForms";

import dayjs from "dayjs";

import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { Endpoint } from "../constant/Endpoint";

function ApplicationForm({ title }) {
  const [stepNo, setStepNo] = useState(0);

  const { formData, setFormData, resetForm } = useFormContext();
  const [enddt, setEnddt] = useState("empty");
  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [errMessage, setErrMessage] = useState(null);
  const [showResult, setShowResult] = useState(null);
  const navigate = useNavigate();

  const today = dayjs();
  const maxDate = today.subtract(18, "year");

  const disabledDate = (current) => {
    return !current || current > today;
  };
  const Continue = (values) => {
    setFormData((prev) => ({ ...prev, ...values }));
    setStepNo(stepNo + 1);
  };

  const prev = () => {
    setStepNo(stepNo - 1);
    setTimeout(() => {
      form1.setFieldsValue(formData);
      form2.setFieldsValue(formData);
      form3.setFieldsValue(formData);
    }, 0);
  };
  const reset = () => {
    form1.resetFields();
    form2.resetFields();
    form3.resetFields();
    resetForm();
    setStepNo(0);
  };

  const handleSubmit = async () => {
    try {
      const values1 = await form1.validateFields();
      const values2 = await form2.validateFields();
      const values3 = await form3.validateFields();

      const { id, room_number, status, ...filteredFormData } = formData;
      const {
        id: vId,
        room_number: vRoom,
        status: vStatus,
        ...filteredValues
      } = { ...values1, ...values2, ...values3 };

      const payload = { ...filteredFormData, ...filteredValues };
      await axios.post(
        `${import.meta.env.VITE_API_URL}${Endpoint.submitapplication}`,
        payload
      );

      message.success("Application Submitted successfully");
      setShowResult("success");
    } catch (error) {
      setShowResult("error");
      if (
        error.response &&
        error.response.data &&
        error.response.data.detail &&
        error.response.data.detail.includes("Application already exists")
      ) {
        message.error("Application already exists with this email or number");
        setErrMessage("Application already exists with this email or number");
      } else if (error.response) {
        message.error(error.response.data.message || "Submission failed.");
        setErrMessage("Submission failed.");
      } else if (error.request) {
        message.error("No response received from server.");
        setErrMessage("No response received from server.");
      } else {
        message.error("Error submitting form.");
        console.log(error);
        setErrMessage("Error submitting form.");
      }
    }
  };
  console.log(import.meta.env.VITE_API_URL);
  const handletryagain = () => {
    reset();
    setFormData({});
    setShowResult(null);
  };
  return (
    <>
      <div className="container !mx-auto flex justify-center self-center h-screen">
        <div className="flex justify-center flex-col max-w-[450px] !p-5">
          <Form.Provider>
            {showResult === "success" && (
              <Result
                status="success"
                style={{ height: "100%" }}
                title="Application Submitted Successfully"
                extra={[
                  <>
                    <Button
                      onClick={() => {
                        handletryagain();
                      }}
                      variant="solid"
                    >
                      Submit Another Response
                    </Button>
                    <Button
                      type="primary"
                      variant="solid"
                      onClick={() => {
                        navigate("/user/application/status");
                      }}
                    >
                      Track your Application
                    </Button>
                  </>,
                ]}
              />
            )}
            {showResult === "error" && (
              <div style={{ height: "100%" }}>
                <Result
                  status="error"
                  title="Application Submitted Failed!"
                  subTitle={errMessage}
                  style={{ height: "100%" }}
                  extra={[
                    <>
                      <Button
                        variant="solid"
                        danger
                        onClick={() => {
                          handletryagain();
                        }}
                      >
                        Try Again!
                      </Button>
                      <Button
                        type="primary"
                        variant="solid"
                        onClick={() => {
                          navigate("/user/application/status");
                        }}
                      >
                        Track your Application
                      </Button>
                    </>,
                  ]}
                />
              </div>
            )}
            {showResult === null && (
              <>
                <div className="flex justify-center">
                  <img
                    src="/ChatGPT Image May 22, 2025, 12_02_14 PM.png"
                    className="w-[100px] h-[100px]"
                  />
                </div>
                <StepForms stepNo={stepNo} />
                {stepNo === 0 && (
                  <>
                    <Form
                      requiredMark={false}
                      name="personalinfo"
                      layout="vertical"
                      size="large"
                      form={form1}
                      onFinish={Continue}
                    >
                      <Form.Item
                        label="Name"
                        name="name"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Name!",
                          },
                        ]}
                      >
                        <Input placeholder="Enter your full name" />
                      </Form.Item>
                      <Form.Item
                        name="email"
                        label="Email"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Email!",
                          },
                          {
                            type: "email",
                            message: "The input is not a valid E-mail!",
                          },
                        ]}
                      >
                        <Input placeholder="example@email.com" />
                      </Form.Item>
                      <Form.Item
                        label="Mobile"
                        name="number"
                        rules={[
                          {
                            required: true,
                            message: "Please input your Number!",
                          },
                          {
                            pattern: /^\d{10}$/,
                            message: "Mobile number must be 10 digits",
                          },
                        ]}
                      >
                        <Input
                          maxLength={10}
                          placeholder="10 digit mobile number"
                        />
                      </Form.Item>
                      <Form.Item
                        label="Date of Birth"
                        name="dob"
                        rules={[
                          {
                            required: true,
                            message: "Please input your date of birth",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
                          disabledDate={disabledDate}
                        />
                      </Form.Item>
                      <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                          Continue
                        </Button>
                      </Form.Item>
                      <p style={{ textDecoration: "none" }}>
                        <Link to="/User/Application/status">
                          Already Applied ? Track Your Application
                        </Link>
                      </p>
                    </Form>
                  </>
                )}

                {stepNo === 1 && (
                  <Form
                    requiredMark={false}
                    name="educationinfo"
                    layout="vertical"
                    size="large"
                    form={form2}
                    className="responsive-form"
                    initialValues={formData}
                    onFinish={Continue}
                  >
                    <Form.Item label="Degree" name="degree">
                      <Select
                        placeholder="Select Degree"
                        style={{ width: "auto" }}
                        popupMatchSelectWidth={false}
                        allowClear
                        // onChange={handleChange}
                        options={[
                          { value: "bachelour", label: "Bachelour" },
                          { value: "masters", label: "Masters" },
                          { value: "phd", label: "Phd" },
                          { value: "diploma", label: "Diploma" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      label="University"
                      name="uni_name"
                      rules={[
                        {
                          required: true,
                          message: "Please input your University Name!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter university name" />
                    </Form.Item>
                    <Form.Item
                      label="College"
                      name="clg_name"
                      rules={[
                        {
                          required: true,
                          message: "Please input your College Name!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter college name" />
                    </Form.Item>
                    <div className="flex justify-between">
                      <Button onClick={prev} style={{ width: 120 }}>
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: 120 }}
                      >
                        Continue
                      </Button>
                    </div>
                  </Form>
                )}

                {stepNo === 2 && (
                  <Form
                    requiredMark={false}
                    name="requirement"
                    layout="vertical"
                    size="large"
                    form={form3}
                    onFinish={handleSubmit}
                    initialValues={formData}
                    className="responsive-form"
                  >
                    <Form.Item
                      label="Room Type"
                      name="room_type"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Your Prefer Room Type",
                        },
                      ]}
                    >
                      <Select
                        placeholder="Select Room Type"
                        style={{ width: "auto" }}
                        popupMatchSelectWidth={false}
                        allowClear
                        // onChange={onChange}
                        options={[
                          { value: "single", label: "Single" },
                          { value: "double", label: "Double" },
                          { value: "triple", label: "Triple" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item
                      label="Start Duration"
                      name="start_date"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Your Start Date",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        onChange={() => {
                          setEnddt("fill");
                        }}
                        disabledDate={(current) =>
                          current && current < new Date().setHours(0, 0, 0, 0)
                        }
                      />
                    </Form.Item>

                    <Form.Item
                      label="End  Duration"
                      name="end_date"
                      dependencies={["start_date"]}
                      rules={[
                        {
                          required: true,
                          message: "Please Select Your End Date",
                        },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const start = getFieldValue("start_date");
                            if (!value || !start) return Promise.resolve();
                            if (!value.isAfter(start, "day")) {
                              return Promise.reject(
                                new Error(
                                  "End date should be greater than start date"
                                )
                              );
                            }
                            return Promise.resolve();
                          },
                        }),
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        disabled={enddt === "empty"}
                        disabledDate={(current) => {
                          const start = form3.getFieldValue("start_date");
                          if (!start)
                            return (
                              current &&
                              current < new Date().setHours(0, 0, 0, 0)
                            );
                          return current && current <= start.startOf("day");
                        }}
                      />
                    </Form.Item>
                    <div className="flex justify-between">
                      <Button onClick={prev} style={{ width: 120 }}>
                        Back
                      </Button>
                      <Button
                        type="primary"
                        htmlType="submit"
                        style={{ width: 120 }}
                      >
                        Submit
                      </Button>
                    </div>
                  </Form>
                )}
              </>
            )}
          </Form.Provider>
        </div>
      </div>
    </>
  );
}

export default ApplicationForm;
