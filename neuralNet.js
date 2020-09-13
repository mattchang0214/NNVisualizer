import { constants } from "./constants.js";


// define array of layer objects (size, position)
export function getDefaultNetwork(info) {
    const network = {};
    addIOLayers(network, info, constants.DEFAULT_OUTPUT_ACTIVATION.toLowerCase());
    addHiddenLayer(network, 5, constants.DEFAULT_ACTIVATION.toLowerCase());
    addHiddenLayer(network, 6, constants.DEFAULT_ACTIVATION.toLowerCase());
    return network;
}

function addIOLayers(network, info, activation) {
    network.inputLayer = createLayerInfo("input", info.numFeatures, null, constants.LEFT_POS);
    network.outputLayer = createLayerInfo("output", info.numClasses, activation, constants.RIGHT_POS);
}

export function addHiddenLayer(network, size, activation) {
    if (!network.hasOwnProperty("hiddenLayers")) {
        network.hiddenLayers = [];
    }

    network.hiddenLayers.push(createLayerInfo(null, size, activation, null));
    updateLayerPos(network);
}

export function removeHiddenLayer(network) {
    network.hiddenLayers.pop();
    updateLayerPos(network);
}

function updateLayerPos(network) {
    if (!network.hasOwnProperty("hiddenLayers")) {
        return;
    }
    
    for (let i = 0; i < network.hiddenLayers.length; i++) {
        network.hiddenLayers[i].name = "hidden_" + i;
        network.hiddenLayers[i].xPos = constants.LEFT_POS + (i+1) * (constants.RIGHT_POS-constants.LEFT_POS) / (network.hiddenLayers.length+1);
    }
}

/**
 * Add a layer's info including size and position to network.
 *
 * @param size The number of nodes in the layer.
 * @param name The name of the layer.
 */
function createLayerInfo(name, size, activation, xPos) {
    const info = {name: name, size: size, activation: activation, xPos: xPos};
    return info;
}

/**
 * Create nodes from all layers in network. define dictionary - key: name of layer, value: array of node objects (position)
 */
export function createLayerNodes(network) {
    const nodes = {};
    addNodes(nodes, network.inputLayer);
    if (network.hasOwnProperty("hiddenLayers")) {
        for (const layer of network.hiddenLayers) {
            addNodes(nodes, layer);
        }
    }
    addNodes(nodes, network.outputLayer);

    return nodes;
}

/**
 * Create nodes for a layer.
 *
 * @param layer The layer that nodes are created for.
 */
function addNodes(nodes, layer) {
    const yPos = constants.NETWORK_HEIGHT / (layer.size + 1)
    const arr = [];
    for (let i = 0; i < layer.size; i++) {
        arr.push({x: layer.xPos, y: yPos*(i+1)});
    }
    nodes[layer.name] = arr;
}

/**
 * Create links from all layers in network. define array of edge objects (source layer, destination layer, node indices)
 */
export function createLayerEdges(network) {
    const edges = [];

    if (network.hasOwnProperty("hiddenLayers") && network.hiddenLayers.length > 0) {
        addEdges(network.inputLayer, network.hiddenLayers[0], edges);
        for (let i = 0; i < network.hiddenLayers.length-1; i++) {
            addEdges(network.hiddenLayers[i], network.hiddenLayers[i+1], edges);
        }
        addEdges(network.hiddenLayers[network.hiddenLayers.length-1], network.outputLayer, edges);
    }
    else {
        addEdges(network.inputLayer, network.outputLayer, edges);
    }
    
    return edges;
}

/**
 * Create links between two layers (fully-connected).
 *
 * @param sourceLayer The source layer of the links.
 * @param destLayer The destination layer of the links.
 */
function addEdges(sourceLayer, destLayer, edges) {
    if (!sourceLayer.hasOwnProperty("name") || !destLayer.hasOwnProperty("name")) {
        throw "RuntimeError: Source or destination layer has no name.";
    }

    for (let i = 0; i < sourceLayer.size; i++) {
        for (let j = 0; j < destLayer.size; j++) {
            edges.push({source: sourceLayer.name, srcIdx: i, target: destLayer.name, tarIdx: j});
        }   
    }
}

export function setHiddenActivations(network, hidden) {
    for (const layer of network.hiddenLayers) {
        layer.activation = hidden;
    }
}

export function setOutputActivation(network, output) {
    network.outputLayer.activation = output;
}
