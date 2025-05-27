import {
  Button,
  message,
  Table,
  Card,
  Typography,
  Modal,
  Descriptions,
  Select,
  Input,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";

// import { Pagination } from "antd";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [selectedRoomId, setSelectedRoomId] = useState(null);
  const [remark, setRemark] = useState("");
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();

  const showDetail = async (record) => {
    setSelectedApp(record);
    setModalVisible(true);
    setSelectedRoomId(null);
    setRemark("");
    try {
      const res = await axios.get("http://localhost:8000/available-rooms/");
      setRooms(res.data.rooms);
    } catch (err) {
      message.error("Failed to fetch rooms");
    }
  };
  const handleAcceptedApplications = () => {
    navigate("/Admin/accepted-applications");
  };
  const handleSubmit = async (showFetchMsg = true) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:8000/fetch-applications/"
      );
      if (response.data && response.data.applications) {
        setApplications(response.data.applications);
        if (showFetchMsg) {
          message.success("Applications successfully fetched.");
        }
      } else {
        message.error("No applications found.");
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error("Error in fetching applications.");
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    handleSubmit();
  }, [rooms, remark]);
  const columns = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Mobile", dataIndex: "number", key: "number" },
    { title: "DOB", dataIndex: "dob", key: "dob" },
    { title: "Degree", dataIndex: "degree", key: "degree" },
    { title: "University", dataIndex: "uni_name", key: "uni_name" },
    { title: "College", dataIndex: "clg_name", key: "clg_name" },
    { title: "Room Type", dataIndex: "room_type", key: "room_type" },
    { title: "Start Duration", dataIndex: "start_date", key: "start_date" },
    { title: "End Duration", dataIndex: "end_date", key: "end_date" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => {
        if (record.status === "Accepted" || record.status === "Rejected") {
          return (
            <span
              style={{
                color: record.status === "Accepted" ? "green" : "red",
                fontWeight: 600,
              }}
            >
              {record.status}
            </span>
          );
        }
        return (
          <Button type="link" onClick={() => showDetail(record)}>
            View
          </Button>
        );
      },
    },
  ];

  const updateStatus = async (statusValue) => {
    if (!selectedApp) return;

    try {
      const payload = {
        email: selectedApp.email,
        number: selectedApp.number,
        status: statusValue,
      };

      if (statusValue === "Accepted") {
        const selectedRoom = rooms.find((r) => r.room_id === selectedRoomId);
        if (selectedRoom) {
          payload.room_number = selectedRoom.room_number;
        }
      }

      if (statusValue === "Rejected") {
        payload.remark = remark;
      }

      await axios.post("http://localhost:8000/update-status/", payload);
      message.success(`Status updated to ${statusValue}`);
      if (statusValue === "Accepted") {
        const res = await axios.get("http://localhost:8000/available-rooms/");
        setRooms(res.data.rooms);
      }
      setModalVisible(false);
      setRemark("");
      setSelectedRoomId(null);
      // Refresh applications without showing fetch message
    } catch (error) {
      console.log(error);
      message.error("Failed to update status");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    navigate("/Admin/login");
  };

  return (
    <div style={{ padding: 24 }}>
      {/* <Card
        className="styled-card"
        style={{ padding: 24, position: "relative" }}
      > */}
      <div
        style={{
          position: "absolute",
          top: 24,
          right: 24,
          zIndex: 1,
          gap: 16,
          display: "flex",
        }}
      >
        <Button color="green" onClick={handleAcceptedApplications}>
          Accepted Applications
        </Button>
        <Button type="primary" danger onClick={handleLogout}>
          Logout
        </Button>
      </div>
      <Title level={3} className="form-title">
        All Applications
      </Title>

      <div className="responsive-table">
        <Table
          columns={columns}
          dataSource={applications}
          rowKey={(record) => record.id || record.email + record.name}
          bordered
          pagination={{ pageSize: 8 }}
          scroll={{ x: true }}
        />
      </div>

      <Modal
        open={modalVisible}
        title="Application Details"
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        {selectedApp && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Name">
              {selectedApp.name}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {selectedApp.email}
            </Descriptions.Item>
            <Descriptions.Item label="Mobile">
              {selectedApp.number}
            </Descriptions.Item>
            <Descriptions.Item label="DOB">{selectedApp.dob}</Descriptions.Item>
            <Descriptions.Item label="Degree">
              {selectedApp.degree}
            </Descriptions.Item>
            <Descriptions.Item label="University">
              {selectedApp.uni_name}
            </Descriptions.Item>
            <Descriptions.Item label="College">
              {selectedApp.clg_name}
            </Descriptions.Item>
            <Descriptions.Item label="Room Type">
              {selectedApp.room_type}
            </Descriptions.Item>
            <Descriptions.Item label="Start Duration">
              {selectedApp.start_date}
            </Descriptions.Item>
            <Descriptions.Item label="End Duration">
              {selectedApp.end_date}
            </Descriptions.Item>
            <Descriptions.Item label="Decision">
              {selectedApp && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <Select
                      style={{ width: "100%" }}
                      placeholder="Select Room (on accept)"
                      onChange={setSelectedRoomId}
                      value={selectedRoomId}
                      defaultValue="Select Room "
                      allowClear
                    >
                      {rooms.map((room) => (
                        <Select.Option key={room.room_id} value={room.room_id}>
                          {room.room_number} - {room.room_type}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                  <Input.TextArea
                    rows={3}
                    placeholder="Remarks"
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    disabled={selectedRoomId !== null}
                  />
                  <div style={{ display: "flex", gap: 16, marginTop: 16 }}>
                    <Button
                      type="primary"
                      onClick={() => updateStatus("Accepted")}
                      disabled={!selectedRoomId}
                    >
                      Accept
                    </Button>
                    <Button
                      type="primary"
                      danger
                      onClick={() => {
                        if (!remark.trim()) {
                          message.error("Please enter a remark for rejection.");
                          return;
                        }
                        updateStatus("Rejected");
                        handleSubmit(false);
                      }}
                      disabled={selectedRoomId !== null}
                    >
                      Reject
                    </Button>
                  </div>
                </>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
      {/* </Card> */}
    </div>
  );
}

export default AdminDashboard;
