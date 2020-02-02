<template>
  <div>
    <svg :id="player_id"/>
    <stats-panel :playerName="playerName"/>
  </div>
</template>

<script>
/* eslint-disable */
import _ from "lodash";
import * as d3 from "d3";
import Players from "../data/data.json";
import StatsPanel from './StatsPanel.vue'
export default {
  props: ["player_id", "playerName", "extent", "field"],
  name: 'Heatmap',
  data() {
    return {
      playerNameStats: '',
      height: 0,
      width: 0,
      imageBuff: 60,
      bottomBuff: 40,
      margin: { top: 0, right: 0, bottom: 30, left: 10 },
      dataMapping: {
        "1st and <=5": {
          start_angle: -Math.PI / 2,
          end_angle: -Math.PI / 4,
          innerRadius: 0,
          outerRadius: 0
        },
        "1st and 6+": {
          start_angle: -Math.PI / 2,
          end_angle: -Math.PI / 4,
          innerRadius: 1,
          outerRadius: 1
        },
        "2nd and <=5": {
          start_angle: -Math.PI / 4,
          end_angle: 0,
          innerRadius: 0,
          outerRadius: 0
        },
        "2nd and 6+": {
          start_angle: -Math.PI / 4,
          end_angle: 0,
          innerRadius: 1,
          outerRadius: 1
        },
        "3rd and <=5": {
          start_angle: 0,
          end_angle: Math.PI / 4,
          innerRadius: 0,
          outerRadius: 0
        },
        "3rd and 6+": {
          start_angle: 0,
          end_angle: Math.PI / 4,
          innerRadius: 1,
          outerRadius: 1
        },
        "4th and <=5": {
          start_angle: Math.PI / 4,
          end_angle: Math.PI / 2,
          innerRadius: 0,
          outerRadius: 0
        },
        "4th and 6+": {
          start_angle: Math.PI / 4,
          end_angle: Math.PI / 2,
          innerRadius: 1,
          outerRadius: 1
        }
      },
      labelMapping: {
        "First": {
          "start_angle": -Math.PI / 2,
          "end_angle": -Math.PI / 4,
          "name": "1st",
        },
        "Second": {
          "start_angle": -Math.PI / 4,
          "end_angle": 0,
          "name": "2nd"
        },
        "Third": {
          "start_angle": 0,
          "end_angle": Math.PI / 4,
          "name": "3rd"
        },
        "Fourth": {
          "start_angle": Math.PI / 4,
          "end_angle": Math.PI / 2,
          "name": "4th"
        }
      },
      data: [],
      heatMapColors: [
        "#fee5d9",
        "#fcbba1",
        "#fc9272",
        "#fb6a4a",
        "#ef3b2c",
        "#cb181d"
      ],
      colorScale: 0,
      player: [],
      svg: null
    };
  },
  mounted() {
    window.addEventListener("resize", _.debounce(this.setDimensions, 500));
    this.setDimensions();
    this.init();
    this.initScale();
  },
  beforeDestroy() {
    window.removeEventListener("resize", _.debounce(this.setDimensions, 500));
  },
  watch: {
    width: function widthChanged() {
      this.initGraph();
    },
    playerName: {
      handler: function playerChanged(newValue) {
        console.log(newValue)
        this.initGraph();
      },
      immediate: true
    },
    extent: function extentChanged(newValue) {
      this.initScale();
    }
  },
  methods: {
    setDimensions() {
      if (this.width !== this.$el.offsetWidth) {
        this.width = this.$el.offsetWidth
        this.height = this.$el.offsetWidth / 2 + this.imageBuff + this.bottomBuff
      }
    },
    init() {
      this.colorScale = d3.scaleQuantize(this.extent, this.heatMapColors); //TODO find out why this need to be set here
      this.data = Object.keys(this.dataMapping);
      let height = this.height - this.margin.top - this.margin.bottom;
      let width = this.width - this.margin.left - this.margin.right;
      let svg = d3
        .select("#" + this.player_id)
        .attr("width", width)
        .attr("height", height)

      const g = svg.append("g").attr("class", "main_group");

      let heatmap_group = g.append("g").attr("class", "heatmap_group");

      let legend_group = heatmap_group.append("g").attr("class", "legend_group");

      let label_group = heatmap_group.append("g").attr("class", "label_group");

      this.svg = svg
    },
    initGraph() {
      this.player = Players['players'][this.playerName]['down_dist'];
      let height = this.height - this.margin.top - this.margin.bottom;
      let width = this.width - this.margin.left - this.margin.right;
      let horizontalCenter = width / 2;
      let verticalCenter = height - this.imageBuff + 10 - this.bottomBuff; // need a variable for this value

      let svg = d3
        .select("#" + this.player_id)
        .attr("width", width)
        .attr("height", height);

      const g = svg
        .select(".main_group")
        .attr(
          "transform",
          "translate(" + horizontalCenter + "," + verticalCenter + ")"
        );

      let startBase = 50; // TODO find ratio between height and width
      let endBase = this.width / 2 - 25;
      let areaEnd = endBase - 10
      let split = (areaEnd - startBase) / 2 + startBase;
      let heatmap_group = svg.select(".heatmap_group");
      
      let areas = heatmap_group
        .selectAll(".areas")
        .data(this.data)
        .join("path")
        .transition()
        .duration(500)
        .attr(
          "d",
          d3
            .arc()
            .innerRadius(d => {
              if (this.dataMapping[d].innerRadius) {
                return split;
              }
              return startBase;
            })
            .outerRadius(d => {
              if (this.dataMapping[d].outerRadius) {
                return areaEnd;
              }
              return split;
            })
            .startAngle(d => this.dataMapping[d].start_angle)
            .endAngle(d => this.dataMapping[d].end_angle)
        )
        .attr("fill", d => {
          if (this.player[d] && this.player[d][this.field] !== "0.0") {
            return this.colorScale(parseInt(this.player[d][this.field]));
          }
          return "lightgray";
        })
        .attr("class", "areas");
      
      // no need for this to be run for each instance of a player, this is same
      // across cards
      // down labels
      let label_positions = this.initLabels(areaEnd, endBase, Object.keys(this.labelMapping), this.labelMapping)
      let labels = heatmap_group.selectAll('.labels')
        .data(Object.keys(label_positions))
        .join('text')
          .transition()
          .duration(500)
          .attr('x', d => label_positions[d].x)
          .attr('y', d => label_positions[d].y)
          .text((d) => {
            if (this.labelMapping[d].name === '3rd') {
              return this.labelMapping[d].name + ' Down'
            }
            return this.labelMapping[d].name
          })
          .style('text-anchor', d => { // can add this styling to the options
            if (d === 'First' || d === 'Second') {
              return 'end'
            }
            return 'start'
          })
          .attr('class', 'labels text-xs md:text-base')
      // areaEnd = areaEnd - 10
      let upperPositions = this.initLabels(split, areaEnd, ["1st and 6+", "2nd and 6+", "3rd and 6+", "4th and 6+"], this.dataMapping)
      let lowerPositions = this.initLabels(startBase, split, ["1st and <=5", "2nd and <=5", "3rd and <=5", "4th and <=5"], this.dataMapping)
      let positions = Object.assign({}, upperPositions, lowerPositions)

      let upperLabels = heatmap_group.selectAll('.position_labels')
        .data(Object.keys(positions))
        .join('text')
          .transition()
          .duration(500)
          .attr('x', d => positions[d].x)
          .attr('y', d => positions[d].y)
          .text(d => {
            if (this.player[d]) {
              return this.formatComma(this.player[d][this.field])
            }
            return ""
          })
          .style('text-anchor', d => { // can add this styling to the options
            return 'middle'
          })
          .attr('class', 'position_labels text-xs md:text-base')
      
      // distance labels
      let label_group = heatmap_group.select(".label_group")
      let dlables = ["4th and <=5", "4th and 6+"]
      let distance_labels = label_group.selectAll(".distance_labels")
        .data(dlables)
        .join('text')
          .transition()
          .duration(500)
          .attr('x', d => positions[d].x)
          .attr('y', d => 15)
          .text(d => {
            if (d === '4th and <=5') {
              return '<=5'
            }
            return '6+ yards'
          })
          .style('text-anchor', d => {
            return 'start'
          })
          .attr('class', 'text-xs md:text-base distance_labels')
      
      // image
      let player_id = Players['players'][this.playerName]['id']
      let imageWidth = startBase * 2
      let imageHeight = imageWidth / 1.4
      let player_image = heatmap_group.selectAll('.player_image')
        .data([player_id])
        .join('image')
        .attr('xlink:href', (d) => {
          return 'https://a.espncdn.com/combiner/i?img=/i/headshots/nfl/players/full/' + d + '.png&w=350&h=254'
        })
        .attr('width', imageWidth)
        .attr('height', imageHeight)
        .attr('x', -imageWidth / 2)
        .attr('y', -imageHeight / 2 - 15)
        .attr('class', 'player_image')
      
      // legend scale
      let legend_group = heatmap_group.select(".legend_group")
      let bins = (this.extent[1] - this.extent[0]) / 5
      let legendBoxes = d3.range(this.extent[0], this.extent[1] + 1, bins)
      let legendScaleX = d3.scaleBand()
        .domain(legendBoxes)
        .range([-areaEnd + 20, areaEnd - 20])
        .paddingInner(0.1)
      
      let legend = legend_group.selectAll('.legend')
        .data(legendBoxes)
        .join('rect')
          .attr('x', d => legendScaleX(d))
          .attr('y', this.bottomBuff)
          .attr('width', legendScaleX.bandwidth())
          .attr('height', 15)
          .attr('fill', d => this.colorScale(d))
          .attr('class', 'legend')
      
      let legendLabelStart = legend_group.selectAll('.legendLabelStart')
        .data([this.extent[0]])
        .join('text')
          .attr('x', -areaEnd + 10)
          .attr('y', this.bottomBuff + 13)
          .text(d => d)
          .style('text-anchor', 'end')
          .attr('class', 'legendLabelStart text-xs')
      
      let legendLabelEnd = legend_group.selectAll('.legendLabelEnd')
        .data([this.extent[1]])
        .join('text')
          .attr('x', areaEnd - 12.5)
          .attr('y', this.bottomBuff + 13)
          .text(d => d)
          .style('text-anchor', 'start')
          .attr('class', 'legendLabelEnd text-xs')
      
      let legendLabelField = legend_group.selectAll('.legendLabelField')
        .data([this.field])
        .join('text')
          .attr('x', 0)
          .attr('y', this.bottomBuff + 33)
          .text(d => d)
          .style('text-anchor', 'middle')
          .attr('class', 'legendLabelField text-xs')
    },
    initScale() {
      this.colorScale = d3.scaleQuantize(this.extent, this.heatMapColors);
      let areas = this.svg.select('.heatmap_group').selectAll(".areas")
        .transition()
        .duration(500)
        .attr("fill", d => {
          if (this.player[d] && this.player[d][this.field] !== "0.0") {
            return this.colorScale(parseInt(this.player[d][this.field]));
          }
          return "lightgray";
        });
      
      let upperLabels = this.svg.selectAll('.position_labels')
        .transition()
        .duration(500)
        .text(d => {
          if (this.player[d]) {
            return this.formatComma(this.player[d][this.field])
          }
          return ""
        })
      
      // legend update
      let legend_group = this.svg.select('.legend_group')
      let bins = (this.extent[1] - this.extent[0]) / 5
      let legendBoxes = d3.range(this.extent[0], this.extent[1] + 1, bins)
      let legend = legend_group.selectAll('.legend')
        .transition()
        .duration(500)
        .attr('fill', (d,i) => this.colorScale(legendBoxes[i]))
      
      let legendLabelField = legend_group.selectAll('.legendLabelField')
        .transition()
        .duration(500)
        .text(d => this.field)
      
      let legendLabelEnd = legend_group.selectAll('.legendLabelEnd')
        .transition()
        .duration(500)
        .text(d => this.extent[1])
      
      let legendLabelStart = legend_group.selectAll('.legendLabelStart')
        .transition()
        .duration(500)
        .text(d => this.extent[0])
    },
    initLabels(startRadius, endRadius, labelKeys, labelMaps) {
      let label_positions = {}
      for (let i = 0; i < labelKeys.length; i++) {
        let key = labelKeys[i]
        let current = labelMaps[key]
        let arc = d3.arc()
          .innerRadius(startRadius)
          .outerRadius(endRadius)
          .startAngle(current.start_angle)
          .endAngle(current.end_angle)
        label_positions[key] = {
          'x': arc.centroid()[0],
          'y': arc.centroid()[1]
        }
      }
      return label_positions
    },
    formatComma(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
    }
  },
  components: {
    StatsPanel
  }
};
</script>

<style>
.areas {
  stroke: white;
  stroke-width: 3px;
}
.scaling {
  height: 100%;
  width: 100%
}
</style>