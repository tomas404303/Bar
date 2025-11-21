import './App.css'
import { Router, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login/Login.jsx';
import Dashboard from './pages/Dashboard/Dashboard.jsx';
import ManageLocations from './components/Dashboard/Administrator/ManageLocation/ManageLocations.jsx';
import ManageUsers from './components/Dashboard/Administrator/ManageUser/ManageUsers.jsx';
import ManageTables from './components/Dashboard/Administrator/ManageTable/ManageTables.jsx';
import ManageInventory from './components/Dashboard/Administrator/ManageInventory/ManageInventory.jsx';
import RegisterInventoryEntries from './components/Dashboard/Cashier/RegisterInventoryEntries/RegisterInventoryEntries.jsx';
import CompleteSale from './components/Dashboard/Cashier/CompleteSale/CompleteSale.jsx';
import TakeTableOrder from './components/Dashboard/Waiter/TakeTableOrder/TakeTableOrder.jsx';

function App() {
  return (
      <Routes>
        <Route path='/' element={<Navigate to="/login" replace />}></Route>
        <Route path='/login' element={<Login />}></Route>

        <Route path='/dashboard/*' element={<Dashboard />}></Route>
        <Route path='/dashboard/admin/locations' element={<ManageLocations />}></Route>
        <Route path='/dashboard/admin/users' element={<ManageUsers />}></Route>
        <Route path='/dashboard/admin/tables' element={<ManageTables />}></Route>
        <Route path='/dashboard/admin/inventory' element={<ManageInventory />}></Route>
        <Route path='/dashboard/cashier/stock' element={<RegisterInventoryEntries />}></Route>
        <Route path='/dashboard/cashier/sale' element={<CompleteSale />}></Route>
        <Route path='/dashboard/waiter/order' element={<TakeTableOrder />}></Route>
      </Routes>
  );
}

export default App
