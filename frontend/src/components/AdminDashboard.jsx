import { Button, message, Table, Space, Popconfirm } from "antd";

import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Endpoint } from "../constant/Endpoint";

function AdminDashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState([]);
  const navigate = useNavigate();
  const [current, setCurrent] = useState(1);

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
        const fixedApplications = response.data.applications.map((app) => ({
          ...app,
          status: app.status ? app.status : "Pending",
        }));
        setApplications(fixedApplications);

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
  const showDetail = async (record) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}${Endpoint.applicationdetail}/${
          record.id
        }`
      );

      navigate(`/Admin/Application/detail/${record.id}`);
    } catch (error) {
      message.error(
        error?.response?.data?.detail || "Failed to fetch application details"
      );
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
                <span>
                  <a href="#" onClick={() => showDetail(record)}>
                    View
                  </a>
                </span>
              </Space>
            </>
          );
        }
        return (
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <Popconfirm
              title="Delete the task"
              description="Are you sure to delete this task?"
              okText="Yes"
              cancelText="No"
              onConfirm={() => deleteApplication(record.email, record.number)}
            >
              <Button danger>Delete</Button>
            </Popconfirm>
            <Button type="link" onClick={() => showDetail(record)}>
              View
            </Button>
          </div>
        );
      },
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("admin_logged_in");
    // setTimeout(() => {
    //   navigate("/Admin/login", { replace: true });

    navigate("/Admin/login", { replace: true });
  };
  const pageSize = 8;
  const paginatedData = applications
    .filter((app) => app && app.name && app.email && app.number)
    .slice((current - 1) * pageSize, current * pageSize);

  return (
    <>
      <div className=" !p-4">
        <div className="flex justify-between !p-4">
          <Button type="primary" onClick={handleAcceptedApplications}>
            Accepted Applications
          </Button>
          <Button type="primary" danger onClick={() => handleLogout()}>
            Logout
          </Button>
        </div>

        <div>
          <Table
            columns={columns}
            dataSource={paginatedData}
            rowKey={(record) => record.id || record.email + record.name}
            bordered
            scroll={{ x: true }}
            pagination={{}} //have to fix this pagination
          />
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
