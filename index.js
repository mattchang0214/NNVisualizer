import { constants } from "./constants.js";
import * as data from "./data.js";
import * as neuralNet from "./neuralNet.js";
import * as ui from "./ui.js";

/***HELPER FUNCTIONS***/

function createModel(network) {
    const LEARNING_RATE = 0.01;
    
    // create tf model from definition
    const tfModel = tf.sequential();
    
    if (network.hasOwnProperty("hiddenLayers") && network.hiddenLayers.length > 0) {
        const hLayers = network.hiddenLayers;
        tfModel.add(tf.layers.dense({units: hLayers[0].size, activation: hLayers[0].activation, inputShape: [network.inputLayer.size]}));
        for (let i = 1; i < hLayers.length; i++) {
            tfModel.add(tf.layers.dense({units: hLayers[i].size, activation: hLayers[i].activation}));
        }
        tfModel.add(tf.layers.dense({units: network.outputLayer.size, activation: network.outputLayer.activation}));
    }
    else {
        tfModel.add(tf.layers.dense({units: network.outputLayer.size, activation: network.outputLayer.activation, inputShape: [network.inputLayer.size]}));
    }
    // tfModel.summary();

    tfModel.compile({
        optimizer: tf.train.adam(LEARNING_RATE),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    return tfModel;
}

async function trainModel(dataset) {
    const BATCH_SIZE = 32;
    const pastWeights = [];
    
    const epochNum = document.querySelector("#epoch");
    const epochSlider = document.querySelector("#epoch-slider");

    const history = await model.fit(dataset.xTrain, dataset.yTrain, {
        batchSize: BATCH_SIZE,
        epochs: getEpoch(),
        shuffle: true,
        validationData: [dataset.xVal, dataset.yVal],
        callbacks: {
            onTrainBegin: (logs) => {
                epochNum.innerHTML = "Loading...";
                pastWeights.push(ui.getModelWeights(model));
            },
            onEpochEnd: async (epoch, logs) => {
                if (stopRequested) {
                    model.stopTraining = true;
                    return;
                }
                epochNum.innerHTML = `Epoch: ${epoch+1}`;
                epochSlider.value = epoch+1;

                const weightVals = ui.getModelWeights(model);
                pastWeights.push(weightVals);

                ui.updateEdgeWeights({ 
                                         svgEdges: svgContainer.select(".edges").selectChildren("path"),
                                         overlayEdges: svgContainer.select(".overlayEdges").selectChildren("path"), 
                                         tooltip: d3.select("#tooltip")
                                     }, weightVals);

                // Plot the loss and accuracy values at the end of every training epoch
                for (const chart of chartInfo) {
                    chart.data[0].push({epoch: epoch+1, value: logs[chart.type]});
                    chart.data[1].push({epoch: epoch+1, value: logs[`val_${chart.type}`]});
                    ui.updateChart(chart.d3Selection.selectChild("svg"), chart.axes, chart.data, chart.legend);
                }
            },
        }
    });

    ui.addTable(document.querySelector("#results"), dataset, model);

    epochSlider.disabled = false;
    return pastWeights;
}

function updateNetwork(svgContainer, network) {
    const nodes = neuralNet.createLayerNodes(network);
    const edges = neuralNet.createLayerEdges(network);
    const tfModel = createModel(network);
    ui.update({ 
                  svgEdges: svgContainer.selectChild(".edges").selectChildren("path"),
                  overlayEdges: svgContainer.selectChild(".overlayEdges").selectChildren("path"),
                  svgNodes: svgContainer.selectChild(".nodes"),
                  tooltip: d3.select("#tooltip")
              }, 
              {
                  pauseIcon: document.querySelector("#pause"),
                  nodeControls: document.querySelector("#node-controls"),
                  slider: document.querySelector("#epoch-slider"),
                  layerText: document.querySelector("#layer-text")
              },
              {
                  network: network,
                  nodes: nodes,
                  edges: edges
              },
              tfModel);

    return tfModel;
}

function interruptTraining() {
    stopRequested = true;
    ui.clearCharts(chartInfo);
    ui.clearTableData(document.querySelector("#results"));
    document.querySelector("#epoch").innerHTML = "Epoch: 0";
    document.querySelector("#train-btn").disabled = false;
}

function getEpoch() {
    if (!document.querySelector("#num-epochs").checkValidity() || !document.querySelector("#num-epochs-input").value) {
        document.querySelector("#num-epochs-input").value = constants.DEFAULT_EPOCHS;
    }
    const epoch = document.querySelector("#num-epochs-input").value;
    document.querySelector("#epoch-slider").max = epoch;
    return epoch;
}


/***MAIN SCRIPT***/
// load data
const dataset = data.data2Tensor(0, 0.2);

// make an SVG Container
const svgContainer = d3.select("#network")
                       .append("svg")
                       .attr("viewBox", `0 0 ${constants.NETWORK_WIDTH} ${constants.NETWORK_HEIGHT}`);
ui.initContainer(svgContainer);

const networkLayers = neuralNet.getDefaultNetwork(dataset.info);
let model = updateNetwork(svgContainer, networkLayers);
let stopRequested = false;
let pastWeights = [];

document.querySelector("#num-epochs-input").value = constants.DEFAULT_EPOCHS;
ui.addActivationSelection(networkLayers);
const chartInfo = [
                      { 
                          d3Selection: d3.select("#acc-chart"),
                          domainX: [0, 1],
                          domainY: [0, 1],
                          ticksX: d3.range(0, 2, 1),
                          ticksY: d3.range(0, 1.1, 0.25),
                          labelX: "epoch",
                          labelY: "accuracy",
                          legend: [{color: "steelblue", text: "training"}, {color: "firebrick", text: "validation"}],
                          type: "acc",
                          axes: {x: null, y: null},
                          data: [[], []]
                      },
                      { 
                          d3Selection: d3.select("#loss-chart"),
                          domainX: [0, 1],
                          domainY: [0, 1.5],
                          ticksX: d3.range(0, 2, 1),
                          ticksY: d3.range(0, 1.6, 0.5),
                          labelX: "epoch",
                          labelY: "loss",
                          legend: [{color: "steelblue", text: "training"}, {color: "firebrick", text: "validation"}],
                          type: "loss",
                          axes: {x: null, y: null},
                          data: [[], []]
                      }
                  ];
ui.addCharts(chartInfo);
ui.addTableHeader(document.querySelector("#results"), dataset);


/***EVENT HANDLERS***/
document.querySelector("#train-btn")
        .addEventListener("click", async () => {
            stopRequested = false;
            document.querySelector("#train-btn").disabled = true;
            pastWeights = await trainModel(dataset);
        });

document.querySelector("#reset-btn")
        .addEventListener("click", () => {
            interruptTraining();
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#epoch-slider")
        .addEventListener("input", (event) => {
            if (event.target.value >= pastWeights.length) {
                return;
            }
            document.querySelector("#epoch").innerHTML = `Epoch: ${event.target.value}`;
            const weightVals = pastWeights[event.target.value];

            ui.updateEdgeWeights({ 
                                     svgEdges: svgContainer.selectChild(".edges").selectChildren("path"),
                                     overlayEdges: svgContainer.selectChild(".overlayEdges").selectChildren("path"), 
                                     tooltip: d3.select("#tooltip"),
                                 }, weightVals);

        });

document.querySelector("#num-epochs-input")
        .addEventListener("input", (event) => {
            interruptTraining();
            event.target.closest("form").reportValidity();
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#add-layer-btn")
        .addEventListener("click", () => {
            if (networkLayers.hiddenLayers.length > 5) {
                return;
            }
            interruptTraining();
            neuralNet.addHiddenLayer(networkLayers, 4, "relu");
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#remove-layer-btn")
        .addEventListener("click", () => {
            if (networkLayers.hiddenLayers.length < 1) {
                return;
            }
            interruptTraining();
            neuralNet.removeHiddenLayer(networkLayers);
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#node-controls")
        .addEventListener("click", (event) => {
            const target = event.target.closest(".add-node-btn, .remove-node-btn");
            if (target === null) {
                return;
            }
            if (target.className === "add-node-btn") {
                if (networkLayers.hiddenLayers[target.value].size > 9) {
                    return;
                }
                interruptTraining();
                networkLayers.hiddenLayers[target.value].size++;
                model = updateNetwork(svgContainer, networkLayers);
            }
            else if (target.className === "remove-node-btn") {
                if (networkLayers.hiddenLayers[target.value].size < 2) {
                    return;
                }
                interruptTraining();
                networkLayers.hiddenLayers[target.value].size--;
                model = updateNetwork(svgContainer, networkLayers);
            }
        });

document.querySelector("#activation-controls > #hidden > .select-container")
        .addEventListener("input", (event) => {
            interruptTraining();
            neuralNet.setHiddenActivations(networkLayers, event.target.value);
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#activation-controls > #output > .select-container")
        .addEventListener("input", (event) => {
            interruptTraining();
            neuralNet.setOutputActivation(networkLayers, event.target.value);
            model = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#advanced-controls")
        .addEventListener("click", () => {
            alert("Under construction...");
        });
