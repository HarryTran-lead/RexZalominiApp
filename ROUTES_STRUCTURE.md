# Cấu trúc Layouts và Routes - RexZaloMiniApp

## 📁 Tổ chức thư mục

```
src/
├── layouts/                 # Layout components cho từng role
│   ├── index.ts            # Export tất cả layouts
│   ├── MainLayout.tsx      # Layout chung
│   ├── AuthLayout.tsx      # Layout cho trang auth (login, register)
│   ├── StudentLayout.tsx   # Layout cho Student (có bottom nav)
│   ├── TeacherLayout.tsx   # Layout cho Teacher
│   └── ParentLayout.tsx    # Layout cho Parent
│
└── routes/                  # Route definitions theo role
    ├── index.tsx           # MainRoutes - tổng hợp tất cả routes
    ├── AuthRoutes.tsx      # Routes cho authentication
    ├── StudentRoutes.tsx   # Routes cho Student role
    ├── TeacherRoutes.tsx   # Routes cho Teacher role
    └── ParentRoutes.tsx    # Routes cho Parent role
```

## 🎨 Layouts

### 1. **AuthLayout**
- Dùng cho: Login, Register, Account Chooser
- Style: Centered, gradient background
- Không có header/footer

### 2. **StudentLayout**
- Dùng cho: Student pages
- Features: Bottom navigation bar
- Full screen content area

### 3. **TeacherLayout**
- Dùng cho: Teacher pages
- Features: Teacher-specific header
- Full width content area

### 4. **ParentLayout**
- Dùng cho: Parent pages
- Features: Parent-specific header
- Full width content area

### 5. **MainLayout**
- Dùng cho: Public pages
- Features: Basic header/footer
- White background

## 🛣️ Routes Organization

### AuthRoutes (Public)
```typescript
/ → LoginPage
/login → LoginPage
/account-chooser → AccountChooserPage
```

### StudentRoutes (Protected)
```typescript
/student → StudentPage
/student/dashboard → Dashboard
/student/schedule → Schedule
/student/attendance → Attendance
/student/grades → Grades
```

### TeacherRoutes (Protected)
```typescript
/teacher → TeacherPage
/teacher/dashboard → Dashboard
/teacher/classes → Classes
/teacher/attendance → Attendance
/teacher/grades → Grades
```

### ParentRoutes (Protected)
```typescript
/parent → ParentPage
/parent/dashboard → Dashboard
/parent/children → Children List
/parent/attendance → Attendance
/parent/fees → Fee Management
```

## 🔐 Protected Routes

Sử dụng `ProtectedRoute` component để bảo vệ routes theo role:

```typescript
import ProtectedRoute from "@/components/auth/ProtectedRoute";

<Route
  path="/student"
  element={
    <ProtectedRoute allowedRoles={["student"]}>
      <StudentLayout>
        <StudentDashboard />
      </StudentLayout>
    </ProtectedRoute>
  }
/>
```

## 🚀 Cách sử dụng

### 1. Thêm route mới

```typescript
// routes/StudentRoutes.tsx
<Route
  path="/student/profile"
  element={
    <StudentLayout>
      <StudentProfilePage />
    </StudentLayout>
  }
/>
```

### 2. Tạo layout mới

```typescript
// layouts/CustomLayout.tsx
import React from "react";
import { Box, Page } from "zmp-ui";

interface CustomLayoutProps {
  children: React.ReactNode;
}

const CustomLayout: React.FC<CustomLayoutProps> = ({ children }) => {
  return (
    <Page className="min-h-screen">
      {/* Your layout structure */}
      {children}
    </Page>
  );
};

export default CustomLayout;
```

### 3. Navigate giữa các routes

```typescript
import { useNavigate } from "zmp-ui";

const MyComponent = () => {
  const navigate = useNavigate();

  const goToStudentDashboard = () => {
    navigate("/student/dashboard");
  };

  return <button onClick={goToStudentDashboard}>Go to Dashboard</button>;
};
```

## 📝 Best Practices

1. **Một Layout cho một Role**: Mỗi role nên có layout riêng để dễ quản lý
2. **Routes theo Feature**: Nhóm routes theo feature/module trong mỗi role
3. **Protected Routes**: Luôn protect routes cần authentication
4. **Lazy Loading**: Sử dụng React.lazy() cho code splitting (thêm sau)
5. **Error Boundaries**: Thêm error handling cho routes (thêm sau)

## 🔄 So sánh với FPTU_Event_System

| Feature | FPTU_Event_System | RexZaloMiniApp |
|---------|------------------|----------------|
| Router | React Router DOM | ZMP Router |
| Layout Wrapper | Via `<Outlet />` | Direct wrapping |
| Protected Routes | Via `ProtectedRoute` | Via `ProtectedRoute` |
| Navigation | `useNavigate()` | `useNavigate()` |
| Nested Routes | Supported | Supported |

## ⚠️ TODO

- [ ] Implement proper authentication check
- [ ] Add role-based authorization (student, parent, teacher)
- [ ] Create BottomNav component for StudentLayout
- [ ] Add Header components for Teacher and Parent layouts
- [ ] Add loading states
- [ ] Add error boundaries
- [ ] Implement lazy loading
- [ ] Add transition animations
