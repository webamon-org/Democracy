import React, { useState, useEffect, useCallback } from 'react';
import { Box, Button, TextField, Typography, Dialog, DialogTitle, DialogContent, DialogActions, Tabs, Tab, Select, MenuItem, FormControl, InputLabel, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../../components/Header';
import axios from 'axios';
import ReportDialog from '../../../components/scanDialog.js';
import { Auth } from 'aws-amplify';
import { debounce } from 'lodash';




const NewlyRegistered = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [noResults, setNoResults] = useState(null);
  const [tabValue, setTabValue] = useState(0); // State for managing active tab
  const [filters, setFilters] = useState({});
const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  timeout: 300000,
  headers: {
    'Content-Type': 'application/json',
  },
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

  const fetchAssets = async () => {
    setLoading(true);
    setError(null);

    try {
      const user = await Auth.currentAuthenticatedUser();
      const token = user.signInUserSession.idToken.jwtToken;
              const queryParams = buildQueryParams();
      const response = await axiosInstance(`/feed?feed=newly_registered&${queryParams}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const mappedResults = response.data.feed.map((hit) => ({
        ...hit,
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
      const response = await axiosInstance.post(`/scans/_search`, {
        size: 1,
        query: {
          term: {
            _id: rowData.id, // Assuming `_id` is the identifier in OpenSearch
          },
        },
        _source: true, // Specify fields to retrieve
      });

      setRawData(response.data.hits.hits[0]._source)


      setOpenDialog(true); // Open the dialog
    } catch (err) {
      console.error('Error fetching rawData:', err);
      setError('Error fetching rawData');
    }
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setRawData(''); // Clear rawData when closing the dialog
  };

  const columns = [
    { field: 'domain', headerName: 'Domain', flex: 1, filterable: true }, // Access nested key 'SK' under 'meta'
    { field: 'scanned', headerName: 'Scanned', flex: 0.3, filterable: true },
    { field: 'malicious', headerName: 'Malicious', flex: 0.3, filterable: true },
    { field: 'hosting', headerName: 'Hosting', flex: 0.3, filterable: true },
    { field: 'date', headerName: 'Date', flex: 0.3, filterable: true },
  ];

  const getStatusColor = () => {
    if (loading) return 'yellow';
    if (error) return 'red';
    if (noResults) return 'blue';
    if (results.length > 0) return 'green';
    return 'transparent';
  };


  const getStatusMessage = () => {
    if (loading) return 'Loading data...';
    if (error) return 'Error fetching data';
    if (noResults) return 'No results';
    if (totalCount > 0) return 'Data loaded successfully';
    return 'Idle';
  };

  return (
    <Box m="20px" sx={{backgroundColor: '#171b2d'}}>
        <Tooltip title={getStatusMessage()} arrow>
            <Box sx={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundColor: getStatusColor(),
              position: 'absolute',
              top: '20px',
              right: '20px',
              cursor: 'pointer', // Changes cursor to pointer on hover
            }} />
          </Tooltip>
      <Header title="Daily Registered Domains" subtitle="ICANN Domain Feed" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters.domain}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
            <InputLabel>Scanned</InputLabel>
            <Select
              label="Scanned"
              value={filters.scanned}
              onChange={(e) => handleFilterChange('scanned', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
            <InputLabel>Hosting</InputLabel>
            <Select
              label="Hosting"
              value={filters.hosting}
              onChange={(e) => handleFilterChange('hosting', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
              <MenuItem value="unknown">Unknown</MenuItem>
            </Select>
          </FormControl>
          <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
            <InputLabel>Malicious</InputLabel>
            <Select
              label="Malicious"
              value={filters.malicious}
              onChange={(e) => handleFilterChange('malicious', e.target.value)}
            >
              <MenuItem value="">All</MenuItem>
              <MenuItem value="true">True</MenuItem>
              <MenuItem value="false">False</MenuItem>
              <MenuItem value="unknown">Unknown</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <DataGrid
          sx={{ fontSize: '14px' }}
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

export default NewlyRegistered;
