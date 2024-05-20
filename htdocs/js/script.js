//global vars
var masterIntervalData = {};
var courseInfo = {};
var squareState = {};
var engagementState = { "lecture-high": false, "lecture-medium": false, "lecture-low": false };
var engagementType = { "lecture-option-engage": false, "group-option-engage": false, "other-option-engage": false };
var notes = '';
var intervalCountdown;
var nextInterval = false;
var clicked = false;
var sessionID = '';
currentIntervalNumber = 0;

//uncomment this function to skip data entry (for quick testing)
async function test() {

//   document.getElementById('first-step').style.textDecoration = 'none';
//   document.getElementById('second-step').style.textDecoration = 'none';
//   document.getElementById('third-step').style.textDecoration = 'underline';

//   document.getElementById('questionContainer').style.display = 'none';
//   document.getElementById('nextQuestionsContainer').style.display = 'none';
//   document.getElementById('thirdQuestionsContainer').style.display = 'flex';

//   courseInfo = {
//     courseCode: 'testCode123',
//     date: '12/3/12',
//     instructor: 'test instructor',
//     classLength: 30,
//     intervalLength: 30,
//     classType: 'test type',
//     isGroupworkInvolved: false,
//     howManyTables: null,
//     peoplePerTable: null,
//     interactions: null
//   };

//   await startSession();
//   console.log('session done');
//   await sendSessionToDatabase();
//   console.log("sending to DB done");
//   window.location.href = `/results.html?sessionId=${sessionID}`;
// 
}

function getUrlParameter(name) {
  name = name.replace(/[[]/, '\\[').replace(/[\]]/, '\\]');
  var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
  var results = regex.exec(location.search);
  return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

function loadResults(raw) {
  var sessionId = getUrlParameter('sessionId');
  sessionID = sessionId;
  var results = '';

  if (sessionId != '') {
    fetch(`/sessions/${sessionId}`)
      .then(response => response.json())
      .then(sessionData => {
        results = JSON.stringify(sessionData);
        if (raw) {
          getRawResults(results);
        } else {
          displayResults(results);
        }

      })
      .catch(error => {
        console.error('Error fetching session data:', error);
      });
  }
}

function displayResults(data) {
  highCount = 0;
  medCount = 0;
  lowCount = 0;
  const sessionData = JSON.parse(data);

  console.log(sessionData);

  const courseInfo = sessionData['Course Information'];

  console.log("here: " + courseInfo.classType);


  // Update course details in the HTML
  document.querySelector('.course-box:nth-of-type(1) p:nth-of-type(1)').innerHTML += courseInfo.date;
  document.querySelector('.course-box:nth-of-type(1) p:nth-of-type(2)').innerHTML += courseInfo.courseCode;
  document.querySelector('.course-box:nth-of-type(1) p:nth-of-type(3)').innerHTML += courseInfo.classLength + " minutes";
  document.querySelector('.course-box:nth-of-type(1) p:nth-of-type(4)').innerHTML += courseInfo.classType;
  document.querySelector('.course-box:nth-of-type(1) p:nth-of-type(5)').innerHTML += courseInfo.instructor;

  document.querySelector('.course-box:nth-of-type(2) p:nth-of-type(1)').innerHTML += courseInfo.intervalLength + " minutes";
  document.querySelector('.course-box:nth-of-type(2) p:nth-of-type(2)').innerHTML += courseInfo.isGroupworkInvolved ? 'Yes' : 'No';
  if (courseInfo.isGroupworkInvolved) {
    document.querySelector('.course-box:nth-of-type(2) p:nth-of-type(3)').innerHTML += courseInfo.howManyTables;
    document.querySelector('.course-box:nth-of-type(2) p:nth-of-type(4)').innerHTML += courseInfo.peoplePerTable;
    document.querySelector('.course-box:nth-of-type(2) p:nth-of-type(5)').innerHTML += courseInfo.interactions;

  }

  const intervals = Object.keys(sessionData).filter(key => key.startsWith('Interval:'));

  // Count the occurrences of each code for squares 1-15 (student) and squares 15+ (instructor)
  const codeCounts1To15 = {};
  const codeCounts15Plus = {};
  intervals.forEach(interval => {
    const squareState = sessionData[interval].squareState;
    const engage = sessionData[interval].engagementState;

    if (Object.values(engage)[0] == true) {
      highCount += 1;
    }
    if (Object.values(engage)[1] == true) {
      medCount += 1;
    }
    if (Object.values(engage)[2] == true) {
      lowCount += 1;
    }

    console.log("here:" + Object.values(engage)[0]);
    const keys = Object.keys(squareState);

    // Loop through each key in squareState
    keys.forEach(key => {
      // Extract the square number from the key
      const squareNumber = parseInt(key.match(/\d+/)[0]);
      const code = squareState[key];

      if (squareNumber != 50) {
        if (squareNumber <= 15) {
          if (codeCounts1To15.hasOwnProperty(code)) {
            codeCounts1To15[code]++;
          } else {
            codeCounts1To15[code] = 1;
          }
        } else {
          if (codeCounts15Plus.hasOwnProperty(code)) {
            codeCounts15Plus[code]++;
          } else {
            codeCounts15Plus[code] = 1;
          }
        }
      }

    });
  });

  console.log(highCount);
  console.log(medCount);
  console.log(lowCount);

  highest = Math.max(highCount, medCount, lowCount);

  highestString = '';

  if (highest == highCount) {
    highestString = "High";
  }
  if (highest == medCount) {
    highestString = "Medium";
  }
  if (highest == lowCount) {
    highestString = "Low";
  }

  // Extract code labels and counts for squares 1-15 (student)
  const labels1To15 = Object.keys(codeCounts1To15);
  console.log("labels 1 to 15 keys: " + labels1To15);
  const counts1To15 = Object.values(codeCounts1To15);
  console.log("labels 1 to 15 vals: " + counts1To15);

  // Extract code labels and counts for squares 15+ (instructor)
  const labels15Plus = Object.keys(codeCounts15Plus);
  console.log("labels 1 to 15 keys: " + labels15Plus);
  const counts15Plus = Object.values(codeCounts15Plus);
  console.log("labels 1 to 15 keys: " + counts15Plus);

  // Generate random colors for the chart slices
  const colors1To15 = labels1To15.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16));
  const colors15Plus = labels15Plus.map(() => '#' + Math.floor(Math.random() * 16777215).toString(16));



  document.querySelector('#student-result p:nth-of-type(1)').innerHTML += labels1To15.length;
  document.querySelector('#student-result p:nth-of-type(2)').innerHTML += highestString;
  document.querySelector('#student-result p:nth-of-type(3)').innerHTML += findMostCommonCode(labels1To15, counts1To15);

  // Update instructor results in the HTML
  document.querySelector('#instructor-result p:nth-of-type(1)').innerHTML += labels15Plus.length;
  document.querySelector('#instructor-result p:nth-of-type(2)').innerHTML += findMostCommonCode(labels15Plus, counts15Plus);;




  // Render the first pie chart for squares 1-15
  const ctx1To15 = document.getElementById('pieChart').getContext('2d');
  const chart1To15 = new Chart(ctx1To15, {
    type: 'pie',
    data: {
      labels: labels1To15,
      datasets: [{
        data: counts1To15,
        backgroundColor: colors1To15
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Student Codes', // Title text
          font: {
            size: 18 
          }
        }
      }
    }
  });

  // Render the second pie chart for squares 15+
  const ctx15Plus = document.getElementById('pieChartInstructor').getContext('2d');
  const chart15Plus = new Chart(ctx15Plus, {
    type: 'pie',
    data: {
      labels: labels15Plus,
      datasets: [{
        data: counts15Plus,
        backgroundColor: colors15Plus
      }]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Instructor Codes', // Title text
          font: {
            size: 18 // Adjust font size as needed
          }
        }
      }
    }
  });
  displayGraph(sessionData);
}

