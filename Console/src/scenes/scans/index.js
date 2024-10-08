import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, CircularProgress, Tooltip, IconButton } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../components/Header';
import axios from 'axios';
import ReportDialog from '../../components/scanDialog.js';
import { useAuth } from '../../AuthContext';
import { debounce } from 'lodash';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const Scans = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [screenshotData, setScreenshotData] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({});
  const [statusColor, setStatusColor] = useState(''); // State for status color
  const [rowLoading, setRowLoading] = useState(null); // State for row-specific loading
  const { apiKey } = useAuth();

  const buildQueryParams = () => {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(filters)) {
      if (value.trim() !== '') {
        const paramValue = key === 'request.response.url' ? `"${value}"` : value;
        params.append(key, paramValue);
      }
    }

    return params.toString();
  };

  const fetchAssets = async () => {
    setLoading(true);
    setStatusColor('yellow'); // Set status color to yellow when loading

    try {
      const queryParams = buildQueryParams();
      const response = await axiosInstance.get(`/report?${queryParams}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      // Set status color based on response status
      if (response.status === 200) {
        setStatusColor('green');
      }

      const mappedResults = response.data.reports.map((hit) => ({
        report_id: hit.meta.report_id,
        tag: hit.tag,
        submission_utc: hit.meta.submission_utc,
        submission_url: hit.meta.submission_url,
        script_count: hit.meta.script_count,
        request_count: hit.meta.request_count,
        domain_count: hit.meta.domain_count,
      }));

      setResults(mappedResults);
    } catch (err) {
      // Set status color based on error response status
      if (err.response) {
        if (err.response.status === 400) {
          setStatusColor('blue');
        } else if (err.response.status >= 500) {
          setStatusColor('red');
        }
      } else {
        setStatusColor('red'); // General error handling
      }
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debouncedFetch = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedFetch();

    return () => {
      debouncedFetch.cancel();
    };
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setStatusColor('yellow');
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  // Function to clear filters
  const handleClearFilters = () => {
    setStatusColor('yellow');
    setFilters({});
  };

  const handleClickOpen = async (rowData) => {
  setLoading(true)
    setRowLoading(rowData.report_id); // Set row-specific loading state

    try {
      setStatusColor('yellow'); // Set status color to yellow when fetching

      const response = await axiosInstance.get(`/report/${rowData.report_id}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      setRawData(response.data.report);

      const screenshotResponse = await axiosInstance.get(`/screenshot/${rowData.report_id}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (screenshotResponse.data.screenshot) {
        setScreenshotData(screenshotResponse.data.screenshot.screenshot);
      } else {
        setScreenshotData(false);
      }

      setOpenDialog(true);
      setStatusColor('green');
    } catch (err) {
      // Set status color based on error response status
      if (err.response) {
        if (err.response.status === 400) {
          setStatusColor('blue');
        } else if (err.response.status >= 500) {
          setStatusColor('red');
        }
      } else {
        setStatusColor('red'); // General error handling
      }
      console.log('Error fetching data');
    } finally {
      setRowLoading(null);
       setLoading(false)// Reset row-specific loading state
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData('');
    setScreenshotData(false);
  };

  const columns = [
    {
      field: 'expand',
      headerName: '',
      flex: 0.05,
      sortable: false,
      renderCell: (params) => (
        <Tooltip title="Click for more info">
          <IconButton>
            <ExpandMoreIcon />
          </IconButton>
        </Tooltip>
      ),
    },
    { field: 'submission_utc', headerName: 'Scan Time', flex: 0.3, filterable: true },
    { field: 'submission_url', headerName: 'Submission', flex: 0.7, filterable: true },
    { field: 'domain_count', headerName: 'Domains', flex: 0.2, filterable: true },
    { field: 'request_count', headerName: 'Requests', flex: 0.2, filterable: true },
    { field: 'script_count', headerName: 'Scripts', flex: 0.2, filterable: true },
    { field: 'tag', headerName: 'Tag', flex: 0.3, filterable: true },
  ];

  // Map status color to text for the tooltip
  const statusText = {
    green: 'Success',
    blue: 'No Results',
    red: '5xx Server Error',
    yellow: 'Loading...',
    '': 'Idle',
  };

  return (
    <Box m="20px" sx={{ backgroundColor: '#191b2d' }}>
      <Header title="Scan Results" subtitle="Query Webamon Scanning Engine Results" />
      <Box m="40px 0 0 0" height="75vh">
        {/* Container for the buttons and status color indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', mb: '20px' }}>
          {/* Status color indicator with tooltip */}
          <Tooltip title={statusText[statusColor] || 'Unknown Status'}>
            <Box
              sx={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                backgroundColor: statusColor,
                marginRight: '10px',
                border: '1px solid #ddd',
                cursor: 'pointer'
              }}
            />
          </Tooltip>
          {loading && <CircularProgress size={20} sx={{ color: '#ffffff' }} />} {/* Set inline color */}
          {/* Box containing the buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button variant="contained" color="primary" onClick={handleClearFilters} style={{ backgroundColor: "#ffffff", color: "#343b6f", marginLeft: "10px", fontSize: "16px" }}>
              Clear Filters
            </Button>
            <Button variant="contained" color="primary" onClick={fetchAssets} style={{ backgroundColor: "#ffffff", color: "#343b6f", marginLeft: "10px", fontSize: "16px"  }}>
              Refresh
            </Button>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="DATE"
            variant="outlined"
            value={filters.submission_utc || ''}
            onChange={(e) => handleFilterChange('submission_utc', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="URL"
            variant="outlined"
            value={filters['request.response.url'] || ''}
            onChange={(e) => handleFilterChange('request.response.url', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="TAG"
            variant="outlined"
            value={filters.tag || ''}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="Report ID"
            variant="outlined"
            value={filters.report_id || ''}
            onChange={(e) => handleFilterChange('report_id', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="Page DOM"
            variant="outlined"
            value={filters.dom || ''}
            onChange={(e) => handleFilterChange('dom', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="Page Title"
            variant="outlined"
            value={filters.page_title || ''}
            onChange={(e) => handleFilterChange('page_title', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="SHA256"
            variant="outlined"
            value={filters['resource.sha256'] || ''}
            onChange={(e) => handleFilterChange('resource.sha256', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="IP"
            variant="outlined"
            value={filters['server.ip'] || ''}
            onChange={(e) => handleFilterChange('server.ip', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="ASN NAME"
            variant="outlined"
            value={filters['server.asn.name'] || ''}
            onChange={(e) => handleFilterChange('server.asn.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="COUNTRY"
            variant="outlined"
            value={filters['server.country.name'] || ''}
            onChange={(e) => handleFilterChange('server.country.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters['domain.name'] || ''}
            onChange={(e) => handleFilterChange('domain.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="SERVER"
            variant="outlined"
            value={filters['server.server'] || ''}
            onChange={(e) => handleFilterChange('server.server', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="TECHNOLOGY"
            variant="outlined"
            value={filters['technology.name'] || ''}
            onChange={(e) => handleFilterChange('technology.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
        </Box>
        <DataGrid
          sx={{ fontSize: '20px' }}
          rows={results}
          columns={columns}
          getRowId={(row) => row.report_id}
          onRowClick={(params) => handleClickOpen(params.row)}
          disableColumnMenu={false}
          components={{ Toolbar: GridToolbar }}
          loading={loading} // Use the loading state to show the loading overlay
        />
        <ReportDialog
          open={openDialog}
          onClose={handleCloseDialog}
          rowData={rawData}
          screenshot={screenshotData} // Pass screenshot data to ReportDialog
        />
      </Box>
    </Box>
  );
};

export default Scans;
