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

async function trainModel(model, dataset) {
    const EPOCHS = 20;
    const BATCH_SIZE = 32;

    const pastWeights = [];
    const accLogs = [[], []];
    const lossLogs = [[], []];
    const colors = ["steelblue", "firebrick"];

    const accChart = d3.select("#acc-chart > svg").append("g").attr("class", "data");
    const lossChart = d3.select("#loss-chart > svg").append("g").attr("class", "data");
    
    const epochNum = document.querySelector("#epoch");
    const epochSlider = document.querySelector("#epoch-slider");

    // TODO: fix this
    const x = d3.scaleLinear()
                .domain([0, 20])
                .rangeRound([30, constants.CHART_WIDTH - 20]);
    const y = d3.scaleLinear()
                .domain([0, 1])
                .rangeRound([constants.CHART_HEIGHT - 20, 20]);

    const history = await model.fit(dataset.xTrain, dataset.yTrain, {
        batchSize: BATCH_SIZE,
        epochs: EPOCHS,
        validationData: [dataset.xVal, dataset.yVal],
        callbacks: {
            onTrainBegin: (logs) => {
                epochNum.innerHTML = "Initializing model...";
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
                accLogs[0].push({epoch: epoch+1, acc: logs.acc});
                accLogs[1].push({epoch: epoch+1, acc: logs.val_acc});
                lossLogs[0].push({epoch: epoch+1, loss: logs.loss});
                lossLogs[1].push({epoch: epoch+1, loss: logs.val_loss});
                
                ui.updateEdgeWeights({ 
                                       svgEdges: d3.select(".edges").selectAll("path"),
                                       helperEdges: d3.select(".helperEdges").selectAll("path"), 
                                       tooltip: d3.select("#tooltip")
                                     }, weightVals);

                accChart.selectAll("path")
                        .data(accLogs)
                        .join((enter) => enter.append("path"))
                        .attr("d", d3.line()
                                     .curve(d3.curveCardinal)
                                     .x((d) => x(d.epoch))
                                     .y((d) => y(d.acc)))
                        .attr("fill", "none")
                        .attr("stroke", (d, idx) => colors[idx])
                        .attr("stroke-width", 1.5);
                lossChart.selectAll("path")
                         .data(lossLogs)
                         .join((enter) => enter.append("path"))
                         .attr("d", d3.line()
                                      .curve(d3.curveCardinal)
                                      .x((d) => x(d.epoch))
                                      .y((d) => y(d.loss)))
                         .attr("fill", "none")
                         .attr("stroke", (d, idx) => colors[idx])
                         .attr("stroke-width", 1.5);

                // Plot the loss and accuracy values at the end of every training epoch.
                /*const secPerEpoch =
                    (performance.now() - beginMs) / (1000 * (epoch + 1));
                ui.status(`Training model... Approximately ${
                    secPerEpoch.toFixed(4)} seconds per epoch`)
                trainLogs.push(logs);
                tfvis.show.history(lossContainer, trainLogs, ['loss', 'val_loss'])
                tfvis.show.history(accContainer, trainLogs, ['acc', 'val_acc'])
                calculateAndDrawConfusionMatrix(model, xTest, yTest);*/
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
ui.addActivationSelection(networkLayers);
ui.addCharts({
                 accChart: d3.select("#acc-chart"),
                 lossChart: d3.select("#loss-chart")
             });


/***EVENT HANDLERS***/
document.querySelector("#train-btn")
        .addEventListener("click", async (event) => {
            stopRequested = false;
            pastWeights = await trainModel(tfModel, dataset);
        });

document.querySelector("#reset-btn")
        .addEventListener("click", (event) => {
            interruptTraining();
            ui.clearCharts(d3.selectAll(".chart > svg"));
            tfModel = updateNetwork(svgContainer, networkLayers);
        });

document.querySelector("#epoch-slider")
        .addEventListener("input", (event) => {
            document.querySelector("#epoch").innerHTML = "Epoch: " + event.target.value;
            const weightVals = pastWeights[event.target.value];
            ui.updateEdgeWeights({ 
                                   svgEdges: svgContainer.select(".edges").selectAll("path"),
                                   helperEdges: svgContainer.select(".helperEdges").selectAll("path"), 
                                   tooltip: d3.select("#tooltip"),
                                 }, weightVals);

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
