import './App.css'
import { Router, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import Login from './pages/Login/Login.jsx';

import IdleProvider from './hook/IdleProvider.jsx'
import ProtectedRoute from './components/ProtectRoute/ProtectedRoute.jsx'
import ProtectedRoleRoute from './components/ProtectRoute/ProtectedRoleRoute.jsx'

import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ManageLocations from './components/Dashboard/Administrator/ManageLocation/ManageLocations.jsx';
import ManageUsers from './components/Dashboard/Administrator/ManageUser/ManageUsers.jsx';
import ManageTables from './components/Dashboard/Administrator/ManageTable/ManageTables.jsx';
import ManageInventory from './components/Dashboard/Administrator/ManageInventory/ManageInventory.jsx';
import RegisterInventoryEntries from './components/Dashboard/Cashier/RegisterInventoryEntries/RegisterInventoryEntries.jsx';
import CompleteSale from './components/Dashboard/Cashier/CompleteSale/CompleteSale.jsx';
import TakeTableOrder from './components/Dashboard/Waiter/TakeTableOrder/TakeTableOrder.jsx';
import GenerateReports from './components/Dashboard/Cashier/GenerateReports/GenerateReports.jsx';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />}></Route>
        <Route path='/login' element={<Login />}></Route>
        <Route element={
          <ProtectedRoute>
            <IdleProvider>
              <Outlet/>
            </IdleProvider>
          </ProtectedRoute>}>
          <Route path='/dashboard/*' element={<Dashboard />}></Route>
          <Route path='/dashboard/admin/locations' element={<ProtectedRoleRoute roles={["Administrator"]}><ManageLocations /></ProtectedRoleRoute>}></Route>
          <Route path='/dashboard/admin/users' element={<ProtectedRoleRoute roles={["Administrator"]}><ManageUsers /></ProtectedRoleRoute>}></Route>
          <Route path='/dashboard/admin/tables' element={<ProtectedRoleRoute roles={["Administrator"]}><ManageTables /></ProtectedRoleRoute>}></Route>
          <Route path='/dashboard/admin/inventory' element={<ProtectedRoleRoute roles={["Administrator"]}><ManageInventory /></ProtectedRoleRoute>}></Route>
          
          <Route path='/dashboard/cashier/stock' element={<ProtectedRoleRoute roles={["Administrator", "Cashier"]}><RegisterInventoryEntries /></ProtectedRoleRoute>}></Route>
          <Route path='/dashboard/cashier/sale' element={<ProtectedRoleRoute roles={["Administrator", "Cashier"]}><CompleteSale /></ProtectedRoleRoute>}></Route>
          <Route path='/dashboard/cashier/reports' element={<ProtectedRoleRoute roles={["Administrator", "Cashier"]}><GenerateReports /></ProtectedRoleRoute>}></Route>

          <Route path='/dashboard/waiter/order' element={<ProtectedRoleRoute roles={["Administrator", "Waiter"]}><TakeTableOrder /></ProtectedRoleRoute>}></Route>
        </Route>
      </Routes>
  );
}

export default App
