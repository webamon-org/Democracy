import React, { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import MaterialTabs from './ReportTab';

function ReportDialog({ open, onClose, rowData, screenshot}) {
  const [reportData, setReportData] = useState(null);

  const handleClose = () => {
    onClose();
    setReportData(null);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setReportData(rowData);
      } catch (error) {
        console.error('Error fetching report data:', error);
      }
    };

    if (rowData) {
      fetchData();
    }
  }, [rowData]);

  if (!reportData) {
    return null; // Return null if rowData is not available
  }


  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xl"
            sx={{
     '& .MuiDialog-paper': {
          backgroundColor: '#171b2d',
          color: 'text.primary',
          width: '99vw', // 80% of the viewport width
          height: '90vh', // 80% of the viewport height
          maxWidth: 'none', // Ensure it doesn't default to any max width
        },
      }}
    >
      <DialogTitle style={{ display: 'flex', overflow: 'auto',backgroundColor: '#171b2d' }} >{reportData.submission_url} - {reportData.report_id} </DialogTitle>
      <DialogContent style={{ display: 'flex', overflow: 'auto',backgroundColor: '#171b2d' }}>
        <div style={{ flex: '1', overflow: 'auto' }}>
          <MaterialTabs reportData={reportData} screenshot={screenshot} />
        </div>
      </DialogContent>
      <DialogActions style={{ display: 'flex', overflow: 'auto',backgroundColor: '#171b2d' }} >
              <Button onClick={handleClose} variant="contained" color="primary" size="large" style={{ backgroundColor: "#ffffff", color: "#343b6f",}}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

export default ReportDialog;