function findMostCommonCode(labels, counts) {
  let maxCount = 0;
  let mostCommonCode = '';

  // Iterate through the counts to find the code with the highest count
  for (let i = 0; i < counts.length; i++) {
    if (counts[i] > maxCount) {
      maxCount = counts[i];
      mostCommonCode = labels[i];
    }
  }

  return mostCommonCode;
}

function displayGraph(sessionData) {
  const intervals = Object.keys(sessionData).filter(key => key.startsWith('Interval:'));

  // Extract lecture engagement data
  const lectureHigh = intervals.map(interval => sessionData[interval].engagementState['lecture-high'] ? 'High' : null);
  const lectureMedium = intervals.map(interval => sessionData[interval].engagementState['lecture-medium'] ? 'Medium' : null);
  const lectureLow = intervals.map(interval => sessionData[interval].engagementState['lecture-low'] ? 'Low' : null);


  const labels = intervals.map((_, index) => `Interval ${index + 1}`);

  const ctx = document.getElementById('engagement-graph').getContext('2d');
  const chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        {
          label: 'High',
          data: lectureHigh.map((value, index) => ({ x: index, y: value === 'High' ? 3 : 0 })),
          backgroundColor: 'rgba(255, 99, 132, 0.5)', // Red color for lecture high engagement
        },
        {
          label: 'Medium',
          data: lectureMedium.map((value, index) => ({ x: index, y: value === 'Medium' ? 2 : 0 })),
          backgroundColor: 'rgba(255, 159, 64, 0.5)', // Orange color for lecture medium engagement
        },
        {
          label: 'Low',
          data: lectureLow.map((value, index) => ({ x: index, y: value === 'Low' ? 1 : 0 })),
          backgroundColor: 'rgba(255, 205, 86, 0.5)', // Yellow color for lecture low engagement
        }
      ]
    },
    options: {
      plugins: {
        title: {
          display: true,
          text: 'Class Engagement Levels',
          font: {
            size: 18
          }
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Intervals'
          }
        },
        y: {
          title: {
            display: true,
            text: 'Engagement Level'
          },
          ticks: {
            stepSize: 1,
            min: 0,
            max: 3,
            callback: value => {
              switch (value) {
                case 0:
                  return 'None';
                case 1:
                  return 'Low';
                case 2:
                  return 'Medium';
                case 3:
                  return 'High';
                default:
                  return '';
              }
            }
          }
        }
      }
    }

  });
}

