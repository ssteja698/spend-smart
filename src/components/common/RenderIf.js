const RenderIf = ({ children, condition }) => {
  if (condition) {
    return children;
  }
  return null;
};

export default RenderIf;
