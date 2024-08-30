import React, { useState, useEffect } from 'react';
import { Box, Button, TextField, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../components/Header';
import axios from 'axios';
import ReportDialog from '../../components/scanDialog.js';
import { useAuth } from '../../AuthContext';
import { debounce } from 'lodash';

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
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ });
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
    setError(null);

    try {


      const queryParams = buildQueryParams();
      const response = await axiosInstance.get(`/report?${queryParams}`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

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
      if (err.response && err.response.status === 400) {
        setNoResults(true);
        setResults([]);
      } else {
        setError('Error fetching data');
      }
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
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleClickOpen = async (rowData) => {
    setSelectedRow(rowData);

    try {


      // Fetch report data
      const response = await axiosInstance.get(`/report/${rowData.report_id}`, {
        headers: {
            'x-api-key': apiKey        },
      });
      setRawData(response.data.report);

      // Fetch screenshot data
      const screenshotResponse = await axiosInstance.get(`/screenshot/${rowData.report_id}`, {
        headers: {
                'x-api-key': apiKey        },
      });

      if (screenshotResponse.data.screenshot) {
        setScreenshotData(screenshotResponse.data.screenshot.screenshot);
      } else {
        setScreenshotData(false);
      }

      setOpenDialog(true);
    } catch (err) {
      setError('Error fetching data');
    }

  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData('');
    setScreenshotData(false);
  };

  const columns = [
    { field: 'submission_utc', headerName: 'Scan Time', flex: 0.4, filterable: true },
    { field: 'submission_url', headerName: 'Submission', flex: 1.5, filterable: true },
    { field: 'domain_count', headerName: 'Domains', flex: 0.3, filterable: true },
    { field: 'request_count', headerName: 'Requests', flex: 0.3, filterable: true },
    { field: 'script_count', headerName: 'Scripts', flex: 0.3, filterable: true },
    { field: 'tag', headerName: 'Tag', flex: 0.3, filterable: true },
  ];


  return (
    <Box m="20px" sx={{backgroundColor: '#191b2d'}}>
      <Header title="Scan Results" subtitle="Query Webamon Scanning Engine Results" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={fetchAssets}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="DATE"
            variant="outlined"
            value={filters.submission_utc}
            onChange={(e) => handleFilterChange('submission_utc', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="URL"
            variant="outlined"
            value={filters['request.response.url']}
            onChange={(e) => handleFilterChange('request.response.url', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="TAG"
            variant="outlined"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="Report ID"
            variant="outlined"
            value={filters.report_id}
            onChange={(e) => handleFilterChange('report_id', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="Page DOM"
            variant="outlined"
            value={filters.dom}
            onChange={(e) => handleFilterChange('dom', e.target.value)}
            sx={{ mr: '10px' }}
          />
           <TextField
              label="Page Title"
              variant="outlined"
              value={filters.page_title}
              onChange={(e) => handleFilterChange('page_title', e.target.value)}
              sx={{ mr: '10px' }}
            />
          <TextField
            label="SHA256"
            variant="outlined"
            value={filters['resource.sha256']}
            onChange={(e) => handleFilterChange('resource.sha256', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="IP"
            variant="outlined"
            value={filters['server.ip']}
            onChange={(e) => handleFilterChange('server.ip', e.target.value)}
            sx={{ mr: '10px' }}
          />
            <TextField
              label="ASN Name"
              variant="outlined"
              value={filters['server.asn.asn_org']}
              onChange={(e) => handleFilterChange('server.asn.asn_org', e.target.value)}
              sx={{ mr: '10px' }}
            />
          <TextField
            label="Country"
            variant="outlined"
            value={filters['server.country.country']}
            onChange={(e) => handleFilterChange('server.country.country', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters['domain.domain']}
            onChange={(e) => handleFilterChange('domain.domain', e.target.value)}
            sx={{ mr: '10px' }}
          />
            <TextField
              label="Server"
              variant="outlined"
              value={filters['server.server']}
              onChange={(e) => handleFilterChange('server.server', e.target.value)}
              sx={{ mr: '10px' }}
            />
          <TextField
          label="Technology"
          variant="outlined"
          value={filters['technology.technology']}
          onChange={(e) => handleFilterChange('technology.technology', e.target.value)}
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