function calculateAverageEngagement(engagementState) {
  console.log("eg keys: " + Object.keys(engagementState));
  console.log("eg values: " + Object.values(engagementState));
  const engagementValues = Object.values(engagementState);

  const highCount = engagementValues.filter(val => val === true).length;
  const mediumCount = engagementValues.filter(val => val === "Medium").length;
  const lowCount = engagementValues.filter(val => val === false).length;


  const totalCount = engagementValues.length;


  const highPercentage = highCount / totalCount;
  const mediumPercentage = mediumCount / totalCount;
  const lowPercentage = lowCount / totalCount;

  if (highPercentage > 0.5) {
    return "High";
  } else if (mediumPercentage > 0.5) {
    return "Medium";
  } else {
    return "Low";
  }
}

function findMostCommonActivity(squareState) {
  const activities = Object.values(squareState);
  const activityCounts = activities.reduce((acc, activity) => {
    acc[activity] = (acc[activity] || 0) + 1;
    return acc;
  }, {});

  const mostCommonActivity = Object.keys(activityCounts).reduce((a, b) => activityCounts[a] > activityCounts[b] ? a : b);
  return mostCommonActivity;
}

function toggleSidebar() {
  var header = document.querySelector('.header');
  var sidebar_top = document.querySelector('.sidebar');
  var sidebar = document.getElementById('sidebar');
  sidebar.classList.toggle('show');
}

function toggleAdditionalQuestions() {
  var checkbox = document.getElementById('nextQuestion4');
  var additionalQuestions = document.getElementById('additionalQuestions');

  if (checkbox.checked) {
    additionalQuestions.style.display = 'block';
  } else {
    additionalQuestions.style.display = 'none';
  }
}

function toggleEngageBox(box, isLecture) {

  if (isLecture) {
    var allEngageBoxes = [];
    allEngageBoxes.push(document.getElementById('lecture-high'));
    allEngageBoxes.push(document.getElementById('lecture-medium'));
    allEngageBoxes.push(document.getElementById('lecture-low'));

    if (box.classList.contains('active')) {
      allEngageBoxes.forEach(function (box) {
        box.classList.remove('active');
        engagementState[box.id] = false;
      });
      console.log(engagementState);
      return;
    }

    allEngageBoxes.forEach(function (box) {
      box.classList.remove('active');
      engagementState[box.id] = false;
    });

    box.classList.add('active');
    engagementState[box.id] = true;
    console.log(engagementState);
  } else {
    var allEngageBoxes = [];
    allEngageBoxes.push(document.getElementById('lecture-option-engage'));
    allEngageBoxes.push(document.getElementById('group-option-engage'));
    allEngageBoxes.push(document.getElementById('other-option-engage'));

    if (box.classList.contains('active')) {
      allEngageBoxes.forEach(function (box) {
        box.classList.remove('active');
        engagementType[box.id] = false;
      });
      console.log(engagementType);
      return;
    }

    allEngageBoxes.forEach(function (box) {
      box.classList.remove('active');
      engagementType[box.id] = false;
    });

    box.classList.add('active');
    engagementType[box.id] = true;
    console.log(engagementType);
  }
}

async function submitSession() {
  if (confirm("Are you sure you want to finish early? This will finish the current interval and take you to the results page")) {
    currentInterval = currentIntervalNumber;

    // Capture data for the current interval
    captureData(currentInterval);

    // Send the session data to the database
    await sendSessionToDatabase();
    console.log("Sending to DB done");

    // Redirect to the results page with the session ID
    window.location.href = `/results.html?sessionId=${sessionID}`;
  }
}

