export function WithHelmet(Component) {
  return (props) => <Component {...props} />;
}
