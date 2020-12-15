var margin = { top: 10, right: 30, bottom: 30, left: 60 },
  width = 460 - margin.left - margin.right,
  height = 1000 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3
  .select("#chart")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// tooltip
var tooltip = d3
  .select("body")
  .append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

//Read data
d3.csv("targets.csv", function (data) {
  // group data
  var sumstat = d3
    .nest() // nest function allows to group the calculation per level of a factor
    .key(function (d) {
      return d.Name;
    })
    .entries(data);

  // Add X axis
  var x = d3
    .scaleLinear()
    .domain(
      d3.extent(data, (d) => {
        return d.Year;
      })
    )
    .range([0, width]);
  svg
    .append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(1));

  // Add Y axis
  var y = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, (d) => {
        return +d.Value;
      }),
    ])
    .range([height, 0]);
  svg.append("g").call(d3.axisLeft(y));

  console.log(sumstat[0].values[0].Name);

  function changeColor(selection) {
    selection.attr("stroke", "red")
    selection.attr("z-index", 1000);
  }

  function colorDefault(selection) {
    selection.attr("stroke", "#e4e4e4");
  }
  // Draw the line
  svg
    .selectAll(".line")
    .data(sumstat)
    .enter()
    .append("path")
    .attr("fill", "none")
    .attr("stroke", "#e4e4e4")
    .attr("stroke-width", 5)
    .attr("d", (d) => {
      return d3
        .line()
        .x((d) => {
          return x(d.Year);
        })
        .y((d) => {
          return y(+d.Value);
        })(d.values);
    })
    .on("mouseover", function(d) {
      d3.select(this).transition().duration(200).call(changeColor);
      tooltip.transition().duration(200).style("opacity", 0.9);
      tooltip
        .html("City: " + d.values[0].Name)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + 28 + "px");
    })
    .on("mouseout", function(d) {
      d3.select(this).transition().duration(200).call(colorDefault);
      tooltip.transition().duration(500).style("opacity", 0);
    });
});
