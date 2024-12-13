// add your JavaScript/D3 to this file

const svg = d3.select("svg"),
    margin = {top: 60, right: 40, bottom: 70, left: 100},
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

const x = d3.scaleLinear().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

const xAxis = g.append("g")
    .attr("transform", "translate(0," + height + ")");
const yAxis = g.append("g");


// title
svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", margin.top / 2)
    .attr("text-anchor", "middle")
    .style("font-size", "20px")
    .style("text-decoration", "underline")
    .text("Water and Sanitation Improvements Over Time");

// tool tip
svg.append("text")
    .attr("x", (width) - 60 + margin.left)
    .attr("y", margin.top / 2+20)
    .attr("text-anchor", "middle")
    .style("font-size", "15px")
    .style("fill", "gray")
    .text("Hover over the point");

// x axis
svg.append("text")
    .attr("x", (width / 2) + margin.left)
    .attr("y", height + margin.top + 50)
    .attr("text-anchor", "middle")
    .text("Year");

// y axis
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", margin.left - 60)
    .attr("x", -(height / 2) - margin.top)
    .attr("text-anchor", "middle")
    .text("Percentage");

// legend
const legend1 = svg.append("g")
    .attr("transform", "translate(" + (margin.left + 500) + "," + (margin.top + 220) + ")");

legend1.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "steelblue");

legend1.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Total Improved Water")
    .style("font-size", "15px")
    .attr("alignment-baseline","middle");

const legend2 = svg.append("g")
    .attr("transform", "translate(" + (margin.left + 500) + "," + (margin.top + 250) + ")");
    
legend2.append("rect")
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", "green");

legend2.append("text")
    .attr("x", 20)
    .attr("y", 10)
    .text("Total Improved Sanitation")
    .style("font-size", "15px")
    .attr("alignment-baseline","middle");

// load data
d3.csv("countrydata.csv").then(function(data) {
    data.forEach(function(d) {
        d.Year = +d.Year;
        d.TotalImprovedwater = +d.TotalImprovedwater;
        d.TotalImprovedSanitation = +d.TotalImprovedSanitation;
    });

    // country options
    const countries = Array.from(new Set(data.map(d => d.Country)));
    d3.select("#countrySelect")
      .selectAll("option")
      .data(countries)
      .enter().append("option")
      .text(d => d)
      .attr("value", d => d);

    update("Bangladesh"); // default contry

    // update plot
    d3.select("#countrySelect").on("change", function(event) {
        update(d3.select(this).property("value"));
    });

    function update(country) {
        const filteredData = data.filter(d => d.Country === country);

        x.domain(d3.extent(filteredData, d => d.Year));
        y.domain([0, 100]);

        // create lines
        const lineWater = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.TotalImprovedwater));
        
        const lineSanitation = d3.line()
            .x(d => x(d.Year))
            .y(d => y(d.TotalImprovedSanitation));
        
        const tooltip = d3.select("#tooltip");

        g.selectAll(".lineWater")
          .data([filteredData])
          .join("path")
          .attr("class", "lineWater")
          .attr("d", lineWater)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 2);

        g.selectAll(".lineSanitation")
          .data([filteredData])
          .join("path")
          .attr("class", "lineSanitation")
          .attr("d", lineSanitation)
          .attr("fill", "none")
          .attr("stroke", "green")
          .attr("stroke-width", 2);
          
        g.selectAll(".dotWater")
          .data(filteredData)
          .join("circle")
          .attr("class", "dotWater")
          .attr("cx", d => x(d.Year))
          .attr("cy", d => y(d.TotalImprovedwater))
          .attr("r", 5)
          .attr("fill", "steelblue")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`Year: ${d.Year}<br>Water: ${d.TotalImprovedwater}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"));
          
        g.selectAll(".dotSanitation")
          .data(filteredData)
          .join("circle")
          .attr("class", "dotSanitation")
          .attr("cx", d => x(d.Year))
          .attr("cy", d => y(d.TotalImprovedSanitation))
          .attr("r", 5)
          .attr("fill", "green")
          .on("mouseover", (event, d) => {
            tooltip.style("visibility", "visible")
              .html(`Year: ${d.Year}<br>Sanitation: ${d.TotalImprovedSanitation}%`)
              .style("left", (event.pageX + 10) + "px")
              .style("top", (event.pageY + 10) + "px");
          })
          .on("mouseout", () => tooltip.style("visibility", "hidden"));

        // update axis
        xAxis.call(d3.axisBottom(x).tickFormat(d3.format("d")));
        yAxis.call(d3.axisLeft(y));
    }
});