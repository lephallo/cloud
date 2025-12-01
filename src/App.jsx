import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import ManageUsers from "./pages/ManageUsers";
import Notifications from "./pages/NotificationsPage";
import ViewProgress from "./pages/ViewProgress";

import ManageQuizzes from "./pages/ManageQuizzes";
import Tips from "./pages/Tips";
import Materials from "./pages/Materials";
import QuizPage from "./pages/QuizPage";
import UpdateProfile from "./pages/UpdateProfile";
import Certificate from "./pages/Certificate";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/teacher" element={<TeacherDashboard />} />
         <Route path="/admin/manage-users" element={<ManageUsers />} />
         <Route path="/admin/view-progress" element={<ViewProgress />} />
         <Route path="/admin/notifications" element={<Notifications />} />
         <Route path="/update-profile" element={<UpdateProfile />} />
           <Route path="/" element={<Home />} />
         <Route path="/take-quiz/:quizId" element={<QuizPage />} />
         <Route path="/certificate" element={<Certificate />} />
         <Route path="/manage-quizzes" element={<ManageQuizzes />} />
         <Route path="/tips" element={<Tips />} />
         <Route path="/materials" element={<Materials />} />
         
      </Routes>
    </Router>
  );
}

export default App;
