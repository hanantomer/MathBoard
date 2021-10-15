new Promise((resolve, reject) => {
  if (1 + 1 == 2) {
    resolve("succeded", 1);
  } else {
    reject("failed");
  }
})
  .then((message, times) => {
    console.log(`${message}:${times}`);
  })
  .catch((error) => {
    console.log(error);
  });
