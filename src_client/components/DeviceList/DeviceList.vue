<template>
<div>
  <v-container class="pa-0 pt-3">
    <v-card>
      <v-card-title>
        <h3 class="headline mb-0" id="existing-devices-header">Existing D3VICES</h3>
      </v-card-title>
      <doom-alert v-if="devices.length < 1" level="warning">
        There are no D3VICES. Please ceate a D3VICE below.
      </doom-alert>
      <v-list>
        <v-list-tile v-for="d in devices" :key="d._id" :id="d._id" avatar>

          <v-list-tile-avatar>
            <img :src="deviceImage">
          </v-list-tile-avatar>

          <v-list-tile-content>
            <v-list-tile-title>{{ d.did }}</v-list-tile-title>
            <v-list-tile-sub-title>{{ d.description ? d.description : d._id }}</v-list-tile-sub-title>
          </v-list-tile-content>

          <v-list-tile-action>
            <v-layout row>
              <v-btn color="orange" :to="linkToDevice(d)">
                <v-icon>send</v-icon>Select
              </v-btn>
            </v-layout>
          </v-list-tile-action>

        </v-list-tile>
      </v-list>
    </v-card>
  </v-container>
  <v-container class="pa-0">
    <create-device :devices="devices"></create-device>
  </v-container>
</div>
</template>

<script>
import Device from '@/components/Device/Device.vue';
import CreateDevice from '@/components/CreateDevice/CreateDevice';
import DoomAlert from '@/components/DoomAlert/DoomAlert';
import {
  mapActions,
  mapGetters
} from 'vuex';
import di from '@/assets/futuristic_ammo_box_01.png';

export default {
  name: 'GameList',
  components: {
    Device,
    CreateDevice,
    DoomAlert,
  },
  data() {
    return {
      placeholder: 'PLACEHOLDER',
      test: 'hi'
    }
  },
  props: {

  },
  computed: {
    ...mapGetters('devices', {
      findDevicesInStore: 'find'
    }),
    devices() {
      return this.findDevicesInStore({
        query: {
          $sort: {
            createdAt: 1
          }
        }
      }).data
    },
    deviceImage: () => di,
  },
  methods: {
    ...mapActions('devices', {
      removeDevice: 'remove',
      findDevices: 'find'
    }),
    // gameModeDisplay: function (game) {
    //   return R.cond([
    //     [R.equals('sectorControl'), R.always('Sector Control')],
    //     [R.equals('domination'), R.always('Domination')],
    //     [R.equals('cs'), R.always('Counter-Strike')],
    //     [R.either(R.isEmpty(), R.isNil()), R.always('Sector Control')],
    //   ])(game.gameMode);
    // },
    linkToDevice: function(d) {
      return `/device/${d._id}`
    },
  },
  created() {
    this.findDevices();
  }
}
</script>

<style></style>
