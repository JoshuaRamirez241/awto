// src/pages/admin-page/Reservations.jsx
import React, { useEffect, useState } from 'react';
import { db } from '../../firebase';
import { collection, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import '../../styles/admin-styles/Reservations.css';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'reservations'), (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setReservations(list);
    });
    return () => unsub();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const reservationRef = doc(db, 'reservations', id);
      await updateDoc(reservationRef, { status: newStatus });
      console.log('Status updated');
    } catch (error) {
      console.error('Error updating reservation status:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this reservation?')) {
      try {
        await deleteDoc(doc(db, 'reservations', id));
        console.log('Reservation deleted');
      } catch (error) {
        console.error('Error deleting reservation:', error);
      }
    }
  };

  const filtered = reservations.filter(r =>
    `${r.customerName} ${r.vehiclePlate}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  <div className="reservations-container">
    <div className="reservations-header">
      <h1>📅 Reservations</h1>
      <input
        type="text"
        placeholder="Search by name or plate..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="reservation-search"
      />
    </div>

    <div className="reservation-table-wrapper">
      <table className="reservation-table">
        <thead>
          <tr>
            <th>Customer</th>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((res, i) => (
            <tr key={res.id} className="reservation-row">
              <td>{res.customerName}</td>
              <td>{res.vehicleMake} ({res.vehiclePlate})</td>
              <td>{res.service}</td>
              <td>{res.date} <br /><span className="time-label">{res.time}</span></td>
              <td>
                <select
                  className="status-dropdown"
                  value={res.status}
                  onChange={(e) => handleStatusChange(res.id, e.target.value)}
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </td>
              <td>
                <button onClick={() => handleDelete(res.id)} className="delete-btn">🗑 Delete</button>
              </td>
            </tr>
          ))}
          {filtered.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center">No reservations found.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);

};

export default Reservations;
