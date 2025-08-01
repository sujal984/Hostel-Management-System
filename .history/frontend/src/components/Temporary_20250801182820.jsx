import { Helmet } from "react-helmet";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useState, useEffect } from "react";
import { Endpoint } from "../constant/Endpoint";
import CheckCircleOutlined from "@ant-design/icons/CheckCircleOutlined";
import CloseCircleOutlined from "@ant-design/icons/CloseCircleOutlined";
import ArrowLeftOutlined from "@ant-design/icons/ArrowLeftOutlined";
import DownloadOutlined from "@ant-design/icons/DownloadOutlined";
import CheckOutlined from "@ant-design/icons/CheckOutlined";
import CloseOutlined from "@ant-design/icons/CloseOutlined";
import html2js from "html2js";

import {
  Card,
  Descriptions,
  Select,
  Input,
  Button,
  Result,
  message,
  Spin,
  Tag,
  List,
  Space,
  Typography,
  Row,
  Col,
} from "antd";
import { saveAs } from "file-saver"; // To enable file download functionality

function Temporary({ title }) {
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [remark, setRemark] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [currentStatus, setCurrentStatus] = useState("Pending");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setFetching(true);
        const [appResponse, roomsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/temporary/${id}`),
          axios.get(
            `${import.meta.env.VITE_API_URL}${Endpoint.availablerooms}`
          ),
        ]);

        setApplication(appResponse.data.application);
        setCurrentStatus(appResponse.data.application?.status || "Pending");

        // Filter rooms that are not assigned to any "Accepted" applications
        const filteredRooms = (roomsResponse.data.rooms || []).filter(
          (room) => !room.assigned_to_application // Custom logic to exclude rooms assigned to accepted applications
        );
        setAvailableRooms(filteredRooms);
      } catch (error) {
        console.error("Failed to load data:", error);
        message.error("Failed to load application data");
      } finally {
        setFetching(false);
      }
    };

    fetchData();
  }, [id]);

  const updateStatus = async (statusValue) => {
    if (!application) return;

    try {
      setLoading(true);

      if (statusValue === "Accepted" && !selectedRoomId) {
        message.error("Please select a room before accepting");
        return;
      }

      if (statusValue === "Rejected" && !remark.trim()) {
        message.error("Please enter a remark for rejection");
        return;
      }

      const payload = {
        application_id: application.id,
        email: application.email,
        number: application.number,
        status: statusValue,
        current_status: currentStatus,
      };

      if (statusValue === "Accepted") {
        const selectedRoom = availableRooms.find(
          (r) => r.room_id === selectedRoomId
        );
        if (selectedRoom) {
          payload.room_id = selectedRoomId;
          payload.room_number = selectedRoom.room_number;
        }
      } else if (statusValue === "Rejected") {
        payload.remark = remark;
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}${Endpoint.applicationupdatestatus}`,
        payload
      );

      setCurrentStatus(statusValue);
      message.success(`Application status updated to ${statusValue}`);
      if (statusValue === "Accepted") {
        alert("accept");
      }
      elif(statusValue === "Rejected");
      {
        alert("rejected");
      }
    } catch (error) {
      console.error("Status update failed:", error);
      message.error(error.response?.data?.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleRoomSelect = (roomId) => {
    setSelectedRoomId(roomId);
  };

  const downloadApplicationDetails = () => {
    const htmlElement = document.getElementById("application-details");
    html2js(htmlElement);
  };

  if (fetching) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  if (!application) {
    return (
      <Result
        status="404"
        title="404"
        subTitle="Sorry, the application you are looking for does not exist."
        extra={
          <Button type="primary" onClick={() => navigate("/admin/dashboard")}>
            Back to Dashboard
          </Button>
        }
      />
    );
  }

  return (
    <>
      <Row justify="center">
        <Col>
          <Card
            id="application-details"
            title="Application Details"
            style={{
              maxWidth: 800,
              margin: "0 auto",
            }}
            extra={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  direction: "row",
                  width: "600px",
                  marginLeft: "10px",
                }}
              >
                {currentStatus === "Accepted" && (
                  <>
                    {" "}
                    <Tag icon={<CheckCircleOutlined />} color="success">
                      Accepted
                    </Tag>
                  </>
                )}{" "}
                {currentStatus === "Rejected" && (
                  <>
                    {" "}
                    <Tag icon={<CloseCircleOutlined />} color="error">
                      Rejected
                    </Tag>
                  </>
                )}
                <Button
                  type="link"
                  onClick={() => navigate(-1)}
                  icon={<ArrowLeftOutlined />}
                >
                  Back
                </Button>
              </div>
            }
          >
            <List
              itemLayout="vertical"
              size="large"
              gutter={16}
              grid={{ gutter: 24, column: 1 }}
              dataSource={[
                {
                  title: "Personal Information",
                  items: [
                    { label: "Name", value: application.name },
                    { label: "Email", value: application.email },
                    { label: "Mobile", value: application.number },
                    { label: "DOB", value: application.dob },
                  ],
                },
                {
                  title: "Education Information",
                  items: [
                    { label: "Degree", value: application.degree },
                    { label: "University", value: application.uni_name },
                    { label: "College", value: application.clg_name },
                  ],
                },
                {
                  title: "Requirement Details",
                  items: [
                    { label: "Room Type", value: application.room_type },
                    { label: "Start Date", value: application.start_date },
                    { label: "End Date", value: application.end_date },
                  ],
                },
                {
                  title: "Decision",
                  render: (
                    <div>
                      {currentStatus === "Pending" && (
                        <>
                          <div style={{ marginBottom: 16 }}>
                            <Select
                              style={{ width: "100%", maxWidth: 400 }}
                              placeholder="Select available room"
                              onChange={handleRoomSelect}
                              value={selectedRoomId}
                              disabled={loading}
                              allowClear
                            >
                              {availableRooms.map((room) => (
                                <Select.Option
                                  key={room.room_id}
                                  value={room.room_id}
                                >
                                  {room.room_number} - {room.room_type}
                                </Select.Option>
                              ))}
                            </Select>
                            {availableRooms.length === 0 && (
                              <Typography.Text
                                type="danger"
                                style={{ display: "block", marginTop: 8 }}
                              >
                                No available rooms matching the application
                                requirements
                              </Typography.Text>
                            )}
                          </div>

                          <Input.TextArea
                            rows={3}
                            placeholder="Remarks (required for rejection)"
                            value={remark}
                            onChange={(e) => setRemark(e.target.value)}
                            disabled={loading || !!selectedRoomId}
                            style={{ maxWidth: 600 }}
                          />

                          <Space
                            size="middle"
                            style={{
                              marginTop: 16,
                              flexWrap: "wrap",
                              rowGap: 8,
                            }}
                          >
                            <Button
                              type="primary"
                              onClick={() => updateStatus("Accepted")}
                              disabled={!selectedRoomId || loading}
                              loading={loading}
                              icon={<CheckOutlined />}
                            >
                              Accept Application
                            </Button>

                            <Button
                              type="primary"
                              danger
                              onClick={() => updateStatus("Rejected")}
                              disabled={!remark || !!selectedRoomId || loading}
                              loading={loading}
                              icon={<CloseOutlined />}
                            >
                              Reject Application
                            </Button>
                          </Space>
                        </>
                      )}

                      {currentStatus === "Accepted" && (
                        <Space align="center">
                          <Button
                            type="primary"
                            onClick={downloadApplicationDetails}
                            disabled={loading}
                            icon={<DownloadOutlined />}
                          >
                            Download Application
                          </Button>
                        </Space>
                      )}
                      {currentStatus === "Rejected" && (
                        <Space align="center">
                          <Button
                            type="primary"
                            onClick={downloadApplicationDetails}
                            disabled={loading}
                            icon={<DownloadOutlined />}
                          >
                            Download Application
                          </Button>
                        </Space>
                      )}
                    </div>
                  ),
                },
              ]}
              renderItem={(section) => (
                <List.Item>
                  <Typography.Title level={5} style={{ marginBottom: 16 }}>
                    {section.title}
                  </Typography.Title>
                  {section.items ? (
                    <Descriptions
                      bordered
                      column={{ xs: 1, sm: 1, md: 1, lg: 2, xl: 1, xxl: 3 }}
                      size="small"
                    >
                      {section.items.map((item) => (
                        <Descriptions.Item label={item.label} key={item.label}>
                          {item.value || "-"}
                        </Descriptions.Item>
                      ))}
                    </Descriptions>
                  ) : (
                    section.render
                  )}
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </>
  );
}

export default Temporary;
