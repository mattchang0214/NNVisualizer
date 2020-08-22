import { constants } from "./constants.js";
import * as selectTransform from "./selectTransform.js";

export function initContainer(d3container) {
    d3container.append("g")
               .attr("class", "edges");
    d3container.append("g")
               .attr("class", "helperEdges");
    d3container.append("g")
               .attr("class", "nodes");
}

export function getModelWeights(model) {
    const weightVals = [];
    for (const layer of model.layers) {
        // 0: weights, 1: biases
        const params = layer.getWeights();
        Array.prototype.push.apply(weightVals, params[0].dataSync());
    }
    return weightVals;
}

/**
 * Draw nodes and links of the network.
 */
function drawNetwork(d3containers, networkData, model) {
    // create generator for cubic Bezier curves
    const curveGenerator = d3.linkHorizontal()
                             .source((d) => [networkData.nodes[d.source][d.srcIdx].x + constants.RADIUS, networkData.nodes[d.source][d.srcIdx].y])      
                             .target((d) => [networkData.nodes[d.target][d.tarIdx].x - constants.RADIUS, networkData.nodes[d.target][d.tarIdx].y]);
    
    // get intial weights
    const weightVals = getModelWeights(model);
    // draw edges
    d3containers.svgEdges
                .data(networkData.edges)
                .join((enter) => enter.append("path"))
                .attr("id", (d, i) => i)
                .attr("value", (d, i) => weightVals[i])
                .attr("d", curveGenerator)
                .style("fill", "none")
                .style("stroke", (d, i) => weightVals[i] > 0 ? "rgb(75, 167, 242)": "rgb(245, 170, 71)")
                .style("stroke-width", (d, i) => Math.min(Math.abs(weightVals[i])*5, 10))
                .style("stroke-dasharray", ("8, 1"));

    // draw invisible hover helper edges
    d3containers.helperEdges
                .data(networkData.edges)
                .join((enter) => enter.append("path"))
                .attr("id", (d, i) => i)
                .attr("d", curveGenerator)
                .style("fill", "none")
                .style("stroke", "none")
                .style("stroke-width", 10)
                .attr("pointer-events", "stroke")
                .on("mouseover", (d) => {
                    d3containers.tooltip.style("display", "block");
                    d3containers.tooltip.transition().duration(200).style("opacity", 0.9);
                    d3containers.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[d3.event.target.id]*1000)/1000)
                                .style("top", (d3.event.pageY + 7) + "px")
                                .style("left", (d3.event.pageX + 15) + "px");

              })
              .on("mouseout", (d) => {
                 d3containers.tooltip.transition().duration(500).style("opacity", 0);
                 d3containers.tooltip.style.display = "none";
              });

    const layers = [];
    layers.push(networkData.network.inputLayer, ...networkData.network.hiddenLayers, networkData.network.outputLayer);
    d3containers.svgNodes
                .selectAll("g")
                .data(layers)
                .join((enter) => enter.append("g"))
                .attr("id", (d) => d.name);

    // draw nodes for each layer
    for (const layer of layers) {
        d3containers.svgNodes
                    .select("g#" + layer.name)
                    .selectAll("circle")
                    .data(networkData.nodes[layer.name])
                    .join((enter) => enter.append("circle"))
                    .attr("id", (d, i) => i)
                    .attr("cx", (d) => d.x)
                    .attr("cy", (d) => d.y)
                    .attr("r", constants.RADIUS)
                    .style("stroke", "#333333")
                    .style("stroke-width", 2)
                    .style("fill", "white");
    }
}

export function updateEdgeWeights(d3Containers, weightVals) {
    d3Containers.svgEdges.style("stroke", (d, i) => weightVals[i] > 0 ? "rgb(75, 167, 242)": "rgb(245, 170, 71)")
                         .style("stroke-width", (d, i) => Math.abs(weightVals[i])*5);
    // display tooltip showing weight value
    d3Containers.helperEdges.attr("pointer-events", "stroke")
                            .on("mouseover", (d) => {
                                d3Containers.tooltip.style("display", "block");
                                d3Containers.tooltip.transition().duration(200).style("opacity", 0.9);
                                d3Containers.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[d3.event.target.id]*1000)/1000)
                                            .style("top", (d3.event.pageY + 7) + "px")
                                            .style("left", (d3.event.pageX + 15) + "px");
                               });
}

