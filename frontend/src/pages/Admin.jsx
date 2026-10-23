import { useEffect, useState } from 'react';
import { FaUsers, FaChartLine, FaTrash, FaSeedling } from 'react-icons/fa';
import { getUsers, deleteUser, getPredictionHistory } from '../utils/auth';
function Admin() {
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  useEffect(() => {
    refresh();
  }, []);
  function refresh() {
    setUsers(getUsers());
    setHistory(getPredictionHistory());
  }
  function handleDelete(email) {
    if (!confirm(`Remove the account for ${email}?`)) return;
    deleteUser(email);
    refresh();
  }
  return <section className='min-h-screen py-10 sm:py-16 bg-green-50'>
      <div className='max-w-6xl mx-auto px-4 sm:px-8'>
        <h1 className='text-3xl sm:text-4xl font-bold text-green-700 mb-2'>
          Admin Panel
        </h1>

        <p className='text-gray-500 mb-6 sm:mb-10'>
          Registered users and prediction activity stored in this browser.
        </p>

        <div className='grid sm:grid-cols-2 gap-4 sm:gap-6 mb-8 sm:mb-12'>
          <div className='bg-white rounded-2xl shadow p-5 sm:p-8 flex items-center gap-4 sm:gap-5'>
            <div className='bg-green-100 text-green-600 text-3xl p-4 rounded-xl'>
              <FaUsers />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Registered Users</p>
              <p className='text-3xl font-bold text-gray-800'>
                {users.length}
              </p>
            </div>
          </div>

          <div className='bg-white rounded-2xl shadow p-5 sm:p-8 flex items-center gap-4 sm:gap-5'>
            <div className='bg-green-100 text-green-600 text-3xl p-4 rounded-xl'>
              <FaChartLine />
            </div>
            <div>
              <p className='text-sm text-gray-500'>Predictions Run</p>
              <p className='text-3xl font-bold text-gray-800'>
                {history.length}
              </p>
            </div>
          </div>
        </div>

        <div className='bg-white rounded-2xl shadow p-4 sm:p-8 mb-8 sm:mb-12 overflow-x-auto'>
          <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
            <FaUsers className='text-green-600' /> Registered Users
          </h2>

          {users.length === 0 ? <p className='text-gray-400'>No users have registered yet.</p> : <table className='w-full min-w-[480px] text-left text-sm'>
              <thead>
                <tr className='text-gray-500 border-b'>
                  <th className='py-3 pr-4'>Name</th>
                  <th className='py-3 pr-4'>Email</th>
                  <th className='py-3 pr-4'>Registered</th>
                  <th className='py-3 pr-4'></th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => <tr key={u.email} className='border-b last:border-0'>
                    <td className='py-3 pr-4 font-medium'>{u.name}</td>
                    <td className='py-3 pr-4 text-gray-600'>{u.email}</td>
                    <td className='py-3 pr-4 text-gray-500'>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className='py-3 pr-4 text-right'>
                      <button onClick={() => handleDelete(u.email)} className='text-red-500 hover:text-red-700' title='Remove user'>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>)}
              </tbody>
            </table>}
        </div>

        <div className='bg-white rounded-2xl shadow p-4 sm:p-8 overflow-x-auto'>
          <h2 className='text-xl font-bold mb-6 flex items-center gap-2'>
            <FaSeedling className='text-green-600' /> Recent Predictions
          </h2>

          {history.length === 0 ? <p className='text-gray-400'>No predictions have been run yet.</p> : <table className='w-full min-w-[680px] text-left text-sm'>
              <thead>
                <tr className='text-gray-500 border-b'>
                  <th className='py-3 pr-4'>User</th>
                  <th className='py-3 pr-4'>Crop</th>
                  <th className='py-3 pr-4'>Seed Quality</th>
                  <th className='py-3 pr-4'>Yield</th>
                  <th className='py-3 pr-4'>Harvest</th>
                  <th className='py-3 pr-4'>When</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => <tr key={i} className='border-b last:border-0'>
                    <td className='py-3 pr-4 font-medium'>
                      {h.userEmail || 'Guest'}
                    </td>
                    <td className='py-3 pr-4'>{h.cropType}</td>
                    <td className='py-3 pr-4'>{h.seedQuality}</td>
                    <td className='py-3 pr-4'>{h.expectedYield}</td>
                    <td className='py-3 pr-4'>{h.harvestTime}</td>
                    <td className='py-3 pr-4 text-gray-500'>
                      {new Date(h.loggedAt).toLocaleString()}
                    </td>
                  </tr>)}
              </tbody>
            </table>}
        </div>
      </div>
    </section>;
}
export default Admin;
