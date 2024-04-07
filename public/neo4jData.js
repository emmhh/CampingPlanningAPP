document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("getDataBtn").addEventListener("click", fetchData);
});

function fetchData() {
  d3.json(
    "http://neo4j-api-env.eba-qrx2smw2.us-east-1.elasticbeanstalk.com/place_to_travel"
  )
    .then(renderDataWithD3)
    .catch((error) => {
      console.error("Error fetching data:", error);
      d3.select("#dataDisplay").text("Failed to load data");
    });
}

function renderDataWithD3(data) {
  const displayElement = d3.select("#dataDisplay");
  displayElement.html(""); // 清空以前的结果

  data.forEach((item) => {
    const dateString = `${item.forecastDate.year.low}-${item.forecastDate.month.low}-${item.forecastDate.day.low}`;
    const locationString = `Best Location: ${item.BestLocation}`;
    const sunriseTimeString = `Sunrise Time: ${item.SunriseTime.hour.low}:${item.SunriseTime.minute.low}:${item.SunriseTime.second.low}`;

    // 使用D3创建卡片
    const card = displayElement
      .append("div")
      .classed("card mb-3", true)
      .style("max-width", "1500px");

    const cardBody = card.append("div").classed("card-body", true);

    cardBody.append("h5").classed("card-title", true).text(dateString);

    cardBody
      .append("p")
      .classed("card-text", true)
      .html(`${locationString}<br>${sunriseTimeString}`);

    cardBody
      .append("button")
      .classed("btn btn-primary btn-sm", true)
      .style("margin-right", "5px")
      .text("Get Forecast");

    cardBody
      .append("button")
      .classed("btn btn-primary btn-sm", true)
      .text("Get Recommendation");
  });
}
