import "babel/polyfill";
import d3 from 'd3';
import _ from 'lodash';
import pym from 'pym.js';

let data = _.sortBy([
  {subject: "Architecture and Engineering", value: 83000},
  {subject: "Arts", value: 49000},
  {subject: "All Bachelor's Degrees", value: 61000},
  {subject: "Biology", value: 56000},
  {subject: "Business", value: 65000},
  {subject: "Communications and Journalism", value: 54000},
  {subject: "Computer Science, Statistics, and Math", value: 76000},
  {subject: "Humanities", value: 52000},
  {subject: "Physical Science", value: 65000},
  {subject: "Health", value: 65000},
  {subject: "Law and Public Policy", value: 54000}
], 'value');

class Chart {

  constructor({data, id}) {
    this.data = data;
    this.container = d3.select(id);
  }

  draw() {

    let fmt = d3.format('$,');

    let {data} = this;

    let bb = this.container.node().getBoundingClientRect();

    let margin = { top: 50, right: 200, bottom: 10, left: 30 },
        width = bb.width - margin.left - margin.right,
        height = bb.height - margin.top - margin.bottom;

    let svg = this.container.html('').append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
      .append('g')
        .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    let x = d3.scale.linear()
      .range([0, width])
      .domain([0, d3.max(data, d => d.value)]);

    let gridAxis = d3.svg.axis()
      .scale(x)
      .orient("top")
      .ticks(5)
      .innerTickSize(-height)
      .tickFormat(fmt);

    let dy = height/data.length;

    svg.append("g")
        .attr("class", "x grid")
        .call(gridAxis)

    let row = svg.append('g')
        .selectAll('g')
        .data(data)
      .enter().append('g')
        .attr('transform', (d,i) => `translate(0,${i*dy})`);

    row.append('line')
      .attr({
        x1 : 0,
        x2 : d => x(d.value),
        y1 : dy/2,
        y2 : dy/2
      });

    row.append('circle')
      .attr({
        cx : d => x(d.value),
        cy : dy/2,
        r: 4
      })

    row.append('text')
      .text(d => d.subject)
      .attr({
        x : function(d) {
          let {width} = this.getBBox();
          let xval = x(d.value);
          return d.value < 0 ? (xval - width - 10) : (xval + 10);
        },
        y : function(d) {
          let {height} = this.getBBox();
          return dy/2 + height/4;
        }
      })

    return this;
  }

}


let c = (new Chart({data, id: '#chart'})).draw();
let renderCallback = _.debounce(::c.draw, 50);
new pym.Child({renderCallback});


