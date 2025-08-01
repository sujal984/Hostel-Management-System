import { Input, Card, Typography, Row, Col, Button } from "antd";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
const { Search } = Input;
const { Title, Text } = Typography;
import { Endpoint } from "../constant/Endpoint";

function TrackStatus({ title }) {
  const [statusColor, setStatusColor] = useState("warning");
  const [result, setResult] = useState(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("pending");

  // const onSearch = async (value) => {
  //   const isEmail = value.includes("@");
  //   if (!value) {
  //     setResult(null);
  //     return;
  //   }
  //   setLoading(true);
  //   try {
  //     // Determine if the input is an email or a number
  //     console.log(import.meta.env.VITE_API_URL);
  //     const response = await axios.get(
  //       "${process.env.VITE_API_URL}/get-status/",
  //       {
  //         params: isEmail ? { email: value } : { number: value },
  //       }
  //     );
  //     if (
  //       response.data &&
  //       response.data.application &&
  //       response.data.application.status
  //     ) {
  //       const { status, room_number, remark } = response.data.application;
  //       let color = "success";
  //       let msg = `Status for application (${value}): ${status}`;
  //       console.log(status);
  //       if (status && status.toLowerCase() === "accepted" && room_number) {
  //         msg += `  Your Room Number is : ${room_number}`;
  //       }
  //       if (status && status.toLowerCase() === "rejected" && remark) {
  //         msg += `  Reason Why it is Rejected: ${remark}`;
  //       }
  //       if (status && status.toLowerCase() === "pending") color = "warning";
  //       else if (status && status.toLowerCase() === "rejected")
  //         color = "danger";
  //       else if (status && status.toLowerCase() === "accepted")
  //         color = "success";
  //       setStatusColor(color);
  //       setResult(msg);
  //     } else {
  //       setResult("No result found for this application.");
  //     }
  //   } catch (error) {
  //     setStatusColor("danger");
  //     if (error.response && error.response.data && error.response.data.detail) {
  //       setResult(error.response.data.detail);
  //     } else {
  //       setResult("Error fetching status.");
  //     }
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onSearch = async (value) => {
    value = value.trim();
    const isEmail = value.includes("@");
    if (!value) {
      setResult(null);
      setStatusColor("default");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}${Endpoint.trackStatus}`,
        {
          params: isEmail ? { email: value } : { number: value },
        }
      );
      if (response.data && response.data.application) {
        // If status is missing or null, treat as "Pending"
        const status = response.data.application.status || "Pending";
        const { room_number, remark } = response.data.application;
        setStatus(status);
        let color = "default";
        let msg = `Status for application (${value}): ${status}`;
        if (status.toLowerCase() === "accepted" && room_number) {
          msg += `  Your Room Number is : ${room_number}`;
          color = "success";
        } else if (status.toLowerCase() === "rejected") {
          color = "danger";
          if (remark) {
            msg += `  Reason Why it is Rejected: ${remark}`;
          }
        } else if (status.toLowerCase() === "pending") {
          color = "warning";
        }
        setStatusColor(color);
        setResult(msg);
      } else {
        setStatusColor("danger");
        setResult("No application found for this email or number.");
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
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <Row
        justify="center"
        align="middle"
        className="center-container"
        style={{ height: "100vh" }}
      >
        <Col xs={24} sm={20} md={14} lg={10} xl={8}>
          <Card className="app-card track-status-card">
            <Title level={3} className="form-title">
              Track Your Application Status
            </Title>
            <Search
              placeholder="Enter your email or Number"
              enterButton="Search"
              size="large"
              onSearch={onSearch}
              loading={loading}
              style={{ marginBottom: 32, width: "100%" }}
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
              className="track-status-button"
              style={{ marginLeft: "9rem" }}
              onClick={() => navigate("/")}
            >
              {" "}
              Back home
            </Button>
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default TrackStatus;
