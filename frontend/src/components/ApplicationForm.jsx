import {
  DatePicker,
  Form,
  Input,
  Button,
  Select,
  Card,
  Row,
  Col,
  Space,
  Typography,
  message,
  Result,
} from "antd";
import { useFormContext } from "./FormContext";
import { useState } from "react";
import StepForms from "./StepForms";
import FormItem from "antd/es/form/FormItem";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const { Title } = Typography;

function ApplicationForm() {
  const [stepNo, setStepNo] = useState(0);

  const { formData, setFormData, resetForm } = useFormContext();

  const [form1] = Form.useForm();
  const [form2] = Form.useForm();
  const [form3] = Form.useForm();
  const [showResult, setShowResult] = useState(null);
  const navigate = useNavigate();

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
      console.log(import.meta.env.VITE_API_URL);
      // Remove id, room_number, and status if present
      const { id, room_number, status, ...filteredFormData } = formData;
      const {
        id: vId,
        room_number: vRoom,
        status: vStatus,
        ...filteredValues
      } = { ...values1, ...values2, ...values3 };
      const payload = { ...filteredFormData, ...filteredValues };
      await axios.post(
        `${import.meta.env.VITE_API_URL}/submit-application/`,
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
      } else if (error.response) {
        message.error(error.response.data.message || "Submission failed.");
      } else if (error.request) {
        message.error("No response received from server.");
      } else {
        message.error("Error submitting form.");
      }
    }
  };
  const onclick = () => {
    navigate("/Admin/login");
  };
  const handletryagain = () => {
    reset();
    setFormData({});
    setShowResult(null);
  };
  return (
    <Row
      justify="center"
      align="middle"
      className="center-container"
      style={{ height: "100vh" }}
    >
      <Col xs={24} sm={20} md={16} lg={12} xl={10}>
        <Card style={{ height: "100%" }}>
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
              <div style={{ height: "100vh" }}>
                <Result
                  status="error"
                  title="Application Submitted Failed!"
                  style={{ height: "100vh" }}
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
                    </>,
                  ]}
                />
              </div>
            )}
            {showResult === null && (
              <>
                <StepForms stepNo={stepNo} />
                {stepNo === 0 && (
                  <Form
                    name="personalinfo"
                    layout="vertical"
                    className="responsive-form"
                    size="large"
                    form={form1}
                    onFinish={Continue}
                  >
                    <Title level={3} className="form-title">
                      Personal Information
                    </Title>
                    <Form.Item
                      label="Name"
                      name="name"
                      rules={[
                        { required: true, message: "Please input your Name!" },
                      ]}
                    >
                      <Input placeholder="Enter your full name" />
                    </Form.Item>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: "Please input your Email!" },
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
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" block>
                        Continue
                      </Button>
                    </Form.Item>
                    <FormItem>
                      <div style={{ textAlign: "center", marginTop: ".3rem" }}>
                        <Button onClick={onclick}>Admin ?</Button>
                      </div>
                    </FormItem>
                    <p style={{ textDecoration: "none" }}>
                      <Link to="/User/Application/status">
                        Already Applied ? Track Your Application
                      </Link>
                    </p>
                  </Form>
                )}

                {stepNo === 1 && (
                  <Form
                    name="educationinfo"
                    layout="vertical"
                    size="large"
                    form={form2}
                    className="responsive-form"
                    initialValues={formData}
                    onFinish={Continue}
                  >
                    <Title level={3} className="form-title">
                      Education Details
                    </Title>
                    <Form.Item label="Degree" name="degree">
                      <Select
                        defaultValue="Select Degree"
                        style={{ width: "auto" }}
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
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
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
                    </Space>
                  </Form>
                )}

                {stepNo === 2 && (
                  <Form
                    name="requirement"
                    layout="vertical"
                    size="large"
                    form={form3}
                    onFinish={handleSubmit}
                    initialValues={formData}
                    className="responsive-form"
                  >
                    <Title level={3} className="form-title">
                      Room Requirement
                    </Title>
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
                        defaultValue="Select Room Type"
                        style={{ width: "auto" }}
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
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>

                    <Form.Item
                      label="End  Duration"
                      name="end_date"
                      rules={[
                        {
                          required: true,
                          message: "Please Select Your End Date",
                        },
                      ]}
                    >
                      <DatePicker style={{ width: "100%" }} />
                    </Form.Item>
                    <Space
                      style={{ width: "100%", justifyContent: "space-between" }}
                    >
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
                    </Space>
                  </Form>
                )}
              </>
            )}
          </Form.Provider>
        </Card>
      </Col>
    </Row>
  );
}

export default ApplicationForm;
