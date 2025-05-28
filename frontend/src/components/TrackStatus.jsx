import { AudioOutlined } from "@ant-design/icons";
import { Input, Card, Typography, Row, Col, Button } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const { Search } = Input;
const { Title, Text } = Typography;

function TrackStatus() {
  const [statusColor, setStatusColor] = useState("success");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const onSearch = async (value) => {
    const isEmail = value.includes("@");
    if (!value) {
      setResult(null);
      return;
    }
    setLoading(true);
    try {
      // Determine if the input is an email or a number
      console.log(import.meta.env.VITE_API_URL);
      const response = await axios.get("${process.env.APP_URL}/get-status/", {
        params: isEmail ? { email: value } : { number: value },
      });
      if (
        response.data &&
        response.data.application &&
        response.data.application.status
      ) {
        const { status, room_number, remark } = response.data.application;
        let color = "success";
        let msg = `Status for application (${value}): ${status}`;
        if (status && status.toLowerCase() === "accepted" && room_number) {
          msg += `  Your Room Number is : ${room_number}`;
        }
        if (status && status.toLowerCase() === "rejected" && remark) {
          msg += `  Reason Why it is Rejected: ${remark}`;
        }
        if (status && status.toLowerCase() === "pending") color = "warning";
        else if (status && status.toLowerCase() === "rejected")
          color = "danger";
        else if (status && status.toLowerCase() === "accepted")
          color = "success";
        setStatusColor(color);
        setResult(msg);
      } else {
        setResult("No status found for this application.");
      }
    } catch (error) {
      setStatusColor("danger");
      if (error.response && error.response.data && error.response.data.detail) {
        setResult(error.response.data.detail);
      } else {
        setResult("Error fetching status.");
      }
    } finally {
      setLoading(false);
    }
  };
  return (
    <Row
      justify="center"
      align="middle"
      className="center-container"
      style={{ height: "100vh" }}
    >
      <Col xs={24} sm={20} md={14} lg={10} xl={8}>
        <Card style={{ padding: 32, height: "100%" }}>
          <Title level={3} className="form-title">
            Track Your Application Status
          </Title>
          <Search
            placeholder="Enter your email or Number"
            enterButton="Search"
            size="large"
            onSearch={onSearch}
            loading={loading}
            style={{ marginBottom: 32 }}
          />
          <div className="status-result">
            {result ? (
              <Text type={statusColor} style={{ fontSize: 16 }}>
                {result}
              </Text>
            ) : (
              <Text type="secondary">
                Enter your details to track your application.
              </Text>
            )}
          </div>
          <Button
            type="primary"
            style={{ textAlign: "center", marginLeft: "9rem" }}
            onClick={() => navigate("/")}
          >
            {" "}
            Back home
          </Button>
        </Card>
      </Col>
    </Row>
  );
}

export default TrackStatus;
