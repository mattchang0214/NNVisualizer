const WIDTH = 300;
const HEIGHT = 200;

function linear(min, max, step, x, y) {
    return d3.range(min, max+step, step).map(d => [x(d), y(d)]);
}

function relu(min, max, step, x, y) {
    return d3.range(min, max+step, step).map(d => {return d <= 0 ? [x(d), y(0)] : [x(d), y(d)];});
}

function sigmoid(min, max, step, x, y) {
    return d3.range(min, max+step, step).map(d => [x(d), y(1/(1+Math.exp(-(d))))]);
}

function softmax(min, max, step) {
    // body...
}

function softplus(min, max, step, x, y) {
    return d3.range(min, max+step, step).map(d => [x(d), y(Math.log(1+Math.exp(d)))]);
}

function tanh(min, max, step, x, y) {
    return d3.range(min, max+step, step).map(d => [x(d), y(Math.tanh(d))]);
}


const svgContainer = d3.select("#network")
                       .append("svg")
                       .attr("width", WIDTH)
                       .attr("height", HEIGHT)
                       .style("border", "1px solid black");

const x = d3.scaleLinear()
                .domain([-10, 10])
                .rangeRound([20, WIDTH - 10]);
const y = d3.scaleLinear()
            .domain([-1.5, 1.5])
            .rangeRound([HEIGHT-10, 10]);

svgContainer.append("g")
                .attr("class","x-axis")
                .attr("transform", "translate(0," + (10+(HEIGHT - 20)/3*1.5) + ")")
                .call(d3.axisBottom(x).tickValues(d3.range(-10, 10, 1)).tickSize(3).tickFormat("").tickSizeOuter(0));
svgContainer.append("g")
            .attr("class", "y-axis")
            .attr("transform", "translate(" + (20+(WIDTH - 30)/20*10) + ", 0)")
            .call(d3.axisLeft(y).tickValues(d3.range(-1, 2, 1)).tickSize(3).tickFormat("").tickSizeOuter(0));

const line = d3.line().curve(d3.curveMonotoneX)(tanh(-10, 10, 1, x, y));

svgContainer.append("path")
            .attr("d", line)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 4);


