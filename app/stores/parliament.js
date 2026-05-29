import { defineStore } from "pinia";
import api from "@/api";

export const useParliamentStore = defineStore("parliament", {
  state: () => {
    return {
      allTopics: [],
      allDeputies: [],
      allParliamentaryGroups: [],
      allTypes: [],
      allStatus: [],
      allPlaces: [],
      birthdays: [],
      footprintRange: [],
      footprintParliamentaryGroupRange: {
        max: null,
        min: null,
      },
      footprintDeputyRange: {
        max: null,
        min: null,
      },
    };
  },
  getters: {
    getAllDeputiesName(state) {
      return state.allDeputies.map((deputy) => deputy.name);
    },
    getAllPlacesName(state) {
      return state.allPlaces.map((place) => place.name);
    },
    getAllParliamentaryGroups(state) {
      return state.allParliamentaryGroups;
    },
    getAllParliamentaryGroupsWithGoverment(state) {
      return ["Gobierno"].concat(state.allParliamentaryGroups);
    },
    getDeputyByName(state) {
      return (name) =>
        state.allDeputies.find((deputy) => {
          return deputy.name === name;
        });
    },
    getDeputiesByParliamentaryGroup(state) {
      return (parliamentarygroup) =>
        state.allDeputies.filter((deputy) => {
          return deputy.parliamentarygroup === parliamentarygroup;
        });
    },
    getParliamentaryGroupByName(state) {
      return (name) =>
        state.allParliamentaryGroups.find((group) => {
          return group.name === name;
        });
    },
    getAllTypesName(state) {
      return state.allTypes.map((type) => type.name);
    },
  },
  actions: {
    async getDeputies() {
      const data = await api.getDeputies();
      this.allDeputies = data;
      return data;
    },
    async getBirthdays() {
      const data = await api.getBirthdays();
      this.birthdays = data;
      return data;
    },
    async getTopics() {
      const data = await api.getTopics();
      this.allTopics = data;
      return data;
    },
    async getParliamentaryGroups() {
      const data = await api.getGroups();
      this.allParliamentaryGroups = data;
      return data;
    },
    async getPlaces() {
      const data = await api.getPlaces();
      this.allPlaces = data;
      return data;
    },
    async getStatus() {
      const data = await api.getStatus();
      this.allStatus = data;
      return data;
    },
    async getTypes() {
      const data = await api.getTypes();
      this.allTypes = data;
      return data;
    },
    async getFootprintRange() {
      const response = await api.getFootprintRange();
      this.footprintRange = response;
      const maxScores = response.reduce(
        (acc, item) => {
          if (!item.name.startsWith("ODS")) {
            if (item.deputy.score > acc.maxDeputyScore) {
              acc.maxDeputyScore = item.deputy.score;
            }
            if (
              item.parliamentarygroup.score > acc.maxParliamentaryGroupScore
            ) {
              acc.maxParliamentaryGroupScore =
                item.parliamentarygroup.score;
            }
          }
          return acc;
        },
        { maxDeputyScore: 0, maxParliamentaryGroupScore: 0 }
      );
      const minScores = response.reduce(
        (acc, item) => {
          if (!item.name.startsWith("ODS")) {
            if (item.deputy.score < acc.minDeputyScore) {
              acc.minDeputyScore = item.deputy.score;
            }
            if (
              item.parliamentarygroup.score < acc.minParliamentaryGroupScore
            ) {
              acc.minParliamentaryGroupScore =
                item.parliamentarygroup.score;
            }
          }
          return acc;
        },
        { minDeputyScore: 0, minParliamentaryGroupScore: 0 }
      );
      this.footprintDeputyRange = {
        max: maxScores.maxDeputyScore,
        min: minScores.minDeputyScore,
      };
      this.footprintParliamentaryGroupRange = {
        max: maxScores.maxParliamentaryGroupScore,
        min: minScores.minParliamentaryGroupScore,
      };
      return response;
    },
  },
});
