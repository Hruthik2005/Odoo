// src/App.js (or src/App.jsx) - Your new main entry file

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './Layout'; // 👈 IMPORTING YOUR LAYOUT

// 🚨 You must create and import your actual page components here
import Login from './Pages/Login'; 
import Dashboard from './Pages/Dashboard';
import EmployeeExpenses from './Pages/EmployeeExpenses';
import ManagerApprovals from './Pages/ManagerApprovals';
import AdminUsers from './Pages/AdminUsers';
import AdminApprovalRules from './Pages/AdminApprovalRules';


function App() {
  return (
    // The Router is the root of all your navigation
    <Router>
      <Routes>
        
        {/* Route for Login - This page likely has no sidebar/layout */}
        <Route path="/login" element={<Login />} />

        {/* 👇 Routes that USE your Layout component for the sidebar and structure */}
        {/* We pass the actual Page component as "children" to the Layout component */}
        
        <Route 
          path="/" 
          element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} 
        />
        <Route 
          path="/expenses" 
          element={<Layout currentPageName="EmployeeExpenses"><EmployeeExpenses /></Layout>} 
        />
        <Route 
          path="/approvals" 
          element={<Layout currentPageName="ManagerApprovals"><ManagerApprovals /></Layout>} 
        />
        <Route 
          path="/admin/users" 
          element={<Layout currentPageName="AdminUsers"><AdminUsers /></Layout>} 
        />
        <Route 
          path="/admin/rules" 
          element={<Layout currentPageName="AdminApprovalRules"><AdminApprovalRules /></Layout>} 
        />

        {/* You may want a catch-all route for 404 pages here */}
        
      </Routes>
    </Router>
  );
}

export default App;