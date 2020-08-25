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

async function trainModel(model, dataset, scales) {
    const BATCH_SIZE = 32;

    const pastWeights = [];
    const accLogs = [[], []];
    const lossLogs = [[], []];
    const colors = ["steelblue", "firebrick"];
    
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
                accLogs[0].push({epoch: epoch+1, value: logs.acc});
                accLogs[1].push({epoch: epoch+1, value: logs.val_acc});
                lossLogs[0].push({epoch: epoch+1, value: logs.loss});
                lossLogs[1].push({epoch: epoch+1, value: logs.val_loss});
                
                ui.updateEdgeWeights({ 
                                       svgEdges: d3.select(".edges").selectAll("path"),
                                       helperEdges: d3.select(".helperEdges").selectAll("path"), 
                                       tooltip: d3.select("#tooltip")
                                     }, weightVals);

                // Plot the loss and accuracy values at the end of every training epoch
                ui.updateChart(d3.select("#acc-chart > svg"), 
                               d3.line()
                                 .curve(d3.curveMonotoneX)
                                 .x((d) => scales.x(d.epoch))
                                 .y((d) => scales.y(d.value)), 
                               accLogs, colors, scales
                               );

                ui.updateChart(d3.select("#loss-chart > svg"), 
                               d3.line()
                                 .curve(d3.curveMonotoneX)
                                 .x((d) => scales.x(d.epoch))
                                 .y((d) => scales.y(d.value)), 
                               lossLogs, colors, scales
                               );
            },
        }
    });
    console.log(accLogs);
    epochSlider.disabled = false;
    return pastWeights;
}

function updateNetwork(svgContainer, network) {
    const nodes = neuralNet.createLayerNodes(network);
    const edges = neuralNet.createLayerEdges(network);
    const model = createModel(network);
    ui.update({ 
                  svgEdges: svgContainer.select(".edges").selectAll("path"),
                  helperEdges: svgContainer.select(".helperEdges").selectAll("path"),
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
ui.initContainer(svgContainer);

const networkLayers = neuralNet.getDefaultNetwork();
let tfModel = updateNetwork(svgContainer, networkLayers);
let stopRequested = false;
let pastWeights = [];

document.querySelector("#num-epochs-input").value = constants.DEFAULT_EPOCHS;
ui.addActivationSelection(networkLayers);
const scales = ui.addCharts({
                                accChart: d3.select("#acc-chart"),
                                lossChart: d3.select("#loss-chart")
                            });


/***EVENT HANDLERS***/
document.querySelector("#train-btn")
        .addEventListener("click", async (event) => {
            stopRequested = false;
            pastWeights = await trainModel(tfModel, dataset, scales);
        }, { once: true });

document.querySelector("#reset-btn")
        .addEventListener("click", (event) => {
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
                                   helperEdges: svgContainer.select(".helperEdges").selectAll("path"), 
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
        .addEventListener("click", (event) => {
            if (networkLayers.hiddenLayers.length > 5) {
                return;
            }
            interruptTraining();
            neuralNet.addHiddenLayer(networkLayers, 4, "relu");
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#remove-layer-btn")
        .addEventListener("click", (event) => {
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
        .addEventListener("click", (event) => {
            alert("Under construction...");
        });