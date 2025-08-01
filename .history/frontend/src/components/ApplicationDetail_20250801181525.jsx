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
  Space,
} from "antd";
import { saveAs } from "file-saver"; // To enable file download functionality

function ApplicationDetail({ title }) {
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
          axios.get(
            `${import.meta.env.VITE_API_URL}${Endpoint.applicationdetail}/${id}`
          ),
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
    window.open(
      `${import.meta.env.VITE_API_URL}/application/${application.id}/pdf`,
      "_blank"
    );
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
      <Helmet>
        <title>{title}</title>
      </Helmet>

      <div style={{ padding: 24 }}>
        <Button
          type="link"
          onClick={() => navigate(-1)}
          icon={<ArrowLeftOutlined />}
          style={{ marginBottom: 16 }}
        >
          Back
        </Button>

        <Card
          id="application-details"
          title="Application Details"
          style={{ width: "100%" }}
          extra={
            currentStatus === "Accepted" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Tag icon={<CheckCircleOutlined />} color="success">
                  Accepted
                </Tag>
                <Button
                  type="primary"
                  onClick={downloadApplicationDetails}
                  disabled={loading}
                  icon={<DownloadOutlined />}
                >
                  Download Application
                </Button>
              </div>
            ) : currentStatus === "Rejected" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Tag icon={<CloseCircleOutlined />} color="error">
                  Rejected
                </Tag>
                <Button
                  type="primary"
                  onClick={downloadApplicationDetails}
                  disabled={loading}
                  icon={<DownloadOutlined />}
                >
                  Download Application
                </Button>
              </div>
            ) : null
          }
        >
          <Descriptions
            title="Personal Information"
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="middle"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Name" span={1}>
              {application.name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Email" span={1}>
              {application.email || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile" span={1}>
              {application.number || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="DOB" span={1}>
              {application.dob || "-"}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Education Information"
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="middle"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Degree" span={1}>
              {application.degree || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="University" span={1}>
              {application.uni_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="College" span={1}>
              {application.clg_name || "-"}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions
            title="Requirement Details"
            bordered
            column={{ xxl: 2, xl: 2, lg: 2, md: 1, sm: 1, xs: 1 }}
            size="middle"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="Room Type" span={1}>
              {application.room_type || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Start Date" span={1}>
              {application.start_date || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="End Date" span={1}>
              {application.end_date || "-"}
            </Descriptions.Item>
          </Descriptions>

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
                    <Select.Option key={room.room_id} value={room.room_id}>
                      {room.room_number} - {room.room_type}
                    </Select.Option>
                  ))}
                </Select>
                {availableRooms.length === 0 && (
                  <Text
                    type="danger"
                    style={{ display: "block", marginTop: 8 }}
                  >
                    No available rooms matching the application requirements
                  </Text>
                )}
              </div>

              <Input.TextArea
                rows={3}
                placeholder="Remarks (required for rejection)"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                disabled={loading || !!selectedRoomId}
                style={{ maxWidth: 600, marginBottom: 14 }}
              />
              <div style={{ textAlign: "center" }}>
                <Space size="middle" style={{ marginTop: 16 }}>
                  <Button
                    type="primary"
                    onClick={() => updateStatus("Accepted")}
                    disabled={!selectedRoomId || loading}
                    loading={loading}
                    icon={<CheckOutlined />}
                    style={{ marginLeft: 8 }}
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
              </div>
            </>
          )}
        </Card>
      </div>
    </>
  );
}

export default ApplicationDetail;