function addNodeControls(htmlElt, network) {
    while (htmlElt.firstChild) {
        htmlElt.removeChild(htmlElt.lastChild);
    }

    network.hiddenLayers.map((layer, idx) => {
        let div = document.createElement("DIV");
        div.setAttribute("class", "node-control-pair");
        div.style.left = (layer.xPos - 71) + "px";
        let btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-plus" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>\n' + 
                        '<path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/>\n' + 
                        '</svg>';
        btn.setAttribute("class", "add-node-btn");
        btn.setAttribute("title", "Add node to layer");
        btn.value = idx;
        div.append(btn);
        let span = document.createElement("SPAN");
        span.setAttribute("class", "node-text");
        if (layer.size == 1) {
            span.innerHTML = "1 neuron";
        }
        else {
            span.innerHTML = layer.size + " neurons";
        }
        div.append(span);
        btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-dash" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/>\n' +
                        '</svg>';
        btn.setAttribute("class", "remove-node-btn");
        btn.setAttribute("title", "Remove node from layer");
        btn.value = idx;
        div.append(btn);
        htmlElt.append(div);
    });
}

export function addActivationSelection(network) {
    const activations = ["Linear", "ReLU", "Sigmoid", "Softmax", "Softplus", "Tanh"];
    const labels = ["Hidden Layer Activation", "Output Layer Activation"];
    const defaults = [constants.DEFAULT_ACTIVATION, constants.DEFAULT_OUTPUT_ACTIVATION];
    const pos = [285, 85];
    for (const idx in labels) {
        const div = document.createElement("DIV");
        div.setAttribute("class", "control-elt");
        div.style.right = pos[idx]+ "px";
        const label = document.createElement("LABEL");
        label.innerHTML = labels[idx];
        label.setAttribute("class", "input-label-pair");
        const select = document.createElement("SELECT");
        select.setAttribute("class", "input-label-pair");
        select.style.width = "180px";
        for (const func of activations) {
            const option = document.createElement("OPTION");
            option.innerHTML = func;
            option.value = func.toLowerCase();
            option.setAttribute("option-img", "img/"+func.toLowerCase()+".svg");
            option.setAttribute("option-width", constants.IMG_WIDTH);
            option.setAttribute("option-height", constants.IMG_HEIGHT);
            if (func == defaults[idx]) {
                option.selected = true;
            }
            select.append(option);
        }
        div.append(label, selectTransform.transform(select, {replace: false, displayImg: false}));
        document.querySelector("#activation-controls").append(div);
    }
}

export function addCharts(d3containers) {
    const accContainer = d3containers.accChart
                                     .append("svg")
                                     .attr("width", constants.CHART_WIDTH)
                                     .attr("height", constants.CHART_HEIGHT);
    const x = d3.scaleLinear()
                .domain([0, 20])
                .rangeRound([25, constants.CHART_WIDTH - 25]);
    const y = d3.scaleLinear()
                .domain([0, 1])
                .rangeRound([constants.CHART_HEIGHT - 20, 20]);
    accContainer.append("g")
                .attr("class","x-axis")
                .attr("transform", "translate(25," + (constants.CHART_HEIGHT - 35) + ")")
                .call(d3.axisBottom(x));
    accContainer.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + 45 + ",-15)")
                .call(d3.axisLeft(y));
    accContainer.append("text")             
                .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 20) + " ," + 
                                       (constants.CHART_HEIGHT - 3) + ")")
                .style("text-anchor", "middle")
                .text("epoch");
    accContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 1)
                .attr("x", -(constants.CHART_HEIGHT / 2)+10)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("accuracy");    

    const lossContainer = d3containers.lossChart
                                      .append("svg")
                                      .attr("width", constants.CHART_WIDTH)
                                      .attr("height", constants.CHART_HEIGHT);
    lossContainer.append("g")
                .attr("class","x-axis")
                .attr("transform", "translate(25," + (constants.CHART_HEIGHT - 35) + ")")
                .call(d3.axisBottom(x));
    lossContainer.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(" + 45 + ",-15)")
                .call(d3.axisLeft(y));
    lossContainer.append("text")             
                .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 20) + " ," + 
                                       (constants.CHART_HEIGHT - 3) + ")")
                .style("text-anchor", "middle")
                .text("epoch");
    lossContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 1)
                .attr("x", -(constants.CHART_HEIGHT / 2)+10)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("loss");    
}

export function clearCharts(d3Container) {
    d3Container.selectAll("g.data").remove();
}

export function update(d3Containers, htmlElts, networkData, model) {
    drawNetwork(d3Containers, networkData, model);

    htmlElts.pauseIcon.style.display = "none";
    htmlElts.slider.disabled = true;
    htmlElts.slider.value = 0;

    if (networkData.network.hiddenLayers.length == 1) {
        htmlElts.layerText.innerHTML = "1 hidden layer";
    }
    else {
        htmlElts.layerText.innerHTML = networkData.network.hiddenLayers.length + " hidden layers";
    }
    addNodeControls(htmlElts.nodeControls, networkData.network);
}
