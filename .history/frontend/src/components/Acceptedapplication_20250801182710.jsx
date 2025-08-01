import { Button, Table, Typography } from "antd";
import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { Endpoint } from "../constant/Endpoint";
const { Title } = Typography;
function AcceptedApplication({ title }) {
  const [applications, setApplications] = useState([]);
  const navigate = useNavigate();
  const fetchApplications = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}${Endpoint.acceptedapplications}`
      );

      if (response.data && response.data.applications) {
        setApplications(response.data.applications);

        // return applications;
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
      throw error;
    }
  };
  useEffect(() => {
    fetchApplications();
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
    { title: "Status", dataIndex: "status", key: "status" },
    { title: "Room Number", dataIndex: "room_number", key: "room_number" },
  ];

  return (
    <>
      <Title level={3} className="form-title">
        Accepted Applications
      </Title>
      <div>
        <Button
          onClick={() => navigate("/Admin/dashboard")}
          type="primary"
          style={{ marginLeft: "1rem", marginBottom: "1rem" }}
        >
          Back
        </Button>
      </div>
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
    </>
  );
}
export default AcceptedApplication;
