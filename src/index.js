import "babel/polyfill";
import d3 from 'd3';
import _ from 'lodash';
import pym from 'pym.js';
import tooltipFactory from './tooltip.js';

let tooltip = tooltipFactory();

tooltip.hide();

let params = () => {
  return window
    .location
    .search
    .slice(1)
    .split("&")
    .reduce((o, v) => {
      let [key, value] = v.split("=");
      o[key] = value;
      return o;
    }, {})
}

if (params().noSource) {
  d3.select('.source').remove();
}


let data = _.sortBy([
  {subject: "Architecture and Engineering", value: 83000},
  {subject: "Visual and Performing Arts", value: 49000},
  {subject: "All Bachelor's Degrees", value: 61000},
  {subject: "Biology", value: 56000},
  {subject: "Business", value: 65000},
  {subject: "Communications and Journalism", value: 54000},
  {subject: "Computer Science, Statistics, and Math", value: 76000},
  {subject: "Humanities", value: 52000},
  {subject: "Physics and Chemistry", value: 65000},
  {subject: "Medicine and Nursing", value: 65000},
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

    let smallScreen = bb.width < 500;

    let margin = { top: 50, right: (smallScreen ? 60 : 200), bottom: 10, left: 30 },
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
          if (smallScreen) {
            return 10;
          }
          return d.value < 0 ? (xval - width - 10) : (xval + 10);
        },
        y : function(d) {
          let {height} = this.getBBox();
          if (smallScreen) {
            return dy/2 - height/2;
          }
          return dy/2 + height/4;
        }
      })

    row.on('mouseover', function(d) {

      let fmt = d3.format('$,')

      let thisrow = d3.select(this);

      thisrow.select('text').classed('highlight', true);

      tooltip
        .text({value: fmt(d.value)})
        .position(thisrow.select('circle').node());

    }).on('mouseout', () => {
      row.selectAll('text').classed('highlight', false);
      tooltip.hide();
    })


    return this;
  }

}


let c = (new Chart({data, id: '#chart'})).draw();
let renderCallback = _.debounce(::c.draw, 50);
new pym.Child({renderCallback});
