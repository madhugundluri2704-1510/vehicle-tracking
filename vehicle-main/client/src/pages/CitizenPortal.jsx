import React, { useState } from 'react';
import axios from 'axios';
import './CitizenPortal.css';

export default function CitizenPortal() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    ward: '',
    zone: '',
    description: '',
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [status, setStatus] = useState(''); // 'idle', 'submitting', 'success', 'error'

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          alert('Failed to get location. Please allow location access.');
        }
      );
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) {
      alert("Please capture your location first.");
      return;
    }

    setStatus('submitting');
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      await axios.post(`${API_URL}/complaints`, {
        source: 'Citizen',
        location,
        ward: Number(formData.ward),
        zone: `Zone ${formData.zone}`,
        citizenDetails: { name: formData.name, phone: formData.phone },
        description: formData.description,
        imageUrl: imagePreview, // Send base64 image
        priority: 'High'
      });
      setStatus('success');
      setFormData({ name: '', phone: '', ward: '', zone: '', description: '' });
      setLocation(null);
      setImageFile(null);
      setImagePreview(null);
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <div className="citizen-portal">
      <div className="portal-header">
        <h1>🗑️ KMC SwachthTrack</h1>
        <h2>Citizen Complaint Portal</h2>
        <p>Report overflowing garbage bins directly to the control room for immediate action.</p>
      </div>

      {status === 'success' ? (
        <div className="success-message">
          <h3>✅ Complaint Submitted Successfully!</h3>
          <p>The nearest cleaning vehicle has been notified and is on its way.</p>
          <button onClick={() => setStatus('idle')} className="btn-primary">Report Another Issue</button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="portal-form">
          <div className="form-group">
            <label>Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} required />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Ward Number (1-50)</label>
              <input type="number" name="ward" min="1" max="50" value={formData.ward} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label>Zone Number (1-10)</label>
              <input type="number" name="zone" min="1" max="10" value={formData.zone} onChange={handleChange} required />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea name="description" rows="3" value={formData.description} onChange={handleChange} placeholder="e.g., Garbage bin overflowing near the bus stop..."></textarea>
          </div>
          
          <div className="form-group">
            <label>Upload Photo (Optional)</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="file-input" />
            {imagePreview && (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Preview" className="image-preview" />
                <button type="button" className="btn-remove-image" onClick={() => { setImageFile(null); setImagePreview(null); }}>✕ Remove</button>
              </div>
            )}
          </div>

          <div className="form-group location-group">
            <label>Location</label>
            {location ? (
              <div className="location-captured">✅ Location Captured ({location.lat.toFixed(4)}, {location.lng.toFixed(4)})</div>
            ) : (
              <button type="button" className="btn-location" onClick={getLocation}>📍 Capture My Location</button>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={status === 'submitting' || !location}>
            {status === 'submitting' ? 'Submitting...' : 'Submit Complaint'}
          </button>
          {status === 'error' && <p className="error-text">Failed to submit complaint. Please try again.</p>}
        </form>
      )}
    </div>
  );
}
