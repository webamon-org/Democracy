import { Box, Button, TextField, Tooltip } from "@mui/material";
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



const Domains = () => {
  const [open, setOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [results, setResults] = useState([]);
  const [noResults, setNoResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [query, setQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
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
    setError(null);

    try {

        const queryParams = buildQueryParams();
        const response = await axiosInstance.get(`/domain?${queryParams}`, {
     headers: {
          'x-api-key': apiKey,
        },
        });
      const mappedResults = response.data.domain.map(hit => ({
        id: hit.id,
        country_name: hit.country.name,
        asn_org: hit.asn.name,
        ...hit,
      }));

      setResults(mappedResults);
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
    const debouncedFetchAssets = debounce(() => {
      fetchAssets();
    }, 500);

    debouncedFetchAssets();

    // Clean up the debounce on unmount
    return () => {
      debouncedFetchAssets.cancel();
    };
  }, [filters]);




  const handleFilterChange = (key, value) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  const columns = [
    { field: "last_update", headerName: "Updated", flex: 1, filterable: true },
    { field: "sub_domain", headerName: "Sub Domain", flex: 1, filterable: true },
    { field: "name", headerName: "Domain", flex: 1, filterable: true },
    { field: "server", headerName: "Server", flex: 1, filterable: true },
    { field: "hosting_scripts", headerName: "Hosting Scripts", flex: 1, filterable: true },
    { field: "country_name", headerName: "Hosting Country", flex: 1, filterable: true },
    { field: "asn_org", headerName: "ASN", flex: 1, filterable: true },
    { field: "ip", headerName: "Hosting IP", flex: 1, filterable: true },
  ];

  const handleClickOpen = (rowData) => {
    setSelectedRow(rowData);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };


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
    if (results.length > 0) return 'Data loaded successfully';
    return 'Idle';
  };


  return (
    <Box m="20px" sx={{backgroundColor: '#191b2d'}}>
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
      <Header title="DOMAINS" subtitle="Collection of all discovered domains" />
      <Box m="40px 0 0 0" height="75vh">
        <Box sx={{ display: "flex", justifyContent: "flex-end"}}>
          <Button variant="contained" color="primary" onClick={fetchAssets}>
            Refresh
          </Button>
        </Box>
        <Box sx={{ display: 'flex', mb: '20px' }}>
          <TextField
            label="DOMAIN"
            variant="outlined"
            value={filters.name}
            onChange={(e) => handleFilterChange('name', e.target.value)}
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
            label="SUB DOMAIN"
            variant="outlined"
            value={filters.sub_domain}
            onChange={(e) => handleFilterChange('sub_domain', e.target.value)}
            sx={{ mr: '10px' }}
          />
          <TextField
            label="A Record"
            variant="outlined"
            value={filters['dns.a']}
            onChange={(e) => handleFilterChange('dns.a', e.target.value)}
            sx={{ mr: '10px' }}
          />
        <TextField
          label="MX Record"
          variant="outlined"
          value={filters['dns.mx']}
          onChange={(e) => handleFilterChange('dns.mx', e.target.value)}
          sx={{ mr: '10px' }}
        />
              <TextField
                label="NS Record"
                variant="outlined"
                value={filters['dns.ns']}
                onChange={(e) => handleFilterChange('dns.ns', e.target.value)}
                sx={{ mr: '10px' }}
              />
                <TextField
                  label="TXT Record"
                  variant="outlined"
                  value={filters['dns.txt']}
                  onChange={(e) => handleFilterChange('dns.txt', e.target.value)}
                  sx={{ mr: '10px' }}
                />
            <TextField
              label="Country"
              variant="outlined"
              value={filters['country.name']}
              onChange={(e) => handleFilterChange('country.name', e.target.value)}
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
      </Box>
    </Box>
  );
};

export default Domains;
