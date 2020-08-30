import { constants } from "./constants.js";
import * as irisData from "./irisData.js";
import * as neuralNet from "./neuralNet.js";
import * as ui from "./ui.js";

/***HELPER FUNCTIONS***/

function createModel(network) {
    const LEARNING_RATE = 0.01;
    
    // create tf model from definition
    const model = tf.sequential();
    
    if (network.hasOwnProperty("hiddenLayers") && network.hiddenLayers.length > 0) {
        const hLayers = network.hiddenLayers;
        model.add(tf.layers.dense({units: hLayers[0].size, activation: hLayers[0].activation, inputShape: [network.inputLayer.size]}));
        for (let i = 1; i < hLayers.length; i++) {
            model.add(tf.layers.dense({units: hLayers[i].size, activation: hLayers[i].activation}));
        }
        model.add(tf.layers.dense({units: network.outputLayer.size, activation: network.outputLayer.activation}));
    }
    else {
        model.add(tf.layers.dense({units: network.outputLayer.size, activation: network.outputLayer.activation, inputShape: [network.inputLayer.size]}));
    }
    // model.summary();

    model.compile({
        optimizer: tf.train.adam(LEARNING_RATE),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"],
    });

    return model;
}

async function trainModel(model, dataset, chartInfo) {
    const BATCH_SIZE = 32;
    const pastWeights = [];
    
    const epochNum = document.querySelector("#epoch");
    const epochSlider = document.querySelector("#epoch-slider");

    const history = await model.fit(dataset.xTrain, dataset.yTrain, {
        batchSize: BATCH_SIZE,
        epochs: getEpoch(),
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
                epochNum.innerHTML = "Epoch: " + (epoch+1);
                epochSlider.value = epoch+1;

                const weightVals = ui.getModelWeights(model);
                pastWeights.push(weightVals);

                ui.updateEdgeWeights({ 
                                       svgEdges: d3.select(".edges").selectAll("path"),
                                       overlayEdges: d3.select(".overlayEdges").selectAll("path"), 
                                       tooltip: d3.select("#tooltip")
                                     }, weightVals);

                // Plot the loss and accuracy values at the end of every training epoch
                for (const chart of chartInfo) {
                    chart.data[0].push({epoch: epoch+1, value: logs[chart.type]});
                    chart.data[1].push({epoch: epoch+1, value: logs["val_" + chart.type]});
                    ui.updateChart(chart.d3Selection.select("svg"), chart.axes, chart.data, chart.colors);
                }
            },
        }
    });

    epochSlider.disabled = false;
    return pastWeights;
}

function updateNetwork(svgContainer, network) {
    const nodes = neuralNet.createLayerNodes(network);
    const edges = neuralNet.createLayerEdges(network);
    const model = createModel(network);
    ui.update({ 
                  svgEdges: svgContainer.select(".edges").selectAll("path"),
                  overlayEdges: svgContainer.select(".overlayEdges").selectAll("path"),
                  svgNodes: svgContainer.select(".nodes"),
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
              model);

    return model;
}

function interruptTraining() {
    stopRequested = true;
    ui.clearCharts(d3.selectAll(".chart > svg"));
    document.querySelector("#epoch").innerHTML = "Epoch: 0";
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
// load iris data
const dataset = irisData.data2Tensor();

// make an SVG Container
const svgContainer = d3.select("#network")
                       .append("svg")
                       .attr("width", constants.NETWORK_WIDTH)
                       .attr("height", constants.NETWORK_HEIGHT);
/*const svgContainer = d3.select("#network")
                       .append("svg")
                       .attr("viewBox", "0 0 " + constants.NETWORK_WIDTH + " " + constants.NETWORK_HEIGHT);*/
ui.initContainer(svgContainer);

const networkLayers = neuralNet.getDefaultNetwork();
let tfModel = updateNetwork(svgContainer, networkLayers);
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
                          colors: ["steelblue", "firebrick"],
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
                          colors: ["steelblue", "firebrick"],
                          type: "loss",
                          axes: {x: null, y: null},
                          data: [[], []]
                      }
                  ];
ui.addCharts(chartInfo);


/***EVENT HANDLERS***/
document.querySelector("#train-btn")
        .addEventListener("click", async () => {
            stopRequested = false;
            pastWeights = await trainModel(tfModel, dataset, chartInfo);
        }, { once: true });

document.querySelector("#reset-btn")
        .addEventListener("click", () => {
            interruptTraining();
            ui.clearCharts(d3.selectAll(".chart > svg"));
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#epoch-slider")
        .addEventListener("input", (event) => {
            if (event.target.value >= pastWeights.length) {
                return;
            }
            document.querySelector("#epoch").innerHTML = "Epoch: " + event.target.value;
            const weightVals = pastWeights[event.target.value];

            ui.updateEdgeWeights({ 
                                   svgEdges: svgContainer.select(".edges").selectAll("path"),
                                   overlayEdges: svgContainer.select(".overlayEdges").selectAll("path"), 
                                   tooltip: d3.select("#tooltip"),
                                 }, weightVals);

        });

document.querySelector("#num-epochs-input")
        .addEventListener("input", (event) => {
            interruptTraining();
            event.target.closest("form").reportValidity();
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#add-layer-btn")
        .addEventListener("click", () => {
            if (networkLayers.hiddenLayers.length > 5) {
                return;
            }
            interruptTraining();
            neuralNet.addHiddenLayer(networkLayers, 4, "relu");
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#remove-layer-btn")
        .addEventListener("click", () => {
            if (networkLayers.hiddenLayers.length < 1) {
                return;
            }
            interruptTraining();
            neuralNet.removeHiddenLayer(networkLayers);
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#node-controls")
        .addEventListener("click", (event) => {
            const target = event.target.closest(".add-node-btn, .remove-node-btn");
            if (target.className == "add-node-btn") {
                if (networkLayers.hiddenLayers[target.value].size > 9) {
                    return;
                }
                interruptTraining();
                networkLayers.hiddenLayers[target.value].size++;
                tfModel = updateNetwork(svgContainer, networkLayers);
            }
            else if (target.className == "remove-node-btn") {
                if (networkLayers.hiddenLayers[target.value].size < 2) {
                    return;
                }
                interruptTraining();
                networkLayers.hiddenLayers[target.value].size--;
                tfModel = updateNetwork(svgContainer, networkLayers);
            }
        });

document.querySelector("#activation-controls > #hidden > .select-container")
        .addEventListener("input", (event) => {
            interruptTraining();
            neuralNet.setHiddenActivations(networkLayers, event.target.value);
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#activation-controls > #output > .select-container")
        .addEventListener("input", (event) => {
            interruptTraining();
            neuralNet.setOutputActivation(networkLayers, event.target.value);
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#advanced-controls")
        .addEventListener("click", () => {
            alert("Under construction...");
        });