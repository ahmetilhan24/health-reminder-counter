//timer constant for timer
let timerConstant = {
  start: false,
  //Bir insan bilgisayar başında 1 saate 10 dk mola vermelidir
  timeLimit: 10000,
  timeLeft: 10000,
  //per of second
  per: 1000,
  //timer function
  timerInterval: null,
};
const colorLimits = {
  danger: {
    color: "red",
    limit: timerConstant.timeLimit / 4,
  },
  info: {
    color: "orange",
    limit: timerConstant.timeLimit / 2,
  },
};
const svgConstants = {
  //type of miliseconds
  fullDash: 283,
};
//elems(html) of counts
const elems = {
  counterCircle: document.getElementById("counter_path_remaining"),
  startButton: document.getElementById("start_button"),
  pauseButton: document.getElementById("pause_button"),
  resetButton: document.getElementById("reset_button"),
  timeRemainingText: document.getElementById("time_remaining_text"),
  counterRipple: document.getElementById("counter_ripple"),
};

//calculator stroke dash
function calculateTimeFraction() {
  const rawTimeFraction = timerConstant.timeLeft / timerConstant.timeLimit;
  return (
    rawTimeFraction - (1 / timerConstant.timeLimit) * (1 - rawTimeFraction)
  );
}
//update counter circle width
const updateCounterCircle = () => {
  timerConstant.timerInterval = setInterval(() => {
    if (timerConstant.timeLeft > 0) {
      timerConstant.timeLeft = timerConstant.timeLeft - timerConstant.per;
      remainingTimeColor();
      remainingTimeText();
      remainingTimeCircle();
      //set local storage
      setStorage(timerConstant.timeLeft);
    } else {
      resetCounter();
    }
  }, timerConstant.per);
};
// update time circle stroke
const remainingTimeCircle = () => {
  // For circle style
  const circleDasharray = `${(
    calculateTimeFraction() * svgConstants.fullDash
  ).toFixed(0)} ${svgConstants.fullDash}`;
  elems.counterCircle.setAttribute("stroke-dasharray", circleDasharray);
};
//update time circle color
const remainingTimeColor = () => {
  //reset circle width
  elems.counterCircle.setAttribute("stroke-dasharray", svgConstants.fullDash);
  elems.counterCircle.classList.add("green");
  elems.counterCircle.classList.remove("orange", "red");
  elems.counterRipple.classList.remove("orange", "red");
  if (colorLimits.danger.limit > timerConstant.timeLeft) {
    elems.counterCircle.classList.add("red");
    elems.counterRipple.classList.add("red");
  } else if (colorLimits.info.limit > timerConstant.timeLeft) {
    elems.counterRipple.classList.add("orange");
    elems.counterCircle.classList.add("orange");
  }
};

const remainingTimeText = () => {
  let min, sec;
  min = Math.floor(timerConstant.timeLeft / (60 * 1000));
  if (min < 10) {
    min = `0${min}`;
  }
  sec = Math.floor((timerConstant.timeLeft / 1000) % 60);
  if (sec < 10) {
    sec = `0${sec}`;
  }
  elems.timeRemainingText.innerHTML = min + ":" + sec;
};
//reset counter
const resetCounter = () => {
  window.clearInterval(timerConstant.timerInterval);
  //reset updated variables
  timerConstant = {
    start: false,
    timeLimit: 10000,
    timeLeft: 10000,
    //per of second
    per: 1000,
    //timer function
    timerInterval: null,
  };
  resetStorage();
  remainingTimeText();
  remainingTimeColor();
};
// reset storage
const resetStorage = () => {
  chrome.storage.sync.clear();
};
//set local storage
const setStorage = () => {
  // Save it using the Chrome extension storage API.
  chrome.storage.sync.set({
    timeLeft: timerConstant.timeLeft,
    oldDate: new Date().getTime(),
    start: timerConstant.start,
  });
};
const getStorage = () => {
  chrome.storage.sync.get(["timeLeft", "oldDate"], (result) => {
    if (result.oldDate) {
      timerConstant.start = true;
      timerConstant.timeLeft =
        result.timeLeft - (new Date().getTime() - result.oldDate);
      initTimer(timerConstant.timeLeft);
    } else {
      console.log("storage yok");
    }
  });
};
//start timer after click
const startTimer = () => {
  timerConstant.start = true;
  updateCounterCircle();
};
const pauseTimer = () => {
  timerConstant.start = false;
  elems.pauseButton.innerHTML = "Play";
  window.clearInterval(timerConstant.timerInterval);
  setStorage();
};
const playTimer = () => {
  timerConstant.start = true;
  elems.pauseButton.innerHTML = "Pause";
  startTimer();
};
//init timer
const initTimer = () => {
  remainingTimeCircle();
  remainingTimeText();
  remainingTimeColor();
};
//after page loaded
document.addEventListener("DOMContentLoaded", () => {
  getStorage();
});
//after click starter
elems.startButton.addEventListener("click", () => {
  if (!timerConstant.start) {
    startTimer();
  }
});
//stop timer
elems.pauseButton.addEventListener("click", () => {
  if (timerConstant.start) {
    pauseTimer();
  } else {
    playTimer();
  }
});
