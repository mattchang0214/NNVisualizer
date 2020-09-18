import { constants } from "./constants.js";
import * as selectTransform from "./selectTransform.js";


export function initContainer(d3Selection) {
    d3Selection.append("g")
               .attr("class", "edges");
    d3Selection.append("g")
               .attr("class", "overlayEdges");
    d3Selection.append("g")
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
function drawNetwork(d3Selections, networkData, model) {
    // create link generator for smooth cubic Bezier curves
    const curveGenerator = d3.linkHorizontal()
                             .source((d) => [networkData.nodes[d.source][d.srcIdx].x + constants.RADIUS, networkData.nodes[d.source][d.srcIdx].y])      
                             .target((d) => [networkData.nodes[d.target][d.tarIdx].x - constants.RADIUS, networkData.nodes[d.target][d.tarIdx].y]);
    
    // get intial weights
    const weightVals = getModelWeights(model);
    // draw edges
    d3Selections.svgEdges
                .data(networkData.edges)
                .join((enter) => enter.append("path"))
                .attr("id", (d, i) => i)
                .attr("value", (d, i) => weightVals[i])
                .attr("d", curveGenerator)
                .style("fill", "none")
                .style("stroke", (d, i) => weightVals[i] > 0 ? "rgb(75, 167, 242)": "rgb(245, 170, 71)")
                .style("stroke-width", (d, i) => Math.min(Math.abs(weightVals[i])*5, 10))
                .style("stroke-dasharray", ("8, 1"));

    // draw invisible overlay edges for hover event
    d3Selections.overlayEdges
                .data(networkData.edges)
                .join((enter) => enter.append("path"))
                .attr("id", (d, i) => i)
                .attr("d", curveGenerator)
                .style("fill", "none")
                .style("stroke", "none")
                .style("stroke-width", 10)
                .style("pointer-events", "stroke")
                .on("mouseover", (event) => {
                    d3Selections.tooltip.style("display", "block");
                    d3Selections.tooltip.transition().duration(200).style("opacity", 0.9);
                    d3Selections.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[event.target.id]*1000)/1000)
                                .style("top", (event.pageY + 7) + "px")
                                .style("left", (event.pageX + 15) + "px");

                })
                .on("mouseout", () => {
                     d3Selections.tooltip.transition().duration(200).style("opacity", 0);
                });

    const layers = [];
    layers.push(networkData.network.inputLayer, ...networkData.network.hiddenLayers, networkData.network.outputLayer);
    d3Selections.svgNodes
                .selectChildren("g")
                .data(layers)
                .join((enter) => enter.append("g"))
                .attr("id", (d) => d.name);

    // draw nodes for each layer
    for (const layer of layers) {
        d3Selections.svgNodes
                    .selectChild("g#" + layer.name)
                    .selectChildren("circle")
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

export function updateEdgeWeights(d3Selections, weightVals) {
    d3Selections.svgEdges.style("stroke", (d, i) => weightVals[i] > 0 ? "rgb(75, 167, 242)": "rgb(245, 170, 71)")
                         .style("stroke-width", (d, i) => Math.abs(weightVals[i])*5);
    // display tooltip showing weight value
    d3Selections.overlayEdges.style("pointer-events", "stroke")
                             .on("mouseover", (event) => {
                                 d3Selections.tooltip.style("display", "block");
                                 d3Selections.tooltip.transition().duration(200).style("opacity", 0.9);
                                 d3Selections.tooltip.html("Weight value: <br>" + Math.trunc(weightVals[event.target.id]*1000)/1000)
                                             .style("top", (event.pageY + 7) + "px")
                                             .style("left", (event.pageX + 15) + "px");
                                });
}

function addNodeControls(htmlElt, network) {
    while (htmlElt.firstChild) {
        htmlElt.removeChild(htmlElt.lastChild);
    }

    network.hiddenLayers.map((layer, idx) => {
        const div = document.createElement("DIV");
        div.className = "node-control-pair";
        div.style.left = (layer.xPos - 39)*(912/constants.NETWORK_WIDTH) + "px";
        let btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-plus" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M8 3.5a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5H4a.5.5 0 0 1 0-1h3.5V4a.5.5 0 0 1 .5-.5z"/>\n' + 
                        '<path fill-rule="evenodd" d="M7.5 8a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1H8.5V12a.5.5 0 0 1-1 0V8z"/>\n' + 
                        '</svg>';
        btn.className = "add-node-btn";
        btn.title = "Add node to layer";
        btn.value = idx;
        div.append(btn);
        btn = document.createElement("BUTTON");
        btn.innerHTML = '<svg width="2em" height="2em" viewBox="0 -1 16 16" class="bi bi-dash" fill="white" xmlns="http://www.w3.org/2000/svg" stroke="white" stroke-width="1">\n' +
                        '<path fill-rule="evenodd" d="M3.5 8a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 0 1H4a.5.5 0 0 1-.5-.5z"/>\n' +
                        '</svg>';
        btn.className = "remove-node-btn";
        btn.title = "Remove node from layer";
        btn.value = idx;
        div.append(btn);
        const para = document.createElement("P");
        para.className = "node-text";
        if (layer.size == 1) {
            para.innerHTML = "1 neuron";
        }
        else {
            para.innerHTML = layer.size + " neurons";
        }
        div.append(para);
        htmlElt.append(div);
    });
}

export function addActivationSelection(network) {
    const activations = ["Linear", "ReLU", "Sigmoid", "Softmax", "Softplus", "Tanh"];
    const data = {
                     labels: ["Hidden Layer Activation", "Output Layer Activation"],
                     id: ["hidden", "output"],
                     defaults: [constants.DEFAULT_ACTIVATION, constants.DEFAULT_OUTPUT_ACTIVATION],
                 };
    for (const idx in data.labels) {
        const div = document.createElement("DIV");
        div.className = "control-elt";
        div.id = data.id[idx];
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

export function addCharts(chartInfo) {
    const margin = {top: 10, right: 10, bottom: 30, left: 50};
    for (const chart of chartInfo) {
        const container = chart.d3Selection
                               .append("svg")
                               .attr("viewBox", "0 0 " + constants.CHART_WIDTH + " " + constants.CHART_HEIGHT);

        const x = d3.scaleLinear()
                .domain(chart.domainX)
                .rangeRound([margin.left, constants.CHART_WIDTH - margin.right]);
        const y = d3.scaleLinear()
                    .domain(chart.domainY)
                    .rangeRound([constants.CHART_HEIGHT - margin.bottom, margin.top]);
        container.append("g")
                 .attr("class","x-axis")
                 .attr("transform", "translate(0, " + (constants.CHART_HEIGHT - margin.bottom) + ")")
                 .call(d3.axisBottom(x).tickValues(chart.ticksX).tickSize(3).tickFormat(d3.format(".0f")));
        container.append("g")
                 .attr("class", "y-axis")
                 .attr("transform", "translate(" + margin.left + ", 0)")
                 .call(d3.axisLeft(y).tickValues(chart.ticksY).tickSize(3).tickFormat(d3.format(".2f")));
        container.append("text")             
                 .attr("transform", "translate(" + (constants.CHART_WIDTH/2 + 30) + ", " + 
                                        (constants.CHART_HEIGHT - 3) + ")")
                 .style("text-anchor", "middle")
                 .text(chart.labelX);
        container.append("text")
                 .attr("transform", "rotate(-90) translate(" + (-constants.CHART_HEIGHT/2 + 10) + ", 15)")
                 .style("text-anchor", "middle")
                 .text(chart.labelY);
        container.append("g")
                 .attr("class", "data");
        container.append("g")
                 .attr("class", "legend")
                 .attr("transform","translate(" + (margin.left+10) + ", " + (margin.top+5) + ")")
                 .call(legend, chart.legend);

        const hoverElts = container.append("g")
                                   .attr("class", "hoverElts")
                                   .call(addHover, chart.legend, margin);

        container.append("rect")
                 .attr("class", "overlayChart")
                 .attr("x", margin.left)
                 .attr("y", margin.top)
                 .attr("width", constants.CHART_WIDTH - margin.left - margin.right)
                 .attr("height", constants.CHART_HEIGHT - margin.top - margin.bottom)
                 .style("fill", "none")
                 .style("stroke", "none")
                 .style("pointer-events", "fill")
                 .on("mouseout", () => {
                     hoverElts.style("display", "none");
                 });

        chart.axes.x = x;
        chart.axes.y = y;
    }
}

function legend(d3Selection, entries) {
    let idx = 0;
    for (const entry of entries) {
        const label = d3Selection.append("g").attr("class", "label").attr("transform", "translate(0," + (idx++)*17 + ")");
        label.append("line")
             .attr("x1", 0)
             .attr("y1", 0)
             .attr("x2", 25)
             .attr("y2", 0)
             .attr("fill", "none")
             .attr("stroke", entry.color)
             .attr("stroke-width", 1.5);
        label.append("text")
             .text(entry.text)
             .attr("transform", "translate(30, 4)")
             .style("text-shadow", "-2px -2px 2px #fff, 2px -2px 2px #fff, -2px 2px 2px #fff, 2px 2px 2px #fff");
    }
}

function addHover(d3Selection, legend, margin) {
    d3Selection.append("text")
               .attr("transform", "translate(" + (margin.left+10) + ", " + (constants.CHART_HEIGHT - margin.bottom - 5 - (legend.length)*12) + ")");

    for (const idx in legend) {
        d3Selection.append("text")
                   .attr("transform", "translate(" + (margin.left+10) + ", " + (constants.CHART_HEIGHT - margin.bottom - 5 - (legend.length-1-idx)*12) + ")");
    }

    d3Selection.append("line")
               .attr("class", "hoverLine")
               .attr("y1", margin.top)
               .attr("y2", constants.CHART_HEIGHT - margin.bottom)
               .style("stroke", "#999")
               .style("stroke-width", 1.5)
               .style("opacity", 0.65);

    d3Selection.selectChildren("circle")
               .data(legend)
               .join((enter) => enter.append("circle"))
               .attr("class", "hoverPoints")
               .attr("r", 4)
               .style("stroke", "none")
               .style("fill", (d) => d.color)
               .style("opacity", 0.65);
}

export function updateChart(d3Selection, axes, data, legend) {
    updateDomain(axes, data);
    updateAxes(d3Selection, axes, data);
    updatePaths(d3Selection, d3.line()
                               .curve(d3.curveMonotoneX)
                               .x((d) => axes.x(d.epoch))
                               .y((d) => axes.y(d.value)), data, legend);
    updateHover(d3Selection, axes, data, legend);
}

function updateDomain(axes, data, max=1) {
    if (data != null && data.length > 0 && data[0] != null) {
        max = data[0].length;
    }
    axes.x.domain([0, max]);
    // dataMax = d3.greatest(yData, (a, b) => a.value - b.value);
    // y.domain([0, dataMax]);
}

function updateAxes(d3Selection, axes, data, max=1) {
    if (data != null && data.length > 0 && data[0] != null) {
        max = data[0].length;
    }
    d3Selection.selectChild(".x-axis").call(d3.axisBottom(axes.x).tickValues(getXTickVals(max)).tickSize(3).tickFormat(d3.format(".0f")));
    // d3Selection.selectChild(".y-axis").call(d3.axisLeft(axes.y).tickValues(d3.range(0, 2, 0.5)).tickSize(3));
}

function getXTickVals(length) {
    return d3.range(0, length+1, Math.trunc(length/10)+((length%10!=0)|0));
}

function updatePaths(d3Selection, lineGenerator, data, legend) {
    d3Selection.selectChild("g.data")
               .selectChildren("path")
               .data(data)
               .join((enter) => enter.append("path"))
               .attr("d", lineGenerator)
               .attr("fill", "none")
               .attr("stroke", (d, idx) => legend[idx].color)
               .attr("stroke-width", 1.5);
}

function updateHover(d3Selection, axes, data, legend) {
    const hoverElts = d3Selection.selectChild(".hoverElts");
    const hoverLine = hoverElts.selectChild(".hoverLine");
    const hoverPoints = hoverElts.selectChildren(".hoverPoints");
    const hoverText = hoverElts.selectChildren("text");
    // create bisector to get index of the closest value to x
    const bisector = d3.bisector((d) => axes.x(d.epoch)).center;
    const format = d3.format(".3f");

    d3Selection.selectChild(".overlayChart")
               .on("mouseover", () => {
                     hoverElts.style("display", "block");
               })
               .on("mousemove", (event) => {
                   // get x-coordinate of mouse position relative to chart SVG
                   const posX = d3.pointer(event, d3Selection.node())[0];
                   const idx = bisector(data[0], posX);
                   const x = axes.x(data[0][idx].epoch);
                   hoverLine.attr("x1", x)
                            .attr("x2", x);
                   hoverPoints.each(function (d, i) {
                       d3.select(this)
                         .attr("cx", x)
                         .attr("cy", axes.y(data[i][idx].value));
                   });
                   hoverText.each(function (d, i) {
                       const text = i == 0 ? "epoch: " + data[0][idx].epoch : legend[i-1].text + ": " + format(data[i-1][idx].value);
                       d3.select(this)
                         .text(text);
                   });
               });
}

export function clearCharts(chartInfo) {
    for (const chart of chartInfo) {
        const svg = chart.d3Selection.selectChild("svg");
        svg.selectChild("g.data").selectChildren("path").remove();
        svg.selectChild(".overlayChart")
           .on("mouseover", null)
           .on("mousemove", null);

        chart.data = [[], []];
        updateDomain(chart.axes, null);
        updateAxes(svg, chart.axes, null);
    }
}

export function addTableHeader(tableElt, dataset) {
    let row = document.createElement("TR");
    const headers = [];
    headers.push(...dataset.features, "prediction", "confidence", "ground truth");
    for (const feature of headers) {
        const th = document.createElement("TH");
        th.innerHTML = feature;
        row.append(th);
    }
    tableElt.append(row);

    row = document.createElement("TR");
    row.id = "placeholder";
    const th = document.createElement("TD");
    th.innerHTML = "No trained model!";
    th.colSpan = headers.length;
    row.append(th);
    tableElt.append(row);
}

export function addTable(tableElt, dataset, model) {
    tableElt.querySelector("#placeholder").style.display = "none";

    tf.tidy(() => {
        let xTest = dataset.xVal.slice(0, 6);
        const yTest = tf.unstack(dataset.yVal.slice(0, 6));
        const yPred = tf.unstack(model.predict(xTest));
        xTest = tf.unstack(xTest.mul(dataset.std).add(dataset.mean));

        for (let i = 0; i < xTest.length; i++) {
            const row = document.createElement("TR");
            const featVals = xTest[i].dataSync();
            for (const val of featVals) {
                const td = document.createElement("TD");
                td.innerHTML = new Number(val).toPrecision(2);
                row.append(td);
            }
            const predIdx = yPred[i].argMax().dataSync()[0];
            const trueIdx = yTest[i].argMax().dataSync()[0];
            const maxVal = yPred[i].max().dataSync()[0];

            const predTD = document.createElement("TD");
            predTD.innerHTML = dataset.classes[predIdx];
            row.append(predTD);
            predTD.style.color = trueIdx == predIdx ? "green" : "red";

            for (const val of [new Number(maxVal).toPrecision(4), dataset.classes[trueIdx]]) {
                const td = document.createElement("TD");
                td.innerHTML = val;
                row.append(td);
            }
            tableElt.append(row);
        }
    });
}

export function clearTableData(tableElt) {
    while (tableElt.firstChild) {
        if (tableElt.lastChild.id == "placeholder") {
            break;
        }
        tableElt.removeChild(tableElt.lastChild);
    }
    tableElt.querySelector("#placeholder").style.display = "table-row";
}

export function clearTable(tableElt) {
    while (tableElt.firstChild) {
        tableElt.removeChild(tableElt.lastChild);
    }
}


export function update(d3Selections, htmlElts, networkData, model) {
    drawNetwork(d3Selections, networkData, model);

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
