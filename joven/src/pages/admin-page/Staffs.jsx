import React, { useEffect, useState } from 'react';
import { collection, getDocs, query, where, doc, setDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase';
import '../../styles/AdminDashboard.css';

const Staffs = () => {
  const [staffs, setStaffs] = useState([]);
  const [newStaff, setNewStaff] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Fetch staff users from Firestore where role === 'Staff'
  const fetchStaffs = async () => {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('role', '==', 'Staff'));
      const querySnapshot = await getDocs(q);
      const staffList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStaffs(staffList);
    } catch (error) {
      console.error('Error fetching staff:', error);
      alert('Faileds to load staff data.');
    }
  };

  useEffect(() => {
    fetchStaffs();
  }, []);

  // Handle input change for the add staff form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewStaff(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle add new staff button
  const handleAddStaff = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Create new user in Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        newStaff.email,
        newStaff.password
      );
      const user = userCredential.user;

      // 2. Create user document in Firestore users collection
      await setDoc(doc(db, 'users', user.uid), {
        name: newStaff.name,
        email: newStaff.email,
        role: 'Staff',
        createdAt: new Date().toISOString(),
      });

      // 3. Update staff list and reset form
      await fetchStaffs();
      setNewStaff({ name: '', email: '', password: '' });

      alert('Staff account created successfully!');
    } catch (error) {
      console.error('Error creating staff:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
  <div className="staff-container">
    <div className="staff-header">
      <h2>👥 Staff Management</h2>
    </div>

    <div className="staff-content">
      <div className="staff-form-section">
        <h3>Add New Staff</h3>
        <form className="staff-form" onSubmit={handleAddStaff}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={newStaff.name}
            onChange={handleInputChange}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={newStaff.email}
            onChange={handleInputChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Temporary Password"
            value={newStaff.password}
            onChange={handleInputChange}
            required
            minLength={6}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating...' : '➕ Add Staff'}
          </button>
        </form>
      </div>

      <div className="staff-list-section">
        <h3>Current Staff</h3>
        {staffs.length === 0 ? (
          <p className="no-staff">No staff registered yet.</p>
        ) : (
          <ul className="staff-list">
            {staffs.map((staff) => (
              <li key={staff.id} className="staff-item">
                <div className="staff-avatar">
                  <span>{staff.name.charAt(0).toUpperCase()}</span>
                </div>
                <div className="staff-info">
                  <strong>{staff.name}</strong>
                  <small>{staff.email}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  </div>
);

};

export default Staffs;
