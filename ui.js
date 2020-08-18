import { constants } from "./constants.js";

export function initContainer(container) {
    container.append("g")
             .attr("class", "edges");
    container.append("g")
             .attr("class", "helperEdges");
    container.append("g")
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
function drawNetwork(container, network, nodes, edges, model) {
    // create generator for cubic Bezier curves
    const curveGenerator = d3.linkHorizontal()
                             .source((d) => [nodes[d.source][d.srcIdx].x + constants.RADIUS, nodes[d.source][d.srcIdx].y])      
                             .target((d) => [nodes[d.target][d.tarIdx].x - constants.RADIUS, nodes[d.target][d.tarIdx].y]);
    
    // get intial weights
    const weightVals = getModelWeights(model);
    const tooltip = d3.select("#tooltip");
    // draw edges
    container.select(".edges")
             .selectAll("path")
             .data(edges)
             .join((enter) => enter.append("path"))
             .attr("id", (d, i) => i)
             .attr("value", (d, i) => weightVals[i])
             // .attr("marker-end","url(#arrowhead)")
             .attr("d", curveGenerator)
             .style("fill", "none")
             .style("stroke", (d, i) => weightVals[i] > 0 ? "rgba(75, 167, 242, 1)": "rgba(245, 170, 71, 1)")
             .style("stroke-width", (d, i) => Math.min(Math.abs(weightVals[i])*5, 10))
             .style("stroke-dasharray", ("8, 1"));

    // draw invisible hover helper edges
    container.select(".helperEdges")
             .selectAll("path")
             .data(edges)
             .join((enter) => enter.append("path"))
             .attr("id", (d, i) => i)
             .attr("d", curveGenerator)
             .style("fill", "none")
             .style("stroke", "none")
             .style("stroke-width", 11)
             .attr("pointer-events", "stroke")
             .on("mouseover", (d) => {
                 tooltip.style("display", "block");
                 tooltip.transition().duration(200).style("opacity", 0.9);
                 tooltip.html("Weight value: <br>" + Math.trunc(weightVals[d3.event.target.id]*1000)/1000)
                        .style("top", (d3.event.pageY + 7) + "px")
                        .style("left", (d3.event.pageX + 15) + "px");

             })
             .on("mouseout", (d) => {
                tooltip.transition().duration(500).style("opacity", 0);
                tooltip.style.display = "none";
             });

    const layers = [];
    layers.push(network.inputLayer, ...network.hiddenLayers, network.outputLayer);
    container.select(".nodes")
             .selectAll("g")
             .data(layers)
             .join((enter) => enter.append("g"))
             .attr("id", (d) => d.name);

    // draw nodes for each layer
    for (const layer of layers) {
        container.select(".nodes > #" + layer.name)
                 .selectAll("circle")
                 .data(nodes[layer.name])
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

export function updateEdgeWeights(containers, weightVals) {
    containers.svgEdges.style("stroke", (d, i) => weightVals[i] > 0 ? "rgba(75, 167, 242, 1)": "rgba(245, 170, 71, 1)")
                       .style("stroke-width", (d, i) => Math.abs(weightVals[i])*5);
    // display tooltip showing weight value
    containers.helperEdges.attr("pointer-events", "stroke")
                          .on("mouseover", (d) => {
                              containers.tooltip.style("display", "block");
                              containers.tooltip.transition().duration(200).style("opacity", 0.9);
                              containers.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[d3.event.target.id]*1000)/1000)
                                        .style("top", (d3.event.pageY + 7) + "px")
                                        .style("left", (d3.event.pageX + 15) + "px");
                           });
}

export function addNodeControls(network) {
    const btnDiv = document.querySelector("#node-controls");
    while (btnDiv.firstChild) {
        btnDiv.removeChild(btnDiv.lastChild);
    }

    network.hiddenLayers.map((layer, idx) => {
        let div = document.createElement("DIV");
        div.setAttribute("class", "node-control-pair");
        div.style.left = (layer.xPos - 65) + "px";
        let btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-plus" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>\n' + 
                        '<path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/>\n' + 
                        '</svg>';
        btn.setAttribute("class", "add-node-btn");
        btn.setAttribute("title", "Add node to layer");
        btn.value = idx;
        div.appendChild(btn);
        let span = document.createElement("SPAN");
        span.setAttribute("class", "node-text");
        if (layer.size == 1) {
            span.innerHTML = "1 neuron";
        }
        else {
            span.innerHTML = layer.size + " neurons";
        }
        div.appendChild(span);
        btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-dash" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/>\n' +
                        '</svg>';
        btn.setAttribute("class", "remove-node-btn");
        btn.setAttribute("title", "Remove node from layer");
        btn.value = idx;
        div.appendChild(btn);
        btnDiv.appendChild(div);
    });
}

export function addActivationSelection(network) {
    const activations = ["Linear", "ReLU", "Sigmoid", "Softmax", "Softplus", "Tanh"];
    const positions = [constants.LEFT_POS+(constants.RIGHT_POS-constants.LEFT_POS)/2, network.outputLayer.xPos];
    const defaults = [constants.DEFAULT_ACTIVATION, constants.DEFAULT_OUTPUT_ACTIVATION];
    for (const idx in positions) {
        const select = document.createElement("SELECT");
        select.style.left = (positions[idx] - 25) + "px";
        for (const func of activations) {
            const option = document.createElement("OPTION");
            option.innerHTML = func;
            option.value = func.toLowerCase();
            if (func == defaults[idx]) {
                option.selected = true;
            }
            select.appendChild(option);
        }
        document.querySelector("#activation-controls").append(select);
    }
}

export function addCharts() {
    const accContainer = d3.select("#acc-chart")
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
                .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 10) + " ," + 
                                       (constants.CHART_HEIGHT - 3) + ")")
                .style("text-anchor", "middle")
                .text("Epoch");
    accContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 1)
                .attr("x", -(constants.CHART_HEIGHT / 2)+10)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Accuracy");    

    const lossContainer = d3.select("#loss-chart")
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
                .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 10) + " ," + 
                                       (constants.CHART_HEIGHT - 3) + ")")
                .style("text-anchor", "middle")
                .text("Epoch");
    lossContainer.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", 1)
                .attr("x", -(constants.CHART_HEIGHT / 2)+10)
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text("Loss");    
}

export function update(container, network, nodes, edges, model) {
    drawNetwork(container, network, nodes, edges, model);

    document.querySelector("#pause").style.display = "none";
    const epochSlider = document.querySelector("#epochSlider");
    epochSlider.disabled = true;
    epochSlider.value = 0;

    if (network.hiddenLayers.length == 1) {
        document.querySelector("#layer-text").innerHTML = "1 hidden layer";
    }
    else {
        document.querySelector("#layer-text").innerHTML = network.hiddenLayers.length + " hidden layers";
    }
    addNodeControls(network);
}