async function submitQuestions(isFirst) {
  var inputs = [];

  if (isFirst) {
    inputs = document.querySelectorAll('#questionForm input[type="text"], #questionForm input[type="date"]');
  } else {
    // Select only the first three input fields in the second stage
    inputs.push(document.getElementById('nextQuestion1'));
    inputs.push(document.getElementById('nextQuestion2'));
    inputs.push(document.getElementById('nextQuestion3'));

  }

  var isEmpty = false;

  inputs.forEach(function (input) {
    if (input.value.trim() === '') {
      input.style.borderColor = 'red';
      isEmpty = true;
    } else {
      input.style.borderColor = ''; // Reset border color if previously set
    }
  });

  if (isEmpty) {
    // Display a message indicating that all fields are required
    alert('Please fill out all required fields.');
    return;
  }

  // Check if interval length is a divisor of class length
  if (!isFirst) {
    var classLength = parseFloat(document.getElementById('nextQuestion1').value);
    var intervalLength = parseFloat(document.getElementById('nextQuestion2').value);

    if (classLength % intervalLength !== 0) {
      alert('Interval length must be a divisor of class length.');
      return;
    }
  }

  if (isFirst) {
    document.getElementById('first-step').style.textDecoration = 'none';
    document.getElementById('second-step').style.textDecoration = 'underline';
    document.getElementById('questionContainer').classList.add('move-left');

    setTimeout(function () {
      document.getElementById('questionContainer').style.display = 'none';
      document.getElementById('nextQuestionsContainer').style.display = 'block';
    }, 500);
  } else {
    document.getElementById('second-step').style.textDecoration = 'none';
    document.getElementById('third-step').style.textDecoration = 'underline';

    document.getElementById('nextQuestionsContainer').classList.add('move-left');

    captureUserInput();

    setTimeout(function () {
      document.getElementById('nextQuestionsContainer').style.display = 'none';
      document.getElementById('thirdQuestionsContainer').style.display = 'flex';
    }, 500); // Wait for the animation to complete (0.5s)


    await startSession();
    console.log('session done');
    await sendSessionToDatabase();
    console.log("sending to DB done");
    window.location.href = `/results.html?sessionId=${sessionID}`;

  }
}

function toggleSquare(squareId) {
  var square = document.getElementById(squareId);
  var squareH3 = square.querySelector('h3');

  if (square.style.backgroundColor === 'lightgreen') {
    if (squareId == 'square15') {
      document.getElementById('other-input').classList.add('hidden');
    }
    else if (squareId == 'square28') {
      document.getElementById('other-input-2').classList.add('hidden');
    }
    square.style.backgroundColor = '';
    delete squareState[squareId]; // Remove the square from the state object
  } else {
    if (squareId == 'square15') {
      document.getElementById('other-input').classList.remove('hidden');
    }
    else if (squareId == 'square28') {
      document.getElementById('other-input-2').classList.remove('hidden');
    }
    square.style.backgroundColor = 'lightgreen';
    squareState[squareId] = squareH3.textContent; // Add square's h3 content to the state object
  }



  console.log(squareState); // Output the state object to console (for testing)
}

function captureUserInput() {
  var courseCode = document.getElementById('question1').value;
  var date = document.getElementById('question2').value;
  var instructor = document.getElementById('question3').value;

  // Additional questions
  var classLength = document.getElementById('nextQuestion1').value;
  var intervalLength = document.getElementById('nextQuestion2').value;
  var classType = document.getElementById('nextQuestion3').value;
  var isGroupworkInvolved = document.getElementById('nextQuestion4').checked;
  var howManyTables = document.getElementById('nextQuestion5').value;
  var peoplePerTable = document.getElementById('nextQuestion6').value;
  var interactions = document.getElementById('question7').value;


  courseInfo = {
    courseCode: courseCode,
    date: date,
    instructor: instructor,
    classLength: classLength,
    intervalLength: intervalLength,
    classType: classType,
    isGroupworkInvolved: isGroupworkInvolved,
    howManyTables: howManyTables,
    peoplePerTable: peoplePerTable,
    interactions: interactions
  };

  intervalCountdown = intervalLength * 60;

  return;
}

async function startSession() {
  masterIntervalData["Course Information"] = courseInfo;
  //make a loop for each interval
  numIntervals = courseInfo.classLength / courseInfo.intervalLength
  for (let i = 1; i < numIntervals + 1; i++) {
    currentIntervalNumber = i
    //clear any user input
    clear();
    //set headers
    setHeaders(i, numIntervals, courseInfo.intervalLength);
    //start timer
    await startTimer(courseInfo.intervalLength)
    //when timer is done, go to next iteration
    captureData(i);
  }

}

function setHeaders(currentInterval, totalIntervals, intervalLength) {
  var intervalRange = document.getElementById('interval-count');
  var intervalTimeRange = document.getElementById('interval-time-range');

  //interval count 
  intervalRange.textContent = 'Interval ' + currentInterval + ' of ' + totalIntervals;
  intervalRange.style.fontWeight = 'bold';

  //time range
  const currentTime = new Date();
  const startHour = currentTime.getHours();
  const startMinute = currentTime.getMinutes();
  const startSeconds = currentTime.getSeconds();
  const endTime = new Date(currentTime.getTime() + intervalLength * 60000); // Convert interval length to milliseconds
  const endHour = endTime.getHours();
  const endMinute = endTime.getMinutes();
  const endSeconds = endTime.getSeconds();

  const startTimeString = `${startHour % 12 || 12}:${startMinute.toString().padStart(2, '0')}:${startSeconds.toString().padStart(2, '0')} ${startHour < 12 ? 'AM' : 'PM'}`;
  const endTimeString = `${endHour % 12 || 12}:${endMinute.toString().padStart(2, '0')}:${endSeconds.toString().padStart(2, '0')} ${endHour < 12 ? 'AM' : 'PM'}`;
  const timeIntervalString = `${startTimeString} - ${endTimeString}`;
  intervalTimeRange.textContent = timeIntervalString;
}

