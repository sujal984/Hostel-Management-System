import { Helmet } from "react-helmet";

// Higher-Order Component with Helmet
export function WithHelmet(Component, title) {
  return function WrappedComponent(props) {
    return (
      <>
        <Helmet>
          <title>{title}</title>
        </Helmet>
        <Component {...props} />
      </>
    );
  };
}
