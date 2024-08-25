import React from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from '@mui/material';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';


const GraphComponent = ({ data }) => {

  const containerRef = React.useRef(null);
  const [network, setNetwork] = React.useState(null);
  const [selectedNode, setSelectedNode] = React.useState(null);
  const [open, setOpen] = React.useState(false);
  const [selectedNodeData, setSelectedNodeData] = React.useState(null);
  const groups = [];

  const handleClose = () => {
    setOpen(false);
  };

  const isDomain = (node) => {
    try {
      new URL(node);
      return false;
    } catch (error) {
      return true;
    }
  };

  React.useEffect(() => {
    if (containerRef.current && !network) {
      const options = {
        groups: {
          requests: {
            shape: 'box',
            color: {
              background: 'lightblue',
            },
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 300,
        },
        nodes: {
          shape: 'box',
          font: {
            size: 14,
          },
          borderWidth: 2,
          borderWidthSelected: 4,
          chosen: true,
        },
        edges: {
          width: 2,
          selectionWidth: 4,
          font: {
            size: 16,
          },
          labelOffset: 25,
          length: 300, // Adjust the length of the lines connecting to the root node
          color: {
            color: 'orange', // Default color for edges
          },
        },
      };

      const groupData = new DataSet(groups);
      const rootNode = Object.entries(data.domain).find(([key, value]) => value.root === true);
      const existingNodes = Object.entries(data.domain).map(([key, value]) => key);
      const nodes = Object.entries(data.domain).map(([key, value]) => {
        const isDomainNode = isDomain(value.domain);
        const newNodeTitle = `${key}\n\nType:Requests: ${value.request_count}\nTotal Response Size: ${value.total_response_size}\nMime Types: ${JSON.stringify(
          value.mime_type,
          null,
          2
        )}`;

        return {
          id: key,
          label: value.domain,
          title: newNodeTitle,
        };
      });

      const truncateNodeName = (name, maxLength) => {
        if (name.length <= maxLength) {
          return name;
        }
        return name.substr(0, maxLength - 3) + '...';
      };

      const edges = [];

      Object.entries(data.domain).forEach(([key, value]) => {
        const from = rootNode ? rootNode[0] : data.domain;
        const to = key;
        const request_count = value.request_count;
        const label = request_count ? `${request_count}` : '';
        const mime_type = value.mime_type;
        const hasJavascript =
          mime_type &&
          (mime_type['text/javascript'] || mime_type['application/javascript']);

        const currentNodeEdge = {
          from,
          to,
          label: hasJavascript ? `${label} Script` : label,
        };

        edges.push(currentNodeEdge);

        value.request.forEach((request) => {
          const requestedNode = request.url;
          const isNewNode = !existingNodes.includes(requestedNode);
          if (isNewNode) {
            existingNodes.push(requestedNode);
            const isDomainNode = isDomain(request.url);
            const newNodeLabel = `Mime: ${request.mime}\nSize: ${request.size}\nStatus: ${request.status}\nResponse IP: ${request.hosting_ip}`;

            const newNode = {
              id: requestedNode,
              label: `${truncateNodeName(requestedNode, 40)}`,
              title: newNodeLabel,
              group: 'requests',
            };

            const urlEdge = {
              from: key,
              to: requestedNode,
              label: request.mime,
              color: value.root === true ? 'black' : isNewNode ? 'green' : undefined,
            };

            nodes.push(newNode);
            edges.push(urlEdge);
          }
        });
      });

      const graphData = { nodes, edges };
      const networkInstance = new Network(containerRef.current, graphData, options);
      networkInstance.setOptions({ groups: options.groups });
      networkInstance.setData({ nodes: graphData.nodes, edges: graphData.edges });
      groupData.add(graphData.nodes);

      setNetwork(networkInstance);

      networkInstance.on('click', handleNodeClick);
    }
  }, [data, network]);

  const handleNodeClick = (event) => {
    const nodeId = event.nodes[0];
    setSelectedNode(nodeId);
    setSelectedNodeData(data);
    setOpen(false);
  };

  return (
<>
  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'black', marginRight: '10px' }} />
      <span>1st Party Resource</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'orange', marginRight: '10px' }} />
      <span>3rd Party Domain</span>
    </div>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '20px', height: '20px', backgroundColor: 'green', marginRight: '10px' }} />
      <span>3rd Party Resource</span>
    </div>
  </div>
  <div ref={containerRef} style={{ position: 'relative', height: '650px', border: '1px solid #ccc' }}>
    {/* Content inside containerRef */}
  </div>
  <Dialog open={open} onClose={handleClose} maxWidth="xl" fullWidth>
    <DialogTitle>{selectedNode}</DialogTitle>
    <DialogActions>
      <Button onClick={handleClose} color="primary">
        Close
      </Button>
    </DialogActions>
  </Dialog>
</>


  );
};

export default GraphComponent;
