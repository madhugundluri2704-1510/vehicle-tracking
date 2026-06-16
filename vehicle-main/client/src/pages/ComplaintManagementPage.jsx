import React, { useState, useEffect } from 'react';
import api from '../services/api';
import useSocket from '../hooks/useSocket';
import useAuthStore from '../store/useAuthStore';
import './ComplaintManagementPage.css';

export default function ComplaintManagementPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useSocket();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchComplaints();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('new_complaint', (complaint) => {
      setComplaints((prev) => [complaint, ...prev]);
    });

    socket.on('complaint_updated', (updated) => {
      setComplaints((prev) => prev.map(c => c._id === updated._id ? updated : c));
    });

    socket.on('task_assigned', ({ complaint }) => {
      setComplaints((prev) => prev.map(c => c._id === complaint._id ? complaint : c));
    });

    return () => {
      socket.off('new_complaint');
      socket.off('complaint_updated');
      socket.off('task_assigned');
    };
  }, [socket]);

  const fetchComplaints = async () => {
    try {
      const res = await api.get(`/complaints`);
      setComplaints(res.data.complaints);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching complaints", error);
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/complaints/${id}/status`, { status: newStatus });
      // update will happen via socket
    } catch (error) {
      console.error("Error updating status", error);
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'Pending': return <span className="badge badge-warning">Pending</span>;
      case 'Assigned': return <span className="badge badge-info">Assigned</span>;
      case 'In Progress': return <span className="badge badge-primary">In Progress</span>;
      case 'Completed': return <span className="badge badge-success">Completed</span>;
      default: return <span className="badge">{status}</span>;
    }
  };

  return (
    <div className="complaint-management">
      <header className="page-header">
        <h1>🚨 Smart Complaint Management</h1>
        <p>Monitor citizen complaints and automated CCTV AI alerts in real-time.</p>
      </header>

      <div className="table-container">
        {loading ? <p>Loading complaints...</p> : (
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Source</th>
                <th>Zone/Ward</th>
                <th>Description</th>
                <th>Assigned Vehicle</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length === 0 ? (
                <tr><td colSpan="7" className="text-center">No complaints found</td></tr>
              ) : (
                complaints.map(c => (
                  <tr key={c._id}>
                    <td><strong>{c.complaintId}</strong></td>
                    <td>{c.source === 'CCTV' ? '📷 CCTV AI' : '👤 Citizen'}</td>
                    <td>{c.zone} / Ward {c.ward}</td>
                    <td className="desc-col">
                      <div>{c.description}</div>
                      {c.imageUrl && (
                        <div className="complaint-thumbnail">
                          <a href={c.imageUrl} target="_blank" rel="noreferrer">
                            <img src={c.imageUrl} alt="Complaint" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px', marginTop: '4px', border: '1px solid #ccc' }} />
                          </a>
                        </div>
                      )}
                    </td>
                    <td>
                      {c.assignedVehicleId ? (
                        <div className="assigned-info">
                          <span>{c.assignedVehicleId.vehicleNumber || 'Assigned'}</span>
                        </div>
                      ) : (
                        <span className="unassigned">Finding nearest...</span>
                      )}
                    </td>
                    <td>{getStatusBadge(c.status)}</td>
                    <td>
                      <select 
                        value={c.status} 
                        onChange={(e) => handleStatusChange(c._id, e.target.value)}
                        className="status-select"
                        disabled={user?.role !== 'admin' || c.status === 'Completed'}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Assigned">Assigned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
