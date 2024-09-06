import React, { useEffect, useRef, useState } from 'react';
import { Network, DataSet } from 'vis-network/standalone';
import 'vis-network/styles/vis-network.css';
import { Dialog, DialogTitle, DialogActions, Button, FormControl, FormLabel, RadioGroup, Radio, FormControlLabel } from '@mui/material';
import '@fortawesome/fontawesome-free/css/all.min.css';

const GraphComponent = ({ data }) => {
  const containerRef = useRef(null);
  const [network, setNetwork] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [open, setOpen] = useState(false);
  const [levelSeparation, setLevelSeparation] = useState(250);
  const [nodeSpacing, setNodeSpacing] = useState(100);
  const [layoutDirection, setLayoutDirection] = useState('UD');
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [fixedNodes, setFixedNodes] = useState(new Set()); // Track fixed nodes

  const groups = [];

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    if (containerRef.current && !network) {
      const options = {
        groups: {
          requests: {
            shape: 'icon',
            icon: {
              face: 'FontAwesome',
              code: '\uf0e7',
              size: 50,
              color: '#8A2BE2',
            },
          },
        },
        interaction: {
          hover: true,
          tooltipDelay: 200,
          navigationButtons: true,
          keyboard: true,
          zoomView: true,
        },
        nodes: {
          shape: 'icon',
          icon: {
            face: 'FontAwesome',
            code: '\uf0c8',
            size: 40,
            color: '#FF6347',
          },
          font: {
            size: 20,
            face: 'Arial',
            color: '#ffffff',
          },
          borderWidth: 2,
          borderWidthSelected: 4,
          color: {
            border: '#007bff',
            background: '#e9ecef',
            highlight: {
              border: '#0056b3',
              background: '#d1e7ff',
            },
            hover: {
              border: '#0056b3',
              background: '#d1e7ff',
            },
          },
        },
        edges: {
          width: 2,
          selectionWidth: 3,
          font: {
            size: 16,
            color: '#ffffff',
          },
          arrows: {
            to: { enabled: true, scaleFactor: 0.5 },
          },
          color: {
            color: '#ffa500',
            highlight: '#ff4500',
            hover: '#ff6347',
          },
          smooth: {
            enabled: false,
            type: 'dynamic',
          },
        },
        layout: {
          randomSeed: 42,
          improvedLayout: true,
        },
        physics: {
          enabled: physicsEnabled, // Control physics based on state
        },
      };

      const getMimeIcon = (mimeType) => {
        switch (true) {
          case mimeType.includes('text/html'):
            return '\uf15b';
          case mimeType.includes('image'):
            return '\uf03e';
          case mimeType.includes('video'):
            return '\uf03d';
          case mimeType.includes('audio'):
            return '\uf001';
          case mimeType.includes('application/javascript'):
            return '\uf121';
          case mimeType.includes('text/javascript'):
            return '\uf121';
          case mimeType.includes('application/json'):
            return '\uf1c9';
          case mimeType.includes('text/css'):
            return '\uf13c';
          default:
            return '\uf0c8';
        }
      };

      const extractDomain = (url) => {
        try {
          const { hostname } = new URL(url);
          return hostname;
        } catch (e) {
          return url;
        }
      };

      const extractPath = (url) => {
        try {
          const { pathname } = new URL(url);
          return pathname || '';
        } catch (e) {
          return '';
        }
      };

      const groupData = new DataSet(groups);
      const rootNode = Object.entries(data.domain).find(([key, value]) => value.root === true);
      const existingNodes = Object.entries(data.domain).map(([key, value]) => key);

      const nodes = Object.entries(data.domain).map(([key, value]) => {
        const nodeLabel = extractDomain(value.name);

        const newNodeTitle = `${key}\n\nType: Requests: ${value.request_count}\nTotal Response Size: ${value.total_response_size}\nMime Types: ${JSON.stringify(
          value.mime_type,
          null,
          2
        )}`;

        return {
          id: key,
          label: nodeLabel,
          title: newNodeTitle,
          icon: {
            face: 'FontAwesome',
            code: getMimeIcon(Object.values(value.mime_type)[0]),
            size: 40,
            color: '#FF6347',
          },
        };
      });

      const truncateNodeName = (name, maxLength) => {
        if (!name) {
          return '';
        }
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
            const newNodeLabel = `Mime: ${request.mime_type}\nSize: ${request.encoded_data_length}\nStatus: ${request.response_code}\nResponse IP: ${request.ip}`;

            const newNode = {
              id: requestedNode,
              label: `${truncateNodeName(extractPath(requestedNode) || '', 150)}`,
              title: newNodeLabel,
              group: 'requests',
              icon: {
                face: 'FontAwesome',
                code: getMimeIcon(request.mime_type),
                size: 40,
                color: '#FF6347',
              },
            };

            const urlEdge = {
              from: key,
              to: requestedNode,
              label: request.mime,
              color: value.root === true ? 'white' : isNewNode ? '#28A745' : undefined,
            };

            nodes.push(newNode);
            edges.push(urlEdge);
          }
        });
      });

      const graphData = { nodes, edges };
      const networkInstance = new Network(containerRef.current, graphData, options);

      const styleButtons = () => {
        const zoomButtons = document.querySelectorAll('.vis-button');
        zoomButtons.forEach(button => {
          button.style.backgroundColor = '#ffffff';
          button.style.color = 'white';
          button.style.borderRadius = '5px';
          button.style.padding = '6px';
        });
      };

      styleButtons();
      networkInstance.setOptions({ groups: options.groups });
      networkInstance.setData({ nodes: graphData.nodes, edges: graphData.edges });
      groupData.add(graphData.nodes);

      // Event handler to fix node positions when dragging ends
      networkInstance.on('dragEnd', function (event) {
        const { nodes } = event;
        const newFixedNodes = new Set(fixedNodes);
        nodes.forEach(nodeId => {
          if (!newFixedNodes.has(nodeId)) {
            newFixedNodes.add(nodeId);
            networkInstance.body.nodes[nodeId].options.fixed = { x: true, y: true }; // Fix node position
          }
        });
        setFixedNodes(newFixedNodes);
      });

      setNetwork(networkInstance);

      networkInstance.on('click', handleNodeClick);
    }
  }, [data, network, layoutDirection, levelSeparation, nodeSpacing, physicsEnabled, fixedNodes]);

  useEffect(() => {
    if (network) {
      const options = {
        layout: {
          hierarchical: {
            enabled: layoutDirection !== 'Disabled',
            direction: layoutDirection !== 'Disabled' ? layoutDirection : undefined,
            sortMethod: 'directed',
            levelSeparation,
            nodeSpacing,
          },
        },
        physics: {
          enabled: physicsEnabled,
        },
      };
      network.setOptions(options);
    }
  }, [network, layoutDirection, levelSeparation, nodeSpacing, physicsEnabled]);

  const handleNodeClick = (event) => {
    if (event.nodes.length > 0) {
      setSelectedNode(event.nodes[0]);
      setOpen(true);
    }
  };

  const handleLayoutDirectionChange = (event) => {
    setLayoutDirection(event.target.value);
  };

  const handlePhysicsToggle = () => {
    setPhysicsEnabled(prev => !prev);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <label style={{ color: 'white', fontSize: '18px', marginRight: '10px' }}>
            Level Separation:
          </label>
          <input
            type="range"
            min="100"
            max="1000"
            value={levelSeparation}
            onChange={(e) => setLevelSeparation(Number(e.target.value))}
            style={{ marginRight: '10px' }}
          />
          <span style={{ color: 'white', fontSize: '18px' }}>{levelSeparation}</span>
        </div>
        <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
          <label style={{ color: 'white', fontSize: '18px', marginRight: '10px' }}>
            Node Spacing:
          </label>
          <input
            type="range"
            min="50"
            max="1000"
            value={nodeSpacing}
            onChange={(e) => setNodeSpacing(Number(e.target.value))}
            style={{ marginRight: '10px' }}
          />
          <span style={{ color: 'white', fontSize: '18px' }}>{nodeSpacing}</span>
        </div>
        <div style={{ marginBottom: '20px' }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" style={{ color: 'white' }}>Layout Direction:</FormLabel>
            <RadioGroup
              row
              value={layoutDirection}
              onChange={handleLayoutDirectionChange}
              style={{ color: 'white' }}
            >
              <FormControlLabel value="UD" control={<Radio />} label="Up-Down" />
              <FormControlLabel value="LR" control={<Radio />} label="Left-Right" />
              <FormControlLabel value="Disabled" control={<Radio />} label="Disabled" />
            </RadioGroup>
          </FormControl>
        </div>
        <div style={{ marginBottom: '10px' }}>
          <Button variant="contained" color={physicsEnabled ? 'secondary' : 'primary'} onClick={handlePhysicsToggle}>
            {physicsEnabled ? 'Disable Physics' : 'Enable Physics'}
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: 'white', marginRight: '10px' }} />
          <span style={{ color: 'white' }}>1st Party Resource</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', marginRight: '20px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#FFC107', marginRight: '10px' }} />
          <span style={{ color: 'white' }}>3rd Party Domain</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#28A745', marginRight: '10px' }} />
          <span style={{ color: 'white' }}>3rd Party Resource</span>
        </div>
      </div>
      <div ref={containerRef} style={{ position: 'relative', height: '65vh', border: '1px solid #ccc', margin: '10px' }}>
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