function startTimer(intervalLength) {
  return new Promise(resolve => {
    var countdownElement = document.getElementById('time-remaining');
    var bottomCountdownElement = document.getElementById('done-seconds-remaining');

    var intervalCountdown = intervalLength * 60; // Convert interval length to seconds
    var countdownInterval = setInterval(function () {
      intervalCountdown--;

      var minutes = Math.floor(intervalCountdown / 60);
      var seconds = intervalCountdown % 60;

      countdownElement.textContent = minutes.toString() + 'm ' + seconds.toString().padStart(2, '0') + 's remaining';
      bottomCountdownElement.textContent = minutes.toString() + 'm ' + seconds.toString().padStart(2, '0') + 's remaining';
      bottomCountdownElement.style.fontWeight = 'light';

      if (intervalCountdown <= 0) {
        clearInterval(countdownInterval);
        resolve();
      }
    }, 1000);
  });
}

function clear() {
  document.getElementById('other-input').classList.add('hidden');
  document.getElementById('other-input-2').classList.add('hidden');
  // Close the popup
  document.getElementById('popup').style.display = 'none';
  document.body.style.overflow = 'auto'; // Enable scrolling
  // Clear input fields
  var inputFields = document.querySelectorAll('input');
  inputFields.forEach(function (input) {
    input.value = '';
  });

  // Clear textareas
  var textareas = document.querySelectorAll('textarea');
  textareas.forEach(function (textarea) {
    textarea.value = '';
  });

  // Clear select dropdowns
  var selects = document.querySelectorAll('select');
  selects.forEach(function (select) {
    select.selectedIndex = 0; // Assuming the first option is a default option
  });

  // Clear squares
  var squares = document.querySelectorAll('.square');
  squares.forEach(function (square) {
    square.style.backgroundColor = '';
  });

  // Clear engagement options
  var engagementBoxes = document.querySelectorAll('.engage-box');
  engagementBoxes.forEach(function (box) {
    box.classList.remove('active');

  });

  // Clear custom notes
  document.getElementById('custom-notes-input').value = '';

  document.getElementById('time-remaining').textContent = 'Loading...';
  document.getElementById('interval-count').textContent = '<b>Loading...</b>';
  document.getElementById('interval-time-range').textContent = 'Loading...';
  squareState = {};
  engagementState = {};
  engagementType = {};
}

function captureData(interval) {
  // Get the input element by its ID
  const inputElement = document.getElementById('inputBox');
  const inputElement2 = document.getElementById('inputBox2');
  const inputValue = inputElement.value;
  const inputValue2 = inputElement2.value;
  squareState.studentOther50 = inputValue;
  squareState.instructorOther50 = inputValue2;
  console.log('Input value:', inputValue);

  var currentIntervalData = {};

  // Capture data from input fields
  currentIntervalData.notes = document.getElementById('custom-notes-input').value;

  // Capture square state
  currentIntervalData.squareState = squareState;

  // Capture lecture engagement state
  currentIntervalData.engagementState = engagementState;

  // Capture groupwork engagement state
  currentIntervalData.engagementType = engagementType;

  // Add currentIntervalData to masterIntervalData object
  masterIntervalData["Interval:" + interval.toString()] = currentIntervalData;

  console.log("Master Interval Data:", masterIntervalData);
}

async function sendSessionToDatabase() {
  console.log("sending post req...");
  try {
    const response = await fetch('/sessions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 'masterIntervalData': masterIntervalData }),
    });

    if (!response.ok) {
      throw new Error('Failed to save session data');
    }

    // Get the inserted ID from the response
    const insertedId = await response.text();

    sessionID = insertedId;

    console.log('Inserted ID:', insertedId);
  } catch (error) {
    console.error('Error sending session data:', error);
  }
}

async function getSessionResults() {
  console.log("getting data");
  fetch('/sessions')
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      // Handle the data received from the server
      console.log('Data received:', data);
    })
    .catch(error => {
      // Handle any errors that occurred during the fetch operation
      console.error('Fetch error:', error);
    });
}

function loadSessions() {
  fetch('/sessions')
    .then(response => response.json())
    .then(data => displaySessions(data.reverse()))
    .catch(error => console.error('Error fetching sessions:', error));
}

