const MAX_WORKING_HOURS = 8.5;
const GAP_TIME = 300;

console.log("Keka extension content script loaded!");

function minutesPassedSince(timeStr) {
  // Example timeStr: "2:24 PM"

  const now = new Date();

  // Parse input time
  const [time, modifier] = timeStr.split(" ");
  let [hours, minutes] = time.split(":").map(Number);

  // Convert to 24-hour format
  if (modifier === "PM" && hours !== 12) hours += 12;
  if (modifier === "AM" && hours === 12) hours = 0;

  // Create date for the given time today
  const givenTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    hours,
    minutes,
    0
  );

  // If time is in the future, assume it was yesterday
  if (givenTime > now) {
    givenTime.setDate(givenTime.getDate() - 1);
  }

  // Difference in minutes
  const diffMs = now - givenTime;
  return Math.floor(diffMs / 60000);
}

function timeAfterAddingMinutes(minutesToAdd) {
  const now = new Date();

  // Add minutes
  const futureTime = new Date(now.getTime() + minutesToAdd * 60000);

  let hours = futureTime.getHours();
  const minutes = futureTime.getMinutes();

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert to 12-hour format

  const formattedMinutes = String(minutes).padStart(2, "0");

  return `${hours}:${formattedMinutes} ${ampm}`;
}

let isPopupOpen = false;
let isValueCalculated = false;

function checkAttendanceLogs() {
  // Create a small indicator element

  const attendanceRow = document.getElementsByClassName(
    "attendance-logs-row"
  )[0];

  if (attendanceRow) {
    console.log("Attendance log found");
    const attLogs = attendanceRow.children[0].children;
    const timeContainer = attLogs[1].children[0].children[1].children[1];
    const time = timeContainer.getElementsByTagName("span")[0];
    const timeString = time.textContent;
    const timeParts = timeString.split(" ");
    const effectiveHr = parseInt(timeParts[0]);
    const effectiveMin = parseInt(timeParts[1]);

    setTimeout(() => {
      if (!isPopupOpen || !isValueCalculated) {
        time.click();
        isPopupOpen = true;
      }
      if (
        attendanceRow &&
        attendanceRow.classList.contains("dropdown") &&
        attendanceRow.classList.contains("attendance-logs-row")
      ) {
        // Element has both classes
        const dropDown = attendanceRow.children[1].children[0];
        if (dropDown?.children) {
          const label = dropDown.children[1].getElementsByTagName("label")[0];
          if (label) {
            const timeLogsContainer = label.parentElement;
            if (timeLogsContainer) {
              const timeLogs = timeLogsContainer.children[1];
              let punchedTimeString = "";
              if (timeLogs) {
                const timeLog = timeLogs.children;
                const lastTimeLogRow = timeLog[timeLog.length - 1];
                let exitMissing = false;
                let lastLoggedHr = 0;
                let lastLoggedMin = 0;
                if (lastTimeLogRow) {
                  const timeLogText = lastTimeLogRow.children;
                  exitMissing =
                    timeLogText[1].textContent?.trim() === "MISSING";
                  if (exitMissing) {
                    punchedTimeString = timeLogText[0].textContent?.trim();
                  } else {
                    punchedTimeString = timeLogText[1].textContent?.trim();
                  }

                  lastLoggedHr = parseInt(punchedTimeString.split(":")[0]);
                  lastLoggedMin = parseInt(punchedTimeString.split(":")[1]);
                }

                let totalEffectiveInMinutes = effectiveHr * 60 + effectiveMin;
                const isAM = punchedTimeString.includes("AM");
                if (exitMissing) {
                  const timeDifferenceInMinutes = minutesPassedSince(
                    `${lastLoggedHr}:${lastLoggedMin} ${isAM ? "AM" : "PM"}`
                  );
                  console.log(
                    "timeDifferenceInMinutes",
                    timeDifferenceInMinutes,
                    isAM
                  );
                  totalEffectiveInMinutes =
                    totalEffectiveInMinutes + timeDifferenceInMinutes;
                }

                const remainingMinutes =
                  MAX_WORKING_HOURS * 60 - totalEffectiveInMinutes;

                const remainingHr = Math.floor(remainingMinutes / 60);
                const remainingMin = remainingMinutes % 60;
                const timeElementExists = document.querySelector(
                  ".time-after-adding-minutes"
                );
                const remainingTimeElementExists =
                  document.querySelector(".remaining-time");
                if (remainingMinutes > 0) {
                  const timeAfterAddingMinutesString =
                    timeAfterAddingMinutes(remainingMinutes);
                  if (!timeElementExists) {
                    const timeAfterAddingMinutesElement =
                      document.createElement("div");
                    timeAfterAddingMinutesElement.className =
                      "time-after-adding-minutes";
                    timeAfterAddingMinutesElement.textContent =
                      timeAfterAddingMinutesString;
                    timeAfterAddingMinutesElement.style.color = "green";
                    timeAfterAddingMinutesElement.style.padding = "0px 5px";
                    timeAfterAddingMinutesElement.style.fontWeight = "bold";
                    timeContainer.insertAdjacentElement(
                      "afterend",
                      timeAfterAddingMinutesElement
                    );
                  } else {
                    timeElementExists.textContent =
                      timeAfterAddingMinutesString;
                  }

                  if (!remainingTimeElementExists) {
                    const remainingTimeElement = document.createElement("div");
                    remainingTimeElement.className = "remaining-time";
                    remainingTimeElement.textContent = `${remainingHr}h ${remainingMin}m`;
                    remainingTimeElement.style.color = "red";
                    remainingTimeElement.style.padding = "0px 5px";
                    remainingTimeElement.style.fontWeight = "bold";
                    timeContainer.insertAdjacentElement(
                      "afterend",
                      remainingTimeElement
                    );
                  } else {
                    remainingTimeElementExists.textContent = `${remainingHr}h ${remainingMin}m`;
                  }
                } else {
                  if (timeElementExists) {
                    timeElementExists.remove();
                  }
                  if (remainingTimeElementExists) {
                    remainingTimeElementExists.remove();
                  }
                  const doneElementExists = document.querySelector(".done");
                  if (!doneElementExists) {
                    const doneElement = document.createElement("div");
                    doneElement.className = "done";
                    doneElement.textContent = "Completed";
                    doneElement.style.color = "green";
                    doneElement.style.padding = "0px 5px";
                    doneElement.style.fontWeight = "bold";
                    timeContainer.insertAdjacentElement(
                      "afterend",
                      doneElement
                    );
                  } else {
                    doneElementExists.textContent = "Completed";
                  }
                }
              }
            }
          }
        }
      }
    }, 1000);

    setTimeout(() => {
      if (!isValueCalculated) {
        time.click();
        isValueCalculated = true;
      }
    }, 2000);
  } else {
    console.log("Attendance log not found");
  }
}

function throttle(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

const throttledCheckAttendanceLogs = throttle(checkAttendanceLogs, GAP_TIME);

const observer = new MutationObserver(() => {
  throttledCheckAttendanceLogs();
});

observer.observe(document.body, {
  childList: true,
  subtree: true,
});

// Optionally, run the check once initially
throttledCheckAttendanceLogs();
