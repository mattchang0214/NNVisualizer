import { constants } from "./constants.js";
import * as selectTransform from "./selectTransform.js";

export function initContainer(d3Container) {
    d3Container.append("g")
               .attr("class", "edges");
    d3Container.append("g")
               .attr("class", "helperEdges");
    d3Container.append("g")
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
function drawNetwork(d3Containers, networkData, model) {
    // create generator for cubic Bezier curves
    const curveGenerator = d3.linkHorizontal()
                             .source((d) => [networkData.nodes[d.source][d.srcIdx].x + constants.RADIUS, networkData.nodes[d.source][d.srcIdx].y])      
                             .target((d) => [networkData.nodes[d.target][d.tarIdx].x - constants.RADIUS, networkData.nodes[d.target][d.tarIdx].y]);
    
    // get intial weights
    const weightVals = getModelWeights(model);
    // draw edges
    d3Containers.svgEdges
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
    d3Containers.helperEdges
                .data(networkData.edges)
                .join((enter) => enter.append("path"))
                .attr("id", (d, i) => i)
                .attr("d", curveGenerator)
                .style("fill", "none")
                .style("stroke", "none")
                .style("stroke-width", 10)
                .attr("pointer-events", "stroke")
                .on("mouseover", (d) => {
                    d3Containers.tooltip.style("display", "block");
                    d3Containers.tooltip.transition().duration(200).style("opacity", 0.9);
                    d3Containers.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[d3.event.target.id]*1000)/1000)
                                .style("top", (d3.event.pageY + 7) + "px")
                                .style("left", (d3.event.pageX + 15) + "px");

              })
              .on("mouseout", (d) => {
                 d3Containers.tooltip.transition().duration(500).style("opacity", 0);
                 d3Containers.tooltip.style.display = "none";
              });

    const layers = [];
    layers.push(networkData.network.inputLayer, ...networkData.network.hiddenLayers, networkData.network.outputLayer);
    d3Containers.svgNodes
                .selectAll("g")
                .data(layers)
                .join((enter) => enter.append("g"))
                .attr("id", (d) => d.name);

    // draw nodes for each layer
    for (const layer of layers) {
        d3Containers.svgNodes
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
        div.className = "node-control-pair";
        div.style.left = (layer.xPos - 71) + "px";
        let btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-plus" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>\n' + 
                        '<path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/>\n' + 
                        '</svg>';
        btn.className = "add-node-btn";
        btn.title = "Add node to layer";
        btn.value = idx;
        div.append(btn);
        let span = document.createElement("SPAN");
        span.className = "node-text";
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
        btn.className = "remove-node-btn";
        btn.title = "Remove node from layer";
        btn.value = idx;
        div.append(btn);
        htmlElt.append(div);
    });
}

export function addActivationSelection(network) {
    const activations = ["Linear", "ReLU", "Sigmoid", "Softmax", "Softplus", "Tanh"];
    const data = {
                     labels: ["Hidden Layer Activation", "Output Layer Activation"],
                     id: ["hidden", "output"],
                     defaults: [constants.DEFAULT_ACTIVATION, constants.DEFAULT_OUTPUT_ACTIVATION],
                     pos: [285, 85]
                 };
    for (const idx in data.labels) {
        const div = document.createElement("DIV");
        div.className = "control-elt";
        div.id = data.id[idx];
        div.style.right = data.pos[idx] + "px";
        const label = document.createElement("LABEL");
        label.innerHTML = data.labels[idx];
        label.className = "input-label-pair";
        const select = document.createElement("SELECT");
        select.className = "input-label-pair";
        select.style.width = "180px";
        for (const func of activations) {
            const option = document.createElement("OPTION");
            option.innerHTML = func;
            option.value = func.toLowerCase();
            option.setAttribute("option-img", "img/"+func.toLowerCase()+".svg");
            option.setAttribute("option-width", constants.IMG_WIDTH);
            option.setAttribute("option-height", constants.IMG_HEIGHT);
            if (func == data.defaults[idx]) {
                option.selected = true;
            }
            select.append(option);
        }
        div.append(label, selectTransform.transform(select, {replace: false, displayImg: false}));
        document.querySelector("#activation-controls").append(div);
    }
}

