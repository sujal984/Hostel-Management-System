import { Helmet } from "react-helmet";
export function WithHelmet(Component,title) {
  return (props) => <Component {...props} 
  <Helmet><title>{title}</title></Helmet>
  
  />;
}
