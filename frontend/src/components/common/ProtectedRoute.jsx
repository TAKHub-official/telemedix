import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

// A wrapper component that redirects to login if the user isn't authenticated
// or doesn't have the required role
const ProtectedRoute = ({ isAllowed, redirectPath = '/login', children }) => {
  if (!isAllowed) {
    return <Navigate to={redirectPath} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  isAllowed: PropTypes.bool.isRequired,
  redirectPath: PropTypes.string,
  children: PropTypes.node.isRequired
};

export default ProtectedRoute; 