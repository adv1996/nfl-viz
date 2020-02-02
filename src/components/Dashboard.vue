<template>
  <div>
    <div class="text-center text-3xl bg-gray-200 py-2">
      NFL Down and Distance Heatmap
    </div>
    <div>
      <div class="m-1 px-1 py-2 text-center flex flex-col md:flex-row shadow-lg">
        <div class="flex-1 px-2 py-1">
          <v-select @input="setSelected" class="dropdownText" :value="active_field" placeholder="Fields" label="field" :options="controlOptions"></v-select>
        </div>
        <div class="flex-1 px-2 py-1">
          <v-select class="dropdownText capitalize" @input="setSelectedPlayerOne" :value="active_player_one" placeholder="Player 1" label="displayName" :options="playerList"></v-select>
        </div>
        <div class="flex-1 px-2 py-1">
          <v-select class="dropdownText capitalize" @input="setSelectedPlayerTwo" :value="active_player_two" placeholder="Player 2" label="displayName" :options="playerList"></v-select>
        </div>
      </div>
    </div>
    <div class="flex flex-col md:flex-row px-1">
      <!-- convert these to v-fors -->
      <div class="md:flex-1 text-gray-700 text-center bg-white m-1 rounded-b shadow-lg">
        <heat-map player_id="player1" :playerName="active_player_one.key" :extent="extent" :field="active_field.field"/>
      </div>
      <div class="md:flex-1 text-gray-700 text-center bg-white m-1 rounded-b shadow-lg">
        <heat-map player_id="player2" :playerName="active_player_two.key" :extent="extent" :field="active_field.field"/>
      </div>
    </div>
    <div class="flex justify-center px-1 py-2 bg-gray-300">
      <div class="text-gray-700 text-center m-1">
        <button class="bg-blue-100 px-2 link">
          <a class="text-blue-400" href="https://github.com/adv1996/nfl-viz">Code</a>
        </button>
      </div>
      <div class="text-gray-700 text-center m-1">
        <button class="bg-blue-100 px-2">
          <a class="text-blue-400 link" href="https://www.advaithv.com/">Developed by Advaith Venkatakrishnan</a>
        </button>
      </div>
    </div>
    <div class="text-xs text-gray-700 bg-gray-300 text-center mb-2">
      - Data from QB Passing Splits on ESPN in 2019 Regular Season
    </div>
  </div>
</template>

<script>
/* eslint-disable */
import HeatMap from "./Heatmap.vue";
import Players from "../data/data.json";
import * as d3 from "d3";

export default {
  name: "Dashboard",
  data() {
    return {
      controlOptions: [
        {
          field: "CMP",
        },
        {
          field: "ATT",
        },
        {
          field: "YDS",
        },
        {
          field: "CMP%",
          extent: [0, 100]
        },
        {
          field: "AVG",
        },
        {
          field: "TD",
        },
        {
          field: "INT",
        },
        {
          field: "SACK",
        },
        {
          field: "RTG",
        }
      ],
      extent: [50, 100],
      active_field: {
        field: "CMP%"
      },
      dropdownOpen: false,
      playerList: [],
      playerOneMenu: false,
      active_player_one: {
        'firstName': "patrick",
        'lastName': "mahomes",
        'displayName': "Patrick Mahomes",
        'key': "patrick-mahomes"
      },
      active_player_two: {
        'firstName': "jimmy",
        'lastName': "garoppolo",
        'displayName': "Jimmy Garoppolo",
        'key': "jimmy-garoppolo"
      }
    };
  },
  mounted () {
    this.setExtent(this.active_field)
    this.setPlayers();
  },
  methods: {
    setSelected(value) {
      if (value) {
        this.active_field = value
        this.setExtent(value)
        // this.extent = [Players['aggregrate']['min'][value.field], Players['aggregrate']['max'][value.field]]
        // if (value.extent) {
        //   this.extent = value.extent
        // }
      }
    },
    setExtent(value) {
      let min = [Players['players'][this.active_player_one.key]['min'][value.field], Players['players'][this.active_player_two.key]['min'][value.field]]
      let max = [Players['players'][this.active_player_one.key]['max'][value.field], Players['players'][this.active_player_two.key]['max'][value.field]]
      this.extent = [d3.min(min), d3.max(max)]
    },
    setSelectedPlayerOne(value) {
      if (value) {
        this.setExtent(this.active_field)
        this.active_player_one = value
      }
    },
    setSelectedPlayerTwo(value) {
      if (value) {
        this.setExtent(this.active_field)
        this.active_player_two = value
      }
    },
    setPlayers() {
      let playerKeys = Object.keys(Players['players'])
      this.playerList = _.orderBy(_.map(playerKeys, (pk) => {
        let firstName = Players['players'][pk]['first_name']
        let lastName = Players['players'][pk]['last_name']
        let displayName = firstName + ' ' + lastName
        return {
          'firstName': firstName,
          'lastName': lastName,
          'displayName': displayName,
          'key': pk
        }
      }), ['displayName'], ['asc'])

    }
  },
  components: {
    HeatMap
  }
};
</script>

<style>
.active {
  background: #feb2b2
}
.dropdown:hover .dropdown-menu {
  display: block;
}
.dropdownText {
  font-size: 16px;
}
.link {
  text-decoration: underline;
}
</style>