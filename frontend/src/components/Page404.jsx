import { Button, Result } from "antd";
import { useNavigate } from "react-router-dom";
function Page404() {
  const navigate = useNavigate();
  const onclick = () => {
    navigate("/");
  };
  return (
    <Result
      style={{
        height: "100vh",
      }}
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={onclick}>
          Back Home
        </Button>
      }
    />
  );
}
export default Page404;
