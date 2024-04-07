// forecast.js
document.addEventListener('DOMContentLoaded', function() {     
    //add city filter button
    const loadWeatherButton = document.getElementById('load-weather');
    loadWeatherButton.addEventListener('click', function() {
        const cityZipCode = document.getElementById('city').value;
        if(!cityZipCode){
            alert("Please select City!");
            document.getElementById('forecast-container').innerHTML = "";
        }
        else{
            //decide endpoint
            const endpoint = cityZipCode ? `/weather?zip=${cityZipCode}` : '/weather';        
            fetch(endpoint)
                .then(response => response.json())
                .then(data => {
                    const container = document.getElementById('forecast-container');
                    container.innerHTML = ''; // Clear previous results
                    const days = data[0]?.days; // Adjust based on your actual data structure
                    const monthlyStats = calculateMonthlyStats(days);

                    Object.keys(monthlyStats).forEach(month => {
                        const stats = monthlyStats[month];
                        const card = document.createElement('div');
                        card.className = 'forecast-card';

                        const monthEl = document.createElement('h2');
                        monthEl.textContent = `Month: ${month}`;
                        card.appendChild(monthEl);

                        const avgTempEl = document.createElement('p');
                        avgTempEl.textContent = `Average Temperature: ${stats.avgTemp}°C`;
                        card.appendChild(avgTempEl);

                        const totalPrecipEl = document.createElement('p');
                        totalPrecipEl.textContent = `Total Precipitation: ${stats.totalPrecip}mm`;
                        card.appendChild(totalPrecipEl);

                        const maxWindGustEl = document.createElement('p');
                        maxWindGustEl.textContent = `Max Wind Gust: ${stats.maxWindGust}km/h`;
                        card.appendChild(maxWindGustEl);

                        container.appendChild(card);

                        // Call the drawBarChart function to draw the bar chart with the monthly stats
                        drawBarChart(monthlyStats);
                    });
            })
            .catch(error => console.error('Error fetching forecast:', error));
        }
    });


    function calculateMonthlyStats(days) {
        let monthlyStats = {};
    
        days.forEach(day => {
            const month = day.datetime.substring(0, 7); // YYYY-MM
            
            if (!monthlyStats[month]) {
                monthlyStats[month] = { totalTemp: 0, totalPrecip: 0, maxWindGust: 0, count: 0 };
            }
            monthlyStats[month].totalTemp += day.temp;
            monthlyStats[month].totalPrecip += day.precip || 0;
            monthlyStats[month].maxWindGust = Math.max(monthlyStats[month].maxWindGust, day.windgust || 0);
            monthlyStats[month].count++;
        });
    
        // Calculate averages
        Object.keys(monthlyStats).forEach(month => {
            monthlyStats[month].avgTemp = (monthlyStats[month].totalTemp / monthlyStats[month].count).toFixed(2);
            monthlyStats[month].totalPrecip = monthlyStats[month].totalPrecip.toFixed(2);
            monthlyStats[month].maxWindGust = monthlyStats[month].maxWindGust.toFixed(2);
        });
    
        return monthlyStats;
    }

    function drawBarChart(monthlyStats) {
        const monthAbbreviations = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.'];
        const svgElement = d3.select('#temp-bar-chart');
        const margin = { top: 20, right: 20, bottom: 50, left: 60 };
        //const width = +svgElement.style('width').slice(0, -2) - margin.left - margin.right; // Parse width from style attribute
        //const height = +svgElement.style('height').slice(0, -2) - margin.top - margin.bottom; // Parse height from style attribute
    
        // Account for margins when setting width and height
        const width = parseInt(svgElement.style('width')) - margin.left - margin.right;
        const height = parseInt(svgElement.style('height')) - margin.top - margin.bottom;

        // Clear any previous SVG content
        svgElement.selectAll("*").remove();
    
        const xScale = d3.scaleBand()
            .domain(monthAbbreviations) // Use month abbreviations for domain
            .range([0, width])
            .padding(0.1);
        
        // Define the scales
        const yScale = d3.scaleLinear()
        .domain([0, d3.max(Object.values(monthlyStats), d => d.avgTemp) * 4]) // Multiply by 1.1 to add some space at the top
        .range([height, 0]);
    
        const g = svgElement.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);
        
        // Bars
        g.selectAll('rect')
            .data(Object.values(monthlyStats))
            .enter()
            .append('rect')
            .attr('x', (d, i) => xScale(monthAbbreviations[i]))
            .attr('y', d => yScale(d.avgTemp))
            .attr('width', xScale.bandwidth() - 5 ) 
            .attr('height', d => height - yScale(d.avgTemp))
            .attr('fill', 'steelblue');
    
        // X Axis
        g
            .append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(xScale))
    
        // Y Axis
        g
            .append('g')
            .call(d3.axisLeft(yScale).ticks(10))
            .append('text')
    
        // Adding text labels for each bar
        g.selectAll('.text')
            .data(Object.values(monthlyStats))
            .enter()
            .append('text')
            .attr('class', 'label')
            .attr('x', (d, i) => xScale(monthAbbreviations[i]) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.avgTemp) - 5)
            .attr('text-anchor', 'middle')
            .text(d => d.avgTemp + '°C')
            .attr('font-size', '10px');

            // Y-Axis Title
            g.append("text")
            .attr("transform", "rotate(-90)") // Rotate the text for vertical y-axis title
            .attr("y", 0 - margin.left) // Position it to the left of the y-axis
            .attr("x", 0 - (height / 2)) // Center it vertically
            .attr("dy", "1em") // Adjust distance from the axis
            .style("text-anchor", "middle") // Center the text horizontally
            .text("Average Temperature (°C)"); // The subtitle text for the y-axis

            // X-Axis Title
            g.append("text")
            .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`) // Position it below the x-axis
            .style("text-anchor", "middle") // Center the text horizontally
            .text("Months of the Year"); // The subtitle text for the x-axis
    }
});