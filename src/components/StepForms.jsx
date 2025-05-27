import { Steps } from "antd";

function StepForms({ stepNo }) {
  const steps = [
    {
      title: "Personal Detail",
    },
    {
      title: "Education Detail",
    },
    {
      title: "Requirement",
    },
  ];
  return <Steps current={stepNo} items={steps} />;
}

export default StepForms;