function displaySessions(sessions) {
  if (sessions.length === 0) {
    var sessionWrapper = document.querySelector('.session-wrapper');
    const noSessionsMessage = document.createElement('h2');
    const noSessionsMessageLink = document.createElement('a');
    noSessionsMessage.textContent = 'No Sessions Recorded';
    noSessionsMessage.style.textAlign = 'center'; // Align the message to the center
    noSessionsMessageLink.textContent = 'Start a New Session';
    noSessionsMessageLink.style.display = 'block';
    noSessionsMessageLink.style.textAlign = 'center'; // Align the message to the center
    noSessionsMessageLink.href = '/new-session.html';
    sessionWrapper.appendChild(noSessionsMessage);
    sessionWrapper.appendChild(noSessionsMessageLink); // Append the message to the body of the document
    return;
  }
  sessions.forEach(session => {
    const sessionListDiv = document.createElement('div');

    sessionListDiv.classList.add('sessionList');

    // Column 1: Course Code and Date
    const column1 = document.createElement('div');
    column1.classList.add('res-column');
    column1.innerHTML = `
      <p><b>Course Code:</b> ${session['Course Information'].courseCode}</p>
      <p><b>Date:</b> ${session['Course Information'].date}</p>
    `;
    sessionListDiv.appendChild(column1);

    // Column 2: Class Length and Instructor
    const column2 = document.createElement('div');
    column2.classList.add('res-column');
    column2.innerHTML = `
      <p><b>Class Length:</b> ${session['Course Information'].classLength} Minutes</p>
      <p><b>Instructor:</b> ${session['Course Information'].instructor}</p>
    `;
    sessionListDiv.appendChild(column2);

    // Column 3: Button
    const column3 = document.createElement('div');
    column3.classList.add('res-column');
    const viewButton = document.createElement('button');
    viewButton.classList.add('submit-button');
    viewButton.textContent = 'View Session';
    viewButton.style.width = '50%';
    viewButton.style.borderRadius = '10px';
    viewButton.style.margin = '0 auto';
    viewButton.onclick = function () {
      window.location.href = `/results.html?sessionId=${session._id}`;
    };
    column3.appendChild(viewButton);
    sessionListDiv.appendChild(column3);

    document.querySelector('.session-wrapper').appendChild(sessionListDiv);

  });
}

async function sendContact() {
  console.log("sending post req contact...");
  try {
    const feedback = document.querySelector('.feedback-input').value;
    const response = await fetch('/submit-feedback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ feedback }),
    });

    if (!response.ok) {
      throw new Error('Failed to save feedback');
    }

    const insertedId = await response.text();
    console.log('Inserted feedback ID:', insertedId);
  } catch (error) {
    console.error('Error sending feedback:', error);
  }
}

function reloadSession() {
  if (confirm("Are you sure you want to cancel? This will take you back to the start of a new session.")) {
    window.location.reload();
  }
}

try {
  // Open the popup when clicking on the "View Codes" element
  document.getElementById('codes-popup').addEventListener('click', function () {
    document.getElementById('popup').style.display = 'block';
    document.body.style.overflow = 'hidden'; // Disable scrolling
  });

  // Close the popup when clicking on the close button
  document.querySelector('.close-btn').addEventListener('click', function () {
    document.getElementById('popup').style.display = 'none';
    document.body.style.overflow = 'auto'; // Enable scrolling
  });

  // Close the popup when clicking outside the popup content
  document.querySelector('.popup').addEventListener('click', function (event) {
    if (event.target === this) {
      this.style.display = 'none';
      document.body.style.overflow = 'auto'; // Enable scrolling
    }
  });
} catch {

}




function viewRaw() {
  window.location.href = `/raw-results.html?sessionId=${sessionID}`;
}

function viewSum() {
  window.location.href = `/results.html?sessionId=${sessionID}`;
}

