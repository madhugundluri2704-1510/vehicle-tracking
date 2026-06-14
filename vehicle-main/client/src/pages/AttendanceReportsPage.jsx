import { useState, useEffect } from 'react';
import useWorkforceStore from '../store/useWorkforceStore';
import useDriverStore from '../store/useDriverStore';
import { FaFilePdf, FaFileExcel, FaFileCsv, FaFilter, FaSearch, FaPrint } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import './AttendanceReportsPage.css';

export default function AttendanceReportsPage() {
  const { drivers, fetchDrivers } = useDriverStore();
  const { reportsData, loading, fetchReports } = useWorkforceStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [selectedShift, setSelectedShift] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [reportType, setReportType] = useState('all'); // 'all', 'overtime'

  useEffect(() => {
    fetchDrivers({ status: 'active' });
    
    // Set default dates (past 7 days)
    const today = new Date();
    const past7 = new Date();
    past7.setDate(today.getDate() - 7);
    
    setStartDate(past7.toISOString().split('T')[0]);
    setEndDate(today.toISOString().split('T')[0]);

    // Initial fetch
    fetchReports({
      startDate: past7.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    });
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchReports({
      startDate,
      endDate,
      driverId: selectedDriverId,
      shift: selectedShift,
      status: selectedStatus,
      reportType
    });
  };

  const getExportData = () => {
    return reportsData.map(log => ({
      'Date': log.date,
      'Driver Name': log.driverId?.driverName || 'Operator',
      'Shift': log.driverId?.shiftTime || 'N/A',
      'Vehicle': log.assignedVehicle?.vehicleNumber || 'Unassigned',
      'Check In': new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      'Check Out': log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active',
      'Working Hours': log.checkOut ? `${log.totalHours.toFixed(1)} hrs` : 'Calculating...',
      'Break Hours': `${log.breakTime?.toFixed(1) || 0.0} hrs`,
      'Overtime': `${log.overtime?.toFixed(1) || 0.0} hrs`,
      'Status': log.status
    }));
  };

  // 1. Export Excel
  const exportExcel = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Shift Attendance Logs');
    XLSX.writeFile(workbook, `kmc_attendance_report_${Date.now()}.xlsx`);
  };

  // 2. Export CSV
  const exportCsv = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    const worksheet = XLSX.utils.json_to_sheet(data);
    const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
    
    const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kmc_attendance_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 3. Export PDF using jsPDF
  const exportPdf = () => {
    const data = getExportData();
    if (data.length === 0) return alert('No data available to export.');

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Kurnool Municipal Corporation - Attendance Roster Report', 14, 20);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 28);
    doc.text(`Date Range: ${startDate || 'N/A'} to ${endDate || 'N/A'}`, 14, 34);

    let yOffset = 45;
    
    // Simple table rendering text line by line
    doc.setFont('helvetica', 'bold');
    doc.text('Date', 14, yOffset);
    doc.text('Driver Name', 40, yOffset);
    doc.text('Vehicle', 90, yOffset);
    doc.text('In / Out', 120, yOffset);
    doc.text('Hours', 160, yOffset);
    doc.text('Status', 185, yOffset);
    
    doc.line(14, yOffset + 2, 200, yOffset + 2);
    yOffset += 8;

    doc.setFont('helvetica', 'normal');
    data.forEach((row) => {
      if (yOffset > 280) {
        doc.addPage();
        yOffset = 20;
      }
      doc.text(row.Date, 14, yOffset);
      doc.text(row['Driver Name'].substring(0, 20), 40, yOffset);
      doc.text(row.Vehicle, 90, yOffset);
      doc.text(`${row['Check In']} - ${row['Check Out']}`, 120, yOffset);
      doc.text(row['Working Hours'], 160, yOffset);
      doc.text(row.Status, 185, yOffset);
      yOffset += 7;
    });

    doc.save(`kmc_attendance_report_${Date.now()}.pdf`);
  };

  // 4. Trigger print view
  const triggerPrint = () => {
    window.print();
  };

  return (
    <div className="reports-page container">
      {/* 1. Filter Panel */}
      <div className="card filter-card no-print">
        <div className="card-header">
          <h2 className="card-title"><FaFilter /> Attendance Report Query Panel</h2>
        </div>
        <form onSubmit={handleFilterSubmit} className="filter-form">
          <div className="filter-inputs">
            <div className="input-group">
              <label className="input-label">Start Date</label>
              <input 
                type="date" 
                className="input" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">End Date</label>
              <input 
                type="date" 
                className="input" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <label className="input-label">Operator</label>
              <select 
                className="select"
                value={selectedDriverId}
                onChange={(e) => setSelectedDriverId(e.target.value)}
              >
                <option value="">All Drivers</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>{d.driverName}</option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Shift</label>
              <select 
                className="select"
                value={selectedShift}
                onChange={(e) => setSelectedShift(e.target.value)}
              >
                <option value="">All Shifts</option>
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="night">Night</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Shift Status</label>
              <select 
                className="select"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Present">Present</option>
                <option value="Late">Late</option>
                <option value="Absent">Absent</option>
                <option value="Half-Day">Half-Day</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Report Class</label>
              <select 
                className="select"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="all">Full Shift Attendance</option>
                <option value="overtime">Overtime Log Only</option>
              </select>
            </div>
          </div>

          <button type="submit" className="btn btn-primary filter-submit-btn">
            Generate Report
          </button>
        </form>
      </div>

      {/* 2. Print Header (hidden on screen, shown on print layout) */}
      <div className="print-header-only">
        <h1>Kurnool Municipal Corporation</h1>
        <h2>Smart Cleaning Workforce Attendance & Hours Report</h2>
        <p>Report Range: {startDate} to {endDate}</p>
        <p>Generated: {new Date().toLocaleString()}</p>
        <hr />
      </div>

      {/* 3. Output Table */}
      <div className="card report-card">
        <div className="card-header no-print">
          <h2 className="card-title">Generated Log Output ({reportsData.length} records)</h2>
          <div className="export-buttons">
            <button className="btn btn-secondary btn-sm" onClick={triggerPrint} title="Print Roster">
              <FaPrint /> Print
            </button>
            <button className="btn btn-secondary btn-sm text-red" onClick={exportPdf} title="Export PDF">
              <FaFilePdf /> PDF
            </button>
            <button className="btn btn-secondary btn-sm text-green" onClick={exportExcel} title="Export Excel">
              <FaFileExcel /> Excel
            </button>
            <button className="btn btn-secondary btn-sm text-blue" onClick={exportCsv} title="Export CSV">
              <FaFileCsv /> CSV
            </button>
          </div>
        </div>

        <div className="data-table-wrapper">
          {loading ? (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Fetching report queries...</p>
            </div>
          ) : reportsData.length === 0 ? (
            <div className="empty-state">
              <span className="empty-state-icon">📄</span>
              <p className="empty-state-text">No records match the current filters. Adjust your query parameters above.</p>
            </div>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Shift Date</th>
                  <th>Driver Name</th>
                  <th>Shift Class</th>
                  <th>Vehicle Link</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Working Hours</th>
                  <th>Break Hours</th>
                  <th>Overtime Log</th>
                  <th>Shift Status</th>
                </tr>
              </thead>
              <tbody>
                {reportsData.map((log) => {
                  const checkInTime = log.checkIn ? new Date(log.checkIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-';
                  const checkOutTime = log.checkOut ? new Date(log.checkOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (log.status === 'Absent' ? '-' : 'Active');
                  return (
                    <tr key={log._id}>
                      <td>{log.date}</td>
                      <td><strong>{log.driverId?.driverName || 'Operator'}</strong></td>
                      <td><span className="shift-pill">{log.driverId?.shiftTime || 'N/A'}</span></td>
                      <td>{log.assignedVehicle?.vehicleNumber || 'Unassigned'}</td>
                      <td>{checkInTime}</td>
                      <td>{checkOutTime}</td>
                      <td>{log.totalHours ? `${log.totalHours.toFixed(1)} hrs` : (log.status === 'Absent' ? '0.0 hrs' : 'Active')}</td>
                      <td>{log.breakTime ? `${log.breakTime.toFixed(1)} hrs` : '0.0 hrs'}</td>
                      <td>
                        {log.overtime > 0 ? (
                          <span className="overtime-tag">+{log.overtime.toFixed(1)} hrs</span>
                        ) : '0.0 hrs'}
                      </td>
                      <td>
                        <span className={`badge badge-${log.status.toLowerCase()}`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
