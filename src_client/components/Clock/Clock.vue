
<template>
  <div class="digital mt-3 mb-2">
    <p>{{ display }}</p>
  </div>
</template>

<script>
// greetz https://github.com/eddyerburgh/vue-digital-clock/blob/master/Clock.vue
import moment from 'moment';
import dseg from 'dseg/fonts/DSEG7-Modern/DSEG7Modern-Regular.ttf';

module.exports = {
  name: 'Clock',
  props: {
    duration: {
      type: Number,
      default: 0
    }
  },
  data: () => ({
    ticker: null,
    // minutes: 0,
    // hours: 0,
    // seconds: 0,
    blink: true,
  }),
  created() {
    this.ticker = setInterval(this.tick, 1000);
  },
  destroyed() {
    clearInterval(this.ticker);
  },
  computed: {
    // <span class="clock__hour">{{ hours }}</span>
    // <span v-if="seconds % 2 === 0">:</span>
    // <span v-else>&nbsp;</span>
    // <span class="clock__minutes">{{ minutes }}</span>
    // <span v-if="seconds % 2 === 0">:</span>
    // <span>&nbsp;</span>
    // <span class="clock__seconds">{{ seconds }}</span>
    display() {
      //return 'PLACEHOLDER'
      const conditionalColon = this.blink ? ':' : ' ';
      //if (this.duration === null) return `00${conditionalColon}00${conditionalColon}00`;
      return `${this.hours}${conditionalColon}${this.minutes}${conditionalColon}${this.seconds}`;
    },
    hours() {
      return this.padZero(moment.duration(this.duration).hours());
    },
    minutes() {
      return this.padZero(moment.duration(this.duration).minutes());
    },
    seconds() {
      return this.padZero(moment.duration(this.duration).seconds());
    },
  },
  methods: {
    padZero: (number) => {
      if (number < 10) {
        return '0' + number;
      }
      return number;
    },
    tick: function () {
      this.blink = !this.blink;
    }
  }
};
</script>


<style>
  @font-face {
    font-family: "DSEG7";
    src: url(/DSEG7Modern-Regular.ttf) format("truetype")
  }

  .digital {
    flex-grow: 1;
    background-color: rgba(33, 33, 33, 1);
    border-radius: 5px;
    padding: 1em 0 1em 0;
    border-style: inset;
    border-color: rgba(63, 63, 63, 0.3);
  }

  .digital p {
    font-family: 'DSEG7', Verdana, Geneva, sans-serif;
    font-size: 34px;
    margin: 0 0 0 0;
    text-align: center;
    text-shadow: 2px 2px rgba(23, 23, 23, 1)
  }
</style>
