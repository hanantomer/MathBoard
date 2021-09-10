import axios from "axios";

const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

const authType = {
  localToken: "localToken",
  googleToken: "googleToken",
  localPassword: "localPassword",
};

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

function getRequestConfig(token, authType) {
  console.debug(`getRequestConfig:${token},${authType}`);
  return {
    headers: {
      "auth-type": authType,
      authorization: token,
    },
  };
}

export default {
  methods: {
    authGoogleUser: async function (email, token) {
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}`,
          getRequestConfig(token, authType.googleToken)
        );
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByToken: async function (email, token) {
      console.debug(`email:${email}, token:${token}`);
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}`,
          getRequestConfig(token, authType.localToken)
        );
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByPassword: async function (email, password) {
      console.debug(`email:${email}, password:${password}`);
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}&password=${password}`,
          getRequestConfig(null, authType.localPassword)
        );
        return !!res ? res.data : null;
      } catch (error) {
        handleError(error);
      }
    },

    // 1. local login -     validate password and return token
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
