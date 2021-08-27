import axios from "axios";

const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

function handleError(error) {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.log(error.response.data);
    console.log(error.response.status);
    console.log(error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.log(error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.log("Error", error.message);
  }
  console.log(error.config);
}

function buildQueryString(user) {
  return Object.keys(user)
    .filter((key) => !!user[key])
    .map((key) => key + "=" + encodeURIComponent(user[key]))
    .join("&");
}

export default {
  methods: {
    getUser: async function (user) {
      try {
        let users = await axiosInstnce.get("/users?" + buildQueryString(user));
        return userList ? users.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    // 1. local login - validate password and return token
    // 2. local registration - submit user and return token
    setUser: async function (user) {
      try {
        user = await axiosInstnce.post("/users", user);
        return user.data;
      } catch (error) {
        handleError(error);
      }
    },
    addExercise: async function (exercise) {
      try {
        return axiosInstnce.post("/exercises", exercise);
      } catch (error) {
        handleError(error);
      }
    },
    addSymbol: async function (symbol) {
      let newSymbol = symbol;
      newSymbol.type = "NUMBER";
      newSymbol = (await axiosInstnce.post("/symbols", newSymbol)).data;

      let newSymbolValue = newSymbol;
      newSymbolValue.value = symbol.value;
      newSymbolValue.SymbolId = newSymbol.id;
      delete newSymbolValue.id; // to allow persisting

      newSymbolValue = (
        await axiosInstnce.post("/numbersymbols", newSymbolValue)
      ).data;

      return Object.assign(newSymbolValue, newSymbol);
    },
    removeSymbol: async function (symbolId) {
      try {
        return axiosInstnce.delete("/symbols/" + symbolId);
      } catch (error) {
        handleError(error);
      }
    },
    updateNotation: async function (notation) {
      try {
        return axiosInstnce.put("/symbols/" + notation.id, notation);
      } catch (error) {
        handleError(error);
      }
    },
    getAllExercises: async function (user) {
      try {
        return axiosInstnce.get("/exercises?UserId=" + user);
      } catch (error) {
        handleError(error);
      }
    },
    getAllNotations: async function (exerciseId) {
      try {
        let symbols = await axiosInstnce.get(
          "/symbols?exerciseId=" + exerciseId
        );

        let notations = [];
        let i = null;
        for (i in symbols.data) {
          let symbol = symbols.data[i];
          let symbolValue = null;

          switch (symbol.type) {
            case "NUMBER": {
              symbolValue = (
                await axiosInstnce.get("/numberSymbols?SymbolId=" + symbol.id)
              ).data[0];
              break;
            }
            case "SIGN": {
              symbolValue = (
                await axiosInstnce.get("/signSymbols?SymbolId=" + symbol.id)
              ).data[0];
              break;
            }
          }
          notations.push(Object.assign(symbolValue, symbol));
        }
        return notations.sort((a, b) => {
          return a.position > b.position ? 1 : a.position < b.position ? -1 : 0;
        });
      } catch (error) {
        handleError(error);
      }
    },
  },
};
