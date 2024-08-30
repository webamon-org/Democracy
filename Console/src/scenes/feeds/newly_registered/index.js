import React, { useState, useEffect } from 'react';
import { Box, TextField, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import Header from '../../../components/Header';
import axios from 'axios';
import ReportDialog from '../../../components/scanDialog.js';
import { debounce } from 'lodash';
import { useAuth } from '../../../AuthContext';




const NewlyRegistered = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [rawData, setRawData] = useState('');
  const [results, setResults] = useState([]);
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

    try {
              const queryParams = buildQueryParams();
      const response = await axiosInstance(`/feed?feed=newly_registered&${queryParams}`, {
    headers: {
          'x-api-key': apiKey,
        },
        });

      const mappedResults = response.data.feed.map((hit) => ({
        ...hit,
      }));

      setResults(mappedResults);
    } catch (err) {
                    if (err.response && err.response.status === 400) {
                      setResults([]);
                    }
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



  const handleClickOpen = async (rowData) => {

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

  return (
    <Box m="20px" sx={{backgroundColor: '#171b2d'}}>
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
