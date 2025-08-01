import {
  Button,
  message,
  Table,
  Typography,
  Space,
  Popconfirm,
  Pagination,
  Descriptions,
  Tooltip,
} from "antd";

import axios from "axios";
import { useEffect, useState } from "react";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";
import { Endpoint } from "../constant/Endpoint";

import CaretRightOutlined from "@ant-design/icons/CaretRightOutlined";
import CaretDownOutlined from "@ant-design/icons/CaretDownOutlined";

const { Title } = Typography;

function AdminDashboard({ title }) {
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

  const expandedRowRender = (record) => {
    const expandableData = [
      { label: "Email", value: record.email },
      { label: "Mobile", value: record.number },
      { label: "Status", value: record.status },
      { label: "Remark", value: record.remark },
    ];
    return (
      <Descriptions bordered column={1} size="small" style={{ width: "30%" }}>
        {expandableData.map((item, index) => (
          <Descriptions.Item label={item.label} key={index}>
            {item.value || "-"}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );
  };
  const expandableConfig = {
    expandedRowRender,
    expandIcon: ({ expanded, onExpand, record }) =>
      expanded ? (
        <CaretDownOutlined onClick={(e) => onExpand(record, e)} />
      ) : (
        <>
          <Tooltip
            title={record.status}
            style={{
              title:
                record.status === "Accepted"
                  ? { color: "green" }
                  : { color: "red" },
            }}
          >
            <CaretRightOutlined onClick={(e) => onExpand(record, e)} />
          </Tooltip>
        </>
      ),
    rowExpandable: (record) => record.name && record.email,
    defaultExpandAllRows: false,
    expandRowByClick: true,
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
  const pageSize = 8;
  const paginatedData = applications
    .filter((app) => app && app.name && app.email && app.number)
    .slice((current - 1) * pageSize, current * pageSize);
  const handlePageChange = (page) => {
    setCurrent(page);
  };
  return (
    <>
      <div style={{ padding: 20 }}>
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

        <div>
          <Table
            className="responsive-table"
            expandable={expandableConfig}
            columns={columns}
            dataSource={paginatedData}
            rowKey={(record) => record.id || record.email + record.name}
            bordered
            pagination={false}
          />
        </div>
        <Pagination
          style={{
            position: "static",
            right: 0,
            marginTop: 16,
            marginRight: 0,
            marginBottom: 5,
            marginLeft: "82.5rem",
          }}
          defaultCurrent={1}
          hideOnSinglePage={true}
          pageSize={pageSize}
          total={applications.length}
          showTotal={(total, range) => `${range[0]}-${range[1]} of ${total}`}
          size="small"
          onChange={handlePageChange}
          current={current}
        />
      </div>
    </>
  );
}

export default AdminDashboard;
