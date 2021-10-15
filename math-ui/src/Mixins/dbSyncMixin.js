const axios = require("axios");
const authMixin = require("./authMixin");
const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

axiosInstnce.interceptors.request.use(function (config) {
  const isOAuth =
    gapi.auth2.getAuthInstance().currentUser != null &&
    gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();

  const token = isOAuth
    ? `Bearer ${
        gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
          .id_token
      }`
    : this.$cookies.get("token") != null && this.$cookies.get("token") != "null"
    ? this.$cookies.get("token")
    : null;

  if (token != null) {
    config.headers.Authorization = token;
  }

  return config;
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

module.exports = {
  methods: {
    getUserByToken: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    authGoogleUser: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(res);
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByToken: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByPassword: async function (email, password) {
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}&password=${password}`
        );
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    registerUser: async function (user) {
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
      console.log(user);
      try {
        return axiosInstnce.get("/exercises?UserId=" + user.id);
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
