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
    getDeputies() {
      if (this.allDeputies.length > 0) return;
      api
        .getDeputies()
        .then((response) => {
          this.allDeputies = response;
        })
        .catch((error) => (this.errors = error));
    },
    getBirthdays() {
      api
        .getBirthdays()
        .then((response) => {
          this.birthdays = response;
        })
        .catch((error) => (this.errors = error));
    },
    getTopics() {
      api
        .getTopics()
        .then((response) => {
          this.allTopics = response;
        })
        .catch((error) => (this.errors = error));
    },
    getParliamentaryGroups() {
      api
        .getGroups()
        .then((response) => {
          this.allParliamentaryGroups = response;
        })
        .catch((error) => (this.errors = error));
    },
    getPlaces(context) {
      api
        .getPlaces()
        .then((response) => {
          this.allPlaces = response;
        })
        .catch((error) => (this.errors = error));
    },
    getStatus() {
      api
        .getStatus()
        .then((response) => {
          this.allStatus = response;
        })
        .catch((error) => (this.errors = error));
    },
    getTypes() {
      api
        .getTypes()
        .then((response) => {
          this.allTypes = response;
        })
        .catch((error) => (this.errors = error));
    },
    getFootprintRange() {
      api
        .getFootprintRange()
        .then((response) => {
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
        })
        .catch((error) => (this.errors = error));
    },
  },
});
