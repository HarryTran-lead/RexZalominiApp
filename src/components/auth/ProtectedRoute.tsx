import React, { ReactElement } from "react";
import { useNavigate } from "zmp-ui";

interface ProtectedRouteProps {
  children: ReactElement;
  allowedRoles: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const navigate = useNavigate();

  // Kiểm tra authentication và authorization
  const isAuthenticated = () => {
    // TODO: Implement proper auth check
    // const token = localStorage.getItem("token");
    // return !!token;
    return true; // Tạm thời cho phép tất cả
  };

  const hasPermission = () => {
    // TODO: Implement role-based check
    // const userRole = localStorage.getItem("userRole");
    // return allowedRoles.includes(userRole || "");
    return true; // Tạm thời cho phép tất cả
  };

  React.useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }

    if (!hasPermission()) {
      navigate("/"); // Redirect về trang chủ nếu không có quyền
      return;
    }
  }, [navigate]);

  if (!isAuthenticated() || !hasPermission()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
