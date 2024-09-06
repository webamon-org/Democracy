import React, { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel, Tooltip, CircularProgress, Button } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../../components/Header';
import axios from 'axios';
import ReportDialog from '../../../components/scanDialog.js';
import { debounce } from 'lodash';
import { useAuth } from '../../../AuthContext';




const AllDomains = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [results, setResults] = useState([]);
    const [statusColor, setStatusColor] = useState(''); // State for status color

    const { apiKey } = useAuth();

  const [loading, setLoading] = useState(false);
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
setStatusColor('yellow');

    try {
              const queryParams = buildQueryParams();
      const response = await axiosInstance(`/feed?feed=all_domains&${queryParams}`, {
    headers: {
          'x-api-key': apiKey,
        },
        });

if (response.status === 200) {
        setStatusColor('green');
      }

      const mappedResults = response.data.feed.map((hit) => ({
        ...hit,
      }));

      setResults(mappedResults);
      setLoading(false)
    }  catch (err) {
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
  setStatusColor('yellow');
    setFilters({
      ...filters,
      [key]: value,
    });
  };

    const handleClearFilters = () => {
    setStatusColor('yellow');
      setFilters({});
    };


  const columns = [
    { field: 'domain', headerName: 'Domain', flex: 1, filterable: true }, // Access nested key 'SK' under 'meta'
    { field: 'scanned', headerName: 'Scanned', flex: 0.3, filterable: true },
    { field: 'malicious', headerName: 'Malicious', flex: 0.3, filterable: true },
    { field: 'hosting', headerName: 'Hosting', flex: 0.3, filterable: true },
  ];

  const statusText = {
    green: 'Success',
    blue: 'No Results',
    red: '5xx Server Error',
    yellow: 'Loading...',
    '': 'Idle',
  };



  return (
    <Box m="20px" sx={{backgroundColor: '#171b2d'}}>
      <Header title="All Domains" subtitle="266 million available" />
      <Box m="40px 0 0 0" height="75vh">
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
              {loading && <CircularProgress size={20} sx={{ color: '#ffffff' }} />}
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
            label="DOMAIN"
            variant="outlined"
            value={filters.domain || ''}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <FormControl variant="outlined" sx={{ minWidth: '150px', mr: '10px' }}>
            <InputLabel>Scanned</InputLabel>
            <Select
              label="Scanned"
              value={filters.scanned || ''}
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
              value={filters.hosting || ''}
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
              value={filters.malicious || ''}
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
          sx={{ fontSize: '20px' }}
          rows={results}
          columns={columns}
          getRowId={(row) => row.id}
          disableColumnMenu={false}
          loading={loading}
          components={{ Toolbar: GridToolbar }}
        />
        <ReportDialog
          open={openDialog}
          rowData={rawData}
        />
      </Box>
    </Box>
  );
};

export default AllDomains;
