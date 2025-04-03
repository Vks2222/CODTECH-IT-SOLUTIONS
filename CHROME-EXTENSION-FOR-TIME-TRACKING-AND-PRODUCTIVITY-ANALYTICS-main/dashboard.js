fetch("http://localhost:5000/stats")
  .then(response => response.json())
  .then(data => {
    let formattedData = data.map(item => `Domain: ${item.domain}, Time Spent: ${item.timeSpent} seconds`).join("\n");
    document.getElementById("stats").innerText = formattedData;
  })
  .catch(error => console.error("Error fetching data:", error));
