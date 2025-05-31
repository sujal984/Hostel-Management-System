# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Hostel-Management

import React from 'react';
import { Table, Descriptions, Tag } from 'antd';
import { CaretRightOutlined, CaretDownOutlined } from '@ant-design/icons';

const ExpandableTable = ({ applications, columns }) => {
// Expanded row render function
const expandedRowRender = (record) => {
const expandableData = [
{ label: 'Email', value: record.email },
{ label: 'Phone', value: record.number },
{ label: 'Status', value: record.status },
{ label: 'Applied Date', value: record.createdAt },
// Add more fields as needed
];

    return (
      <Descriptions bordered column={2} size="small">
        {expandableData.map((item, index) => (
          <Descriptions.Item label={item.label} key={index}>
            {item.value || '-'}
          </Descriptions.Item>
        ))}
      </Descriptions>
    );

};

// Expandable configuration
const expandableConfig = {
expandedRowRender,
expandIcon: ({ expanded, onExpand, record }) =>
expanded ? (
<CaretDownOutlined onClick={(e) => onExpand(record, e)} />
) : (
<CaretRightOutlined onClick={(e) => onExpand(record, e)} />
),
rowExpandable: (record) => record.name && record.email,
defaultExpandAllRows: false,
expandRowByClick: true,
};

return (
<div style={{ padding: 16 }}>
<Table
columns={columns}
dataSource={applications.filter(
(app) => app && app.name && app.email && app.number
)}
rowKey={(record) => record.id || record.email + record.name}
bordered
expandable={expandableConfig}
pagination={{
          pageSize: 10,
          defaultCurrent: 1,
          total: applications.length,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
          size: "small",
        }}
/>
</div>
);
};

export default ExpandableTable;
