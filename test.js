function test(timer) {
  if (timer) {
    clearInterval(timer);
    timer = null;
    // console.log("qinchu timer");
  }
  // console.log("no timer");
}
let timer1 = setInterval(() => {
  console.log("timer");
}, 1000);
console.log(timer1);
test(timer1);
console.log(timer1);
