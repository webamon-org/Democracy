import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Tooltip  } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../../components/Header';
import axios from 'axios';
import ReportDialog from '../../../components/scanDialog.js';
import { Auth } from 'aws-amplify';
import { debounce } from 'lodash';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const WebamonXtend = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [noResults, setNoResults] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    'ip': '',
    'dom': '',
    'url': '',
    'tag': '',
    'contacted.domain': '',
    'date': ''
  });


     const buildQueryParams = () => {
       const params = new URLSearchParams();

       for (const [key, value] of Object.entries(filters)) {
         if (value.trim() !== '') {
           params.append(key, value);
         }
       }


       return params.toString();
     };

  const fetchAssets = async (filterParams) => {
    setError(null);

    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;
              const queryParams = buildQueryParams();
      const response = await axiosInstance(`/feed?feed=webamon_x&${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mappedResults = response.data.feed.map((hit) => ({
        time: hit.submissionUTC,
        scanUrl: hit.meta.submission,
        scriptCount: hit.meta.scriptCount,
        requestCount: hit.meta.requestCount,
        contactCount: hit.meta.contactCount,
        id: hit.id,
        tag: hit.tag
      }));

      setResults(mappedResults);
      setTotalCount(response.data.hits.total.value);
    } catch (err) {
                         if (err.response && err.response.status === 400) {
                           setNoResults('true')
                           setResults([]);
                         } else {
                           setError('Error fetching data');
                         }
                       } finally {
                         setLoading(false);
                       }
  };

  useEffect(() => {
  setLoading(true)
    const debouncedPostFilters = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedPostFilters();

    // Clean up the debounce on unmount
    return () => {
      debouncedPostFilters.cancel();
    };
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleClickOpen = async (rowData) => {
    setSelectedRow(rowData);

    try {
            const user = await Auth.currentAuthenticatedUser();
            const token = user.signInUserSession.idToken.jwtToken;
            const response = await axiosInstance(`/report/${rowData.id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

      setRawData(response.data.report);
      setOpenDialog(true);
    } catch (err) {
      setError('Error fetching rawData');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData('');
  };

  const columns = [
    { field: 'time', headerName: 'Scan Time', flex: 0.35, filterable: true },
    { field: 'scanUrl', headerName: 'URL', flex: 1.5, filterable: true },
    { field: 'contactCount', headerName: 'Domains Contacted', flex: 0.3, filterable: true },
    { field: 'requestCount', headerName: 'Requests', flex: 0.3, filterable: true },
    { field: 'scriptCount', headerName: 'Scripts', flex: 0.3, filterable: true },
    { field: 'tag', headerName: 'Community Feed', flex: 0.3, filterable: true },

  ];


  return (
    <Box m="20px" sx={{backgroundColor: '#171b2d'}}>
      <Header title="Webamon Xtend" subtitle="Webamon Enriched Public Feeds" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="contained" color="primary" onClick={() => fetchAssets(filters)}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
           <TextField
                      label="DATE"
                      variant="outlined"
                      value={filters.date}
                      onChange={(e) => handleFilterChange('date', e.target.value)}
                      sx={{ mr: '10px' }}
                    />
                    <TextField
                      label="URL"
                      variant="outlined"
                      value={filters.url}
                      onChange={(e) => handleFilterChange('url', e.target.value)}
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
                      value={filters.reportID}
                      onChange={(e) => handleFilterChange('reportID', e.target.value)}
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
                    label="SHA256"
                    variant="outlined"
                    value={filters.sha256}
                    onChange={(e) => handleFilterChange('sha256', e.target.value)}
                      sx={{ mr: '10px' }}
                  />
                    <TextField
                      label="IP"
                      variant="outlined"
                    value={filters.ip}
                      onChange={(e) => handleFilterChange('ip', e.target.value)}
                      sx={{ mr: '10px' }}
                    />
                  <TextField
                    label="DOMAIN"
                    variant="outlined"
                    value={filters.domain}
                    onChange={(e) => handleFilterChange('domain', e.target.value)}
                    sx={{ mr: '10px' }}
                  />
        </Box>
        <DataGrid
          sx={{ fontSize: '20px' }}
          rows={results}
          columns={columns}
          getRowId={(row) => row.id}
          onRowClick={(params) => handleClickOpen(params.row)}
          disableColumnMenu={false}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
        <ReportDialog
          open={openDialog}
          onClose={handleCloseDialog}
          rowData={rawData}
        />
      </Box>
    </Box>
  );
};

export default WebamonXtend;