function getRawResults(data) {
  const sessionData = JSON.parse(data);
  const intervals = Object.keys(sessionData).filter(key => key.startsWith('Interval:'));

  intervals.forEach(interval => {
    var firstStudent = true;
    var firstInstructor = true;
    var intervalInfo = document.createElement('div');
    intervalInfo.classList.add('interval-information');

    var studentDoing = document.createElement('p');
    studentDoing.classList.add('studoing');
    studentDoing.innerHTML = '<span style="font-weight: bold;">Student Doing:</span> ';

    var instructorDoing = document.createElement('p');
    instructorDoing.classList.add('indoing');
    instructorDoing.innerHTML = '<span style="font-weight: bold;">Instructor Doing:</span> ';

    var engagementLevel = document.createElement('p');
    engagementLevel.classList.add('levengage');

    var engagedWith = document.createElement('p');
    engagedWith.classList.add('engwith');

    //add intervals
    var intervalNum = document.createElement('p');
    intervalNum.classList.add('interval-count');
    const intervalNumber = parseInt(interval.match(/\d+$/)[0]);

    // Setting the innerHTML of intervalNum
    intervalNum.innerHTML = `<b>Interval: ${intervalNumber}</b>`;
    //add the interval p element to the container
    document.getElementById("raw-data-wrapper").appendChild(intervalNum);

    const squareState = sessionData[interval].squareState;
    const engage = sessionData[interval].engagementState;
    const engageType = sessionData[interval].engagementType;
    const squareKeys = Object.keys(squareState);
    const engageLevelKeys = Object.keys(engage);
    const engageTypeKeys = Object.keys(engageType);

    // Loop through each square in the interval
    squareKeys.forEach(key => {
      const code = squareState[key];
      const squareNumber = parseInt(key.match(/\d+/)[0]);

      //handle student and instructor codes
      if (squareNumber != 50) {
        if (squareNumber <= 15) {
          //student is doing this code
          if (firstStudent) {
            studentDoing.innerHTML += `${code}`;
            firstStudent = false;
          } else {
            studentDoing.innerHTML += `, ${code}`;
          }

        } else {
          //instructor is doing this code
          if (firstInstructor) {
            instructorDoing.innerHTML += `${code}`;
            firstInstructor = false;
          } else {
            instructorDoing.innerHTML += `, ${code}`;
          }
        }
      }
    });

    //handle engage level and engaged with
    engageLevelKeys.forEach(key => {
      if (engage[key] == true) {
        const parts = key.split('-');
        const capitalized = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        engagementLevel.innerHTML = "<b>Engagement:</b> " + capitalized;
      }
    });

    engageTypeKeys.forEach(key => {
      if (engageType[key] == true) {
        const parts = key.split('-');
        const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        engagedWith.innerHTML = "<b>Engaged With:</b> " + capitalized;
      }
    });

    //add the four P elemets into the interval-information
    intervalInfo.appendChild(studentDoing);
    intervalInfo.appendChild(instructorDoing);
    intervalInfo.appendChild(engagementLevel);
    intervalInfo.appendChild(engagedWith);
    //add the interval information into the data wrapper
    document.getElementById("raw-data-wrapper").appendChild(intervalInfo);
  });
}

function goToHome() {
  window.location.href = `index.html`;
}

function beginExport() {
  var sessionId = getUrlParameter('sessionId');
  sessionID = sessionId;
  var results = '';

  if (sessionId != '') {
    fetch(`/sessions/${sessionId}`)
      .then(response => response.json())
      .then(sessionData => {
        results = JSON.stringify(sessionData);
        exportToExcel(results);

      })
      .catch(error => {
        console.error('Error fetching session data:', error);
      });
  }
}

function exportToExcel(data) {
  // 1. Parse the JSON data
  const sessionData = JSON.parse(data);

  // 2. Create a new Excel workbook
  const workbook = XLSX.utils.book_new();

  // 3. Create a sheet for course information
  const courseSheetData = [
    {
      'Course Code': sessionData['Course Information'].courseCode,
      Date: sessionData['Course Information'].date,
      Instructor: sessionData['Course Information'].instructor,
      'Class Length': sessionData['Course Information'].classLength,
      'Interval Length': sessionData['Course Information'].intervalLength,
      'Class Type': sessionData['Course Information'].classType,
      'Groupwork Involved': sessionData['Course Information'].isGroupworkInvolved ? 'Yes' : 'No',
      'Number of Tables': sessionData['Course Information'].howManyTables,
      'People per Table': sessionData['Course Information'].peoplePerTable,
      Interactions: sessionData['Course Information'].interactions
    }
  ];
  const courseWorksheet = XLSX.utils.json_to_sheet(courseSheetData);
  XLSX.utils.book_append_sheet(workbook, courseWorksheet, 'Course Information');

  // 4. Create a sheet for interval information
  const intervalSheetData = [];
  const intervals = Object.keys(sessionData).filter(key => key.startsWith('Interval:'));
  intervals.forEach((interval, index) => {
    const intervalData = sessionData[interval];
    const intervalNumber = parseInt(interval.match(/\d+$/)[0]);
    const squareState = intervalData.squareState;

    // Initialize variables to store data for this interval
    let studentDoing = "", instructorDoing = "", engagementLevel = "", engagedWith = "";

    // Loop through each square in the interval
    Object.keys(squareState).forEach(key => {
      const code = squareState[key];
      const squareNumber = parseInt(key.match(/\d+/)[0]);

      // Handle student and instructor codes correctly
      if (squareNumber <= 15) {
        // Student is doing this code
        studentDoing += `${code}, `;
      } else if (squareNumber > 15 && squareNumber !== 50) {
        // Instructor is doing this code (excluding square 50)
        instructorDoing += `${code}, `;
      } else if (squareNumber === 50 && code === 'Other') {
        // Include "Other" from square 50 with instructor codes
        instructorDoing += `${code}, `;
      }
    });

    // Remove trailing commas
    studentDoing = studentDoing.trim().replace(/,\s*$/, '');
    instructorDoing = instructorDoing.trim().replace(/,\s*$/, '');

    // Determine engagement level
    const engage = sessionData[interval].engagementState;
    const engageLevelKeys = Object.keys(engage);
    engageLevelKeys.forEach(key => {
      if (engage[key] === true) { // Check for "true" directly
        const parts = key.split('-');
        const capitalized = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        engagementLevel = capitalized;
      }
    });

    // Determine engaged with
    const engageType = sessionData[interval].engagementType;
    const engageTypeKeys = Object.keys(engageType);
    engageTypeKeys.forEach(key => {
      if (engageType[key] === true) { // Check for "true" directly
        const parts = key.split('-');
        const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        engagedWith = capitalized;
      }
    });

    // Append interval data to intervalSheetData
    intervalSheetData.push({
      Interval: intervalNumber,
      'Student Doing': studentDoing,
      'Instructor Doing': instructorDoing,
      'Engagement Level': engagementLevel,
      'Engaged With': engagedWith,
      Notes: intervalData.notes
    });
  });
  const intervalWorksheet = XLSX.utils.json_to_sheet(intervalSheetData);
  XLSX.utils.book_append_sheet(workbook, intervalWorksheet, 'Interval Information');

  // 5. Write the workbook to a file
  const today = new Date();
  const dateString = today.toLocaleDateString(); // Format the date as needed
  const sheetName = `Session Data on ${dateString}.xlsx`;
  XLSX.writeFile(workbook, sheetName);
}



