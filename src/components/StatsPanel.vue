<template>
  <div class="justify-center bg-white border-t-2 border-red-200">
    <div class="flex flex-row justify-center">
      <div class="flex-1 m-2 text-xl md:text-4xl capitalize"> {{ playerName }} (2019)</div>
    </div>
    <div class="flex flex-row justify-center m-2 px-4 pb-4">
      <div class="flex-1 px-4 text-xl md:text-3xl font-semibold">{{ yards | formatComma}} <span class="text-xs md:text-sm font-light upper">yds</span></div>
      <div class="flex-1 px-4 text-xl md:text-3xl font-semibold">{{ tds }} <span class="text-xs md:text-sm font-light">tds</span></div>
      <div class="flex-1 px-4 text-xl md:text-3xl font-semibold">{{ ints}} <span class="text-xs md:text-sm font-light">ints</span></div>
      <div class="flex-1 px-4 text-xl md:text-3xl font-semibold">{{ sacks }} <span class="text-xs md:text-sm font-light">sacks</span></div>
      <div class="flex-grow px-4 text-xl md:text-3xl font-semibold">
        <sup>{{ completions }}</sup>/<sub>{{ attempts }}</sub>
        <span class="text-xs md:text-sm font-light"> c/a</span>
      </div>
    </div>
  </div>
</template>

<script>
  /* eslint-disable */
  import Players from "../data/data.json";
  export default {
    props: ['playerName'],
    data() {
      return {
        yards: 0,
        tds: 0,
        ints: 0,
        sacks: 0,
        completions: 0,
        attempts: 0,
        name: 0,
      }
    },
    watch : {
      playerName: {
        handler: function() {
            this.setData();
        },
        immediate: true,
      },
    },
    mounted () {
      this.setData();
    },
    methods: {
      setData() {
        this.yards = parseInt(Players['players'][this.playerName]['sum']['YDS'])
        this.tds = parseInt(Players['players'][this.playerName]['sum']['TD'])
        this.ints = parseInt(Players['players'][this.playerName]['sum']['INT'])
        this.sacks = parseInt(Players['players'][this.playerName]['sum']['SACK'])
        this.completions = parseInt(Players['players'][this.playerName]['sum']['CMP'])
        this.attempts = parseInt(Players['players'][this.playerName]['sum']['ATT'])
        this.name = Players['players'][this.playerName]['first_name'] + ' ' + Players['players'][this.playerName]['last_name']
      }
    },
    filters: {
      formatComma: (x) => {
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");;
      }
    }
  }
</script>