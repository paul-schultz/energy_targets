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

  var parseTime = d3.timeParse("%Y");
  
  // Add X axis
  var x = d3
    .scaleTime()
    .domain(
      d3.extent(data, (d) => {
        return parseTime(d.Year);
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

  var yRight = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(data, (d) => {
        return +d.Value;
      }),
    ])
    .range([height, 0]);
  svg.append("g").attr("transform", "translate(" + width + ",0)").call(d3.axisRight(yRight));

  console.log(sumstat);

  // Color change functions
  function changeRed(selection) {
    selection.attr("stroke", "red");
  }

  function changeYellow(selection) {
    selection.attr("stroke", "yellow");
  }

  function changeGreen(selection) {
    selection.attr("stroke", "green");
  }

  function colorDefault(selection) {
    selection.attr("stroke", "#e4e4e4");
  }

  // Draw lines
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
          return x(parseTime(d.Year));
        })
        .y((d) => {
          return y(+d.Value);
        })(d.values);
    })
    // Tooltips
    .on("mouseover", function (d) {
      var diff = d.values[1].Value - d.values[0].Value
      console.log(diff)
      if ( 60 < d.values[1].Value ) {
        d3.select(this).transition().duration(200).call(changeGreen);
        tooltip.transition().duration(200).style("opacity", 0.9).style("background", "green").style("color", 'white');
      } else if (20 <= diff && diff <= 40) {
        d3.select(this).transition().duration(200).call(changeYellow);
        tooltip.transition().duration(200).style("opacity", 0.9).style("background", "yellow").style("color", 'black');
      } else {
        d3.select(this).transition().duration(200).call(changeRed);
        tooltip.transition().duration(200).style("opacity", 0.9).style("background", "red").style("color", 'white');
      }
      tooltip
        .html(d.values[0].Name)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY + 28 + "px");
    })
    .on("mouseout", function (d) {
      d3.select(this).transition().duration(200).call(colorDefault);
      tooltip.transition().duration(500).style("opacity", 0);
    });
});
