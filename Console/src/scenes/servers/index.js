import { Box, Button, TextField } from "@mui/material";
import { useState, useEffect } from "react";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import Header from "../../components/Header";
import axios from 'axios';
import { useAuth } from '../../AuthContext';
import debounce from 'lodash.debounce';

const axiosInstance = axios.create({
  baseURL: 'https://community.webamon.co.uk',
  headers: {
    'Content-Type': 'application/json',
  },
});

const ServerPage = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { apiKey } = useAuth();

  const [filters, setFilters] = useState({});


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

        const response = await axiosInstance.get(`/server?${queryParams}`, {
headers: {
                'x-api-key': apiKey        },
        });

      const mappedResults = response.data.server.map(hit => ({
        id: hit.id,
        country_name: hit.country.name,
        asn_org: hit.asn.name,
        asn_num: hit.asn.number,
        ...hit,
      }));

      setResults(mappedResults);
      setLoading(false);
    } catch (err) {
                  if (err.response && err.response.status === 400) {
                  setLoading(false);
                    setResults([]);
                  }
                }
  };

  useEffect(() => {
  setLoading(true)
    const debouncedFetchAssets = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedFetchAssets();

    // Clean up the debounce on unmount
    return () => {
      debouncedFetchAssets.cancel();
    };
  }, [filters]);


    const handleClearFilters = () => {
      setFilters({});
      fetchAssets();
    };


  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const columns = [
    { field: "last_update", headerName: "Last Seen", flex: 0.2, filterable: true },
        { field: "server", headerName: "Server", flex: 0.3, filterable: true },

    { field: "ip", headerName: "IP", flex: 0.2, filterable: true },
    { field: "asn_num", headerName: "ASN", flex: 0.1, filterable: true },
    { field: "asn_org", headerName: "ASN ORG", flex: 0.3, filterable: true },
    { field: "resource_count", headerName: "Resources", flex: 0.2, filterable: true },
    { field: "country_name", headerName: "Country", flex: 0.2, filterable: true },
    { field: "domain", headerName: "Domain", flex: 0.4, filterable: true },
  ];

  return (
    <Box m="20px" sx={{backgroundColor: '#191b2d'}}>
      <Header title="SERVERS" subtitle="Collection of all discovered servers" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: '20px'}}>
                  <Button variant="contained" color="primary" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
          <Button variant="contained" color="primary" onClick={fetchAssets}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="SERVER NAME"
            variant="outlined"
            value={filters.server || ''}
            onChange={(e) => handleFilterChange('server', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="IP"
            variant="outlined"
            value={filters.ip || ''}
            onChange={(e) => handleFilterChange('ip', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="ASN NAME"
            variant="outlined"
            value={filters['asn.name'] || ''}
            onChange={(e) => handleFilterChange('asn.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="COUNTRY"
            variant="outlined"
            value={filters['country.name'] || ''}
            onChange={(e) => handleFilterChange('country.name', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters.domain || ''}
            onChange={(e) => handleFilterChange('domain', e.target.value)}
          />
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
      </Box>
    </Box>
  );
};

export default ServerPage;