export function addCharts(d3Containers) {
    /*for (const chart of Object.values(d3Containers)) {
        const container = chart.append("svg")
                               .attr("width", constants.CHART_WIDTH)
                               .attr("height", constants.CHART_HEIGHT);

        const x = d3.scaleLinear()
                .domain([0, 1])
                .rangeRound([50, constants.CHART_WIDTH - 10]);
        const y = d3.scaleLinear()
                    .domain([0, 1])
                    .rangeRound([constants.CHART_HEIGHT - 35, 10]);
        container.append("g")
                 .attr("class","x-axis")
                 .attr("transform", "translate(0," + (constants.CHART_HEIGHT - 35) + ")")
                 .call(d3.axisBottom(x).tickSize(3).tickValues(d3.range(0, 2, 1)).tickFormat(d3.format(".0f")));
        container.append("g")
                 .attr("class", "y-axis")
                 .attr("transform", "translate(50, 0)")
                 .call(d3.axisLeft(y).tickValues(d3.range(0, 1.1, 0.25)).tickSize(3));
        container.append("text")             
                 .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 30) + " ," + 
                                        (constants.CHART_HEIGHT - 3) + ")")
                 .style("text-anchor", "middle")
                 .text("epoch");
        container.append("text")
                 .attr("transform", "rotate(-90)")
                 .attr("y", 1)
                 .attr("x", -(constants.CHART_HEIGHT / 2)+10)
                 .attr("dy", "1em")
                 .style("text-anchor", "middle")
                 .text("accuracy");
        container.append("g")
                 .attr("class", "data");
    }*/
    const accContainer = d3Containers.accChart
                                     .append("svg")
                                     .attr("width", constants.CHART_WIDTH)
                                     .attr("height", constants.CHART_HEIGHT);
                                     
    const x = d3.scaleLinear()
                .domain([0, 1])
                .rangeRound([50, constants.CHART_WIDTH - 10]);
    const y = d3.scaleLinear()
                .domain([0, 1])
                .rangeRound([constants.CHART_HEIGHT - 35, 10]);
    accContainer.append("g")
                .attr("class","x-axis")
                .attr("transform", "translate(0," + (constants.CHART_HEIGHT - 35) + ")")
                .call(d3.axisBottom(x).tickSize(3).tickValues(d3.range(0, 2, 1)).tickFormat(d3.format(".0f")));
    accContainer.append("g")
                .attr("class", "y-axis")
                .attr("transform", "translate(50, 0)")
                .call(d3.axisLeft(y).tickValues(d3.range(0, 1.1, 0.25)).tickSize(3));
    accContainer.append("text")             
                .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 30) + " ," + 
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
    accContainer.append("g")
                .attr("class", "data");

    const lossContainer = d3Containers.lossChart
                                      .append("svg")
                                      .attr("width", constants.CHART_WIDTH)
                                      .attr("height", constants.CHART_HEIGHT);
    lossContainer.append("g")
                 .attr("class","x-axis")
                 .attr("transform", "translate(0," + (constants.CHART_HEIGHT - 35) + ")")
                 .call(d3.axisBottom(x).tickSize(3).tickValues(d3.range(0, 2, 1)).tickFormat(d3.format(".0f")));
    lossContainer.append("g")
                 .attr("class", "y-axis")
                 .attr("transform", "translate(50, 0)")
                 .call(d3.axisLeft(y).tickValues(d3.range(0, 2.1, 0.5)).tickSize(3));
    lossContainer.append("text")             
                 .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 30) + " ," + 
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
    lossContainer.append("g")
                 .attr("class", "data");

    return {x: x, y: y};
}

export function updateChart(d3Container, lineGenerator, data, colors, scales) {
    updatePaths(d3Container, lineGenerator, data, colors);
    updateDomain(scales, data);
    updateAxes(d3Container, data, scales);
}

function updatePaths(d3Container, lineGenerator, data, colors) {
    d3Container.select("g.data")
               .selectAll("path")
               .data(data)
               .join((enter) => enter.append("path"))
               .attr("d", lineGenerator)
               .attr("fill", "none")
               .attr("stroke", (d, idx) => colors[idx])
               .attr("stroke-width", 1.5);
}

function updateDomain(scales, data) {
    // dataMax = d3.max(yData);
    scales.x.domain([0, data[0].length]);
    // y.domain([0, dataMax]);
}

function updateAxes(d3Container, data, scales) {
    d3Container.select("g.x-axis").call(d3.axisBottom(scales.x).tickValues(getXTickVals(data[0])).tickSize(3).tickFormat(d3.format(".0f")));
    // d3Container.select("g.y-axis").call(d3.axisLeft(scales.y).tickValues(d3.range(0, 2, 0.5)).tickSize(3));
}

function getXTickVals(data) {
    return d3.range(0, data.length+1, Math.trunc(data.length/10)+((data.length%10!=0)|0));
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
