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
  Space,
  Popconfirm,
  Pagination,
} from "antd";
import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";

// import { Pagination } from "antd";
import { data, useNavigate } from "react-router-dom";
import { Endpoint } from "../constant/Endpoint";
const { Title } = Typography;

function AdminDashboard({ title }) {
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
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}${Endpoint.availablerooms}`
      );
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
        `${import.meta.env.VITE_API_URL}${Endpoint.fetchapplications}`
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
  const deleteApplication = async (email, number) => {
    try {
      await axios.delete(
        `${import.meta.env.VITE_API_URL}${Endpoint.deleteapplication}`,
        { params: { email, number } }
      );
      message.success("Application deleted successfully");
      handleSubmit(false);
    } catch (error) {
      message.error("Error deleting application");
    }
  };
  useEffect(() => {
    handleSubmit();
  }, []);
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
            <>
              <Space size="middle">
                <span
                  style={{
                    color: record.status === "Accepted" ? "green" : "red",
                    fontWeight: 600,
                  }}
                >
                  {record.status}
                </span>

                <Popconfirm
                  title="Delete the Application"
                  description="Are you sure to delete this application?"
                  okText="Yes"
                  cancelText="No"
                  onConfirm={() =>
                    deleteApplication(record.email, record.number)
                  }
                >
                  <Button danger disabled={record.status === "Accepted"}>
                    Delete
                  </Button>
                </Popconfirm>
              </Space>
            </>
          );
        }
        return (
          <Space size="middle">
            <Button type="link" onClick={() => showDetail(record)}>
              View
            </Button>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteApplication(record.email, record.number)}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
          </Space>
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

      await axios.post(
        `${import.meta.env.VITE_API_URL}${Endpoint.applicationupdatestatus}`,
        payload
      );
      message.success(`Status updated to ${statusValue}`);
      handleSubmit(false);
      setModalVisible(false);
      setRemark("");
      setSelectedRoomId(null);
      setSelectedApp(null);

      if (statusValue === "Accepted") {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}${Endpoint.availablerooms}`
        );
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
    setTimeout(() => {
      navigate("/Admin/login", { replace: true });
    }, 100);
    useEffect(() => {
      navigate("/Admin/login", { replace: true });
    });
  };

  return (
    <>
      <Helmet>
        <title>{title}</title>
      </Helmet>
      <div style={{ padding: 24 }}>
        <div className="admin-dashboard-header-buttons">
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
            dataSource={applications.filter(
              (app) => app && app.name && app.email && app.number
            )}
            rowKey={(record) => record.id || record.email + record.name}
            bordered
            pagination={{
              pageSize: 10,
              defaultCurrent: 1,
              total: applications.length,
            }}
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
              <Descriptions.Item label="DOB">
                {selectedApp.dob}
              </Descriptions.Item>
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
                        {(rooms || []).map((room) => (
                          <Select.Option
                            key={room.room_id}
                            value={room.room_id}
                          >
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
                      // Enable input always
                      disabled={false}
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
                            message.error(
                              "Please enter a remark for rejection."
                            );
                            return;
                          }
                          updateStatus("Rejected");
                          handleSubmit(false);
                        }}
                        disabled={!!selectedRoomId}
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
      </div>
    </>
  );
}

export default AdminDashboard;
