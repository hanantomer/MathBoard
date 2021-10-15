let p = new Promise((resolve, reject) => {
  let a = 1 + 1;
  if (a == 2) {
    resolve("succeded");
  } else {
    reject("failed");
  }
});

p.then((message) => {
    console.log(message);
}).catch((error) => {
    console.log(error);
})