function exportToExcel2(results) {
  // Data to be converted to CSV
  let csvContent = "data:text/csv;charset=utf-8,";

  const sessionData = JSON.parse(results);
  const intervals = Object.keys(sessionData).filter(key => key.startsWith('Interval:'));
  const courseInformation = sessionData.courseInfo;





  // Add headers for course information
  csvContent += "Course Information\n";
  Object.entries(courseInformation).forEach(([key, value]) => {
    csvContent += `"${key}", "${value}"\n`;
  });

  //handle interval stuff now
  csvContent += "\nInterval, Student Doing, Instructor Doing, Engagement Level, Engaged With\n";

  intervals.forEach(interval => {
    console.log("interval no: " + interval);
    const intervalNumber = parseInt(interval.match(/\d+$/)[0]);
    const squareState = sessionData[interval].squareState;
    const engage = sessionData[interval].engagementState;
    const engageType = sessionData[interval].engagementType;
    const squareKeys = Object.keys(squareState);
    const engageLevelKeys = Object.keys(engage);
    const engageTypeKeys = Object.keys(engageType);

    // Initialize variables to store data for this interval
    let studentDoing = "", instructorDoing = "", engagementLevel = "", engagedWith = "";

    // Loop through each square in the interval
    squareKeys.forEach(key => {
      const code = squareState[key];
      const squareNumber = parseInt(key.match(/\d+/)[0]);

      // Handle student and instructor codes
      if (squareNumber != 50) {
        if (squareNumber <= 15) {
          // Student is doing this code
          studentDoing += `${code}, `;
        } else {
          // Instructor is doing this code
          instructorDoing += `${code}, `;
        }
      }
    });

    // Handle engagement level and engaged with
    engageLevelKeys.forEach(key => {
      if (engage[key] == true) {
        const parts = key.split('-');
        const capitalized = parts[1].charAt(0).toUpperCase() + parts[1].slice(1);
        engagementLevel = capitalized;
      }
    });

    engageTypeKeys.forEach(key => {
      if (engageType[key] == true) {
        const parts = key.split('-');
        const capitalized = parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
        engagedWith = capitalized;
      }
    });

    // Append interval data to CSV content
    csvContent += `${intervalNumber}, "${studentDoing}", "${instructorDoing}", "${engagementLevel}", "${engagedWith}"\n`;
  });



  // Encode csvContent to URI format
  const encodedUri = encodeURI(csvContent);

  // Create a link element
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);

  // Set the filename for the downloaded file
  link.setAttribute("download", "exported_data.csv");




}


function exportToPDF() {
  // Get the entire HTML body element
  const bodyElement = document.querySelector('.pdf-master-wrapper');

  // Use html2canvas to capture the body as a canvas
  html2canvas(bodyElement, {
    allowTaint: true,
    useCORS: true,
    logging: true,
    scale: window.devicePixelRatio // Adjust this value for higher resolution
  }).then(function (canvas) {
    // Convert the canvas to a data URL
    const canvasDataUrl = canvas.toDataURL('image/png');

    // Create a new jsPDF instance
    const pdf = new jspdf.jsPDF('p', 'mm', 'a4');

    // Get the dimensions of the PDF document
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    // Calculate the dimensions of the canvas image
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

    // Calculate the adjusted width and height for the image
    const adjustedWidth = imgWidth * ratio;
    const adjustedHeight = imgHeight * ratio;

    // Add the canvas image to the PDF document
    pdf.addImage(canvasDataUrl, 'PNG', 0, 0, adjustedWidth, adjustedHeight);

    // Save the PDF document
    pdf.save('document.pdf');
  });
}






