const axios = require("axios");
const axiosInstnce = axios.create({
  baseURL: "http://localhost:8081",
});

axiosInstnce.interceptors.request.use(function (config) {
  const isOAuth =
    gapi.auth2.getAuthInstance() != null &&
    gapi.auth2.getAuthInstance().currentUser != null &&
    gapi.auth2.getAuthInstance().currentUser.get().isSignedIn();

  const access_token = isOAuth
    ? `Bearer ${
        gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse()
          .id_token
      }`
    : window.$cookies.get("access_token") != null &&
      window.$cookies.get("access_token") != "null" &&
      window.$cookies.get("access_token") != "undefined"
    ? window.$cookies.get("access_token")
    : null;

  if (access_token != null) {
    console.debug(`sending access_token:${access_token}`);
    config.headers.authentication = access_token;
  }
  access_token;

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

async function getSymbolByCoordinates(row, col) {
  try {
    let res = await axiosInstnce.get("/symbols?row=" + row + "&col=" + col);
    return !!res ? res.data[0] : null;
  } catch (error) {
    handleError(error);
  }
}
async function getFractionByCoordinates(row, col) {
  try {
    let res = await axiosInstnce.get("/fractions?row=" + row + "&col=" + col);
    return !!res ? res.data[0] : null;
  } catch (error) {
    handleError(error);
  }
}

module.exports = {
  methods: {
    createAccessLink: async function (exerciseId, link) {
      try {
        let res = await axiosInstnce.post("/accessLink", {
          ExerciseId: exerciseId,
          link: link,
        });
        return res.data;
      } catch (error) {
        handleError(error);
      }
    },
    authGoogleUser: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authGoogleUser:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByToken: async function () {
      try {
        let res = await axiosInstnce.get("/users");
        console.debug(`authLocalUserByToken:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    authLocalUserByPassword: async function (email, password) {
      try {
        let res = await axiosInstnce.get(
          `/users?email=${email}&password=${password}`
        );
        console.debug(`authLocalUserByPassword:${JSON.stringify(res)}`);
        return !!res ? res.data[0] : null;
      } catch (error) {
        handleError(error);
      }
    },
    registerUser: async function (user) {
      try {
        await axiosInstnce.post("/users", user);
        console.debug(`registerUser:${JSON.stringify(user)}`);
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
    updateSymbolCoordinates: async function (symbol) {
      res = await axiosInstnce.put("/symbols/" + symbol.id, symbol);
      return res ? res.data : null;
    },
    saveSymbol: async function (symbol) {
      let symbolAtCoordinates = await getSymbolByCoordinates(
        symbol.row,
        symbol.col
      );

      let res = null;
      if (!!symbolAtCoordinates) {
        res = await axiosInstnce.put(
          "/symbols/" + symbolAtCoordinates.id,
          symbol
        );
      } else {
        res = await axiosInstnce.post("/symbols", symbol);
      }

      return res ? res.data : null;
    },
    removeSymbol: async function (symbol) {
      try {
        axiosInstnce.delete("/symbols/" + symbol.id);
      } catch (error) {
        handleError(error);
      }
    },
    getExercise: async function (exerciseId) {
      try {
        let res = await axiosInstnce.get("/exercises?id=" + exerciseId);
        return !!res ? res.data[0] : null;
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
    getAllSymbols: async function (exerciseId) {
      try {
        let res = await axiosInstnce.get("/symbols?exerciseId=" + exerciseId);
        return res.data;
      } catch (error) {
        handleError(error);
      }
    },
    getAllFractions: async function (exerciseId) {
      try {
        let res = await axiosInstnce.get("/fractions?exerciseId=" + exerciseId);
        return res.data;
      } catch (error) {
        handleError(error);
      }
    },

    saveFraction: async function (fraction) {
      let fractionAtCoordinates = await getFractionByCoordinates(
        fraction.row,
        fraction.col
      );

      let res = null;
      if (!!fractionAtCoordinates) {
        res = await axiosInstnce.put(
          "/fractions/" + fractionAtCoordinates.id,
          fraction
        );
      } else {
        res = await axiosInstnce.post("/fractions", fraction);
      }

      return res ? res.data : null;
    },
  },
};
