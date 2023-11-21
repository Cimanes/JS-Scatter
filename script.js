// ========================================
// Define dimensions, units and file with data
// ========================================
const 
  width = 800,            // SVG width - Compare with "container" in .css file
  height = 420,           // SVG height - Compare with "container  in .css file
  hMargin = 70,           // Horizontal margin - Compare with "width" and "container"
  vMargin = 60,           // Vertical margin - compare with "height" and "container"
  tipWidth = 150,         // Tooltip box size
  tipHeight = 50,         // Tooltip box size
  xLabel = "YEAR",        // Horizontal Axis label
  yLabel = "Time in Minutes (mm:ss)", // Vertical Axis label
  dot_R = 5,              // Radius of each dot
  
  legendData = [          // array with objects displayed in the legend
    {Type: 0, color: '#FF9900', label:'Riders with doping allegations'},
        {Type: 1, color: '#24DBF5', label:'No doping allegations '},
    ],
  legendHeight = 12,      // Height of each individual legend line (defines font-size too)
//       const max = Math.max(...myArray.map(item => item.cost));
  legendWidth = 20 + 0.5 * legendHeight * Math.max(...legendData.map(i => i.label.length)),      // Width of the legend box 
  
  classify = (array) => {     // function to assign "type" to each data object.
    array.forEach( (item) => {
      switch(item.Doping) {
        case '': item.Type = 1; break;
        default: item.Type = 0;
        }
      } ) 
    },
  timeFormat = d3.timeFormat('%M:%S'),    // Convert date to string with specified format 
  timeParse = d3.timeParse('%M:%S'),      // Convert string with specified format into date
      
  // Option 1: complete path of the data file
  dataFile = 'https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
  // Option 2: when file is in the same folder / Repository:
  // dataFile = 'data.json';

// ========================================
// Create SVG element within visHolder and define dimensions
// ========================================
// eslint-disable-next-line no-undef
const svgContainer = d3.select('.visHolder')
  .append('svg')
    .attr('width', width + hMargin)
    .attr('height', height + vMargin)
    .attr('class', 'graph');

// ========================================
// Add text in the horizontal axis
// ========================================
svgContainer
  .append('text')
    .attr('x', width / 2 + 40 )
    .attr('y', height + 60)
    .text(xLabel)
    .attr('class', 'Label');

// ========================================
// Add text in the vertical axis:
// ========================================
svgContainer
  .append('text')
    .attr('transform', 'rotate(-90)')
    .attr('x', -height/2 - 40)
    .attr('y', 20)
    .text(yLabel)
    .attr('class', 'Label');

// =====================
// LEGEND
// =====================
const legend = d3.select('.legendHolder')
  .attr('id', 'legend')
  .style('margin-left', hMargin + width - legendWidth +'px')
  .append('svg')
  .attr('width', legendWidth)
  .attr('height', 2 * legendHeight * legendData.length);

legend
  .selectAll('rect')
  .data(legendData)
  .enter()
  .append('rect')
  .attr('y', (d, i) => ( 0.25 + 2 * i) * legendHeight)
  .attr('width', 20)
  .attr('height', 0.75 * legendHeight)
  .style('fill', d => d.color);

legend
  .selectAll('text')
  .data(legendData)
  .enter()
  .append('text')
  .attr('y', (d, i) => (1+ 2 * i) * legendHeight )
  .attr('x', 25)
  .text( d => d.label )
  .style('font-size', legendHeight + 'px');

// ========================================
// Define the tooltip that will show when mouse is on a bar:
// ========================================
const tooltip = d3.select('.tooltip');



 /**======================================== 
 * Retrieve data from external file to be used in the graph:  
 * ======================================== 
 * 
 * OPTION 1: XML HTTP REQUEST:    
 * const req = new XMLHttpRequest();            // Create an XMLHttpRequest object:
 * // Specify the request: type = GET, path of the file, asynchronous = TRUE:
 * req.open("GET",'dataFile',true);     
 * req.onload = function(){                     // When the file is loaded, perform this function 
 *   const data = JSON.parse(req.responseText); // Create a JSON object from the text of the response 
 *   --------     use the data here       --------------------- 
 * };
 * req.send();
 * 
 * ---------------- OPTION 2: FETCH
 * // Retrieve the remote file:
 * fetch('dataFile')  
 * .then(response => response.json())     // Create a JSON object with the response 
 * .then(data => { 
 *   --------     use the data here       ---------------------
 *   }
 * );
 * 
 * ---------------- OPTION 3: D3.JSON: 
 * // Create a JSON object from the remote file:
 * d3.json( 'dataFile' )  
 * .then(data => { 
 *   --------     use the data here       --------------------- 
 *   }
 */
fetch(dataFile)                    // Retrieve the remote file
  .then(file => file.json())       // Create a JSON object with the response
  // .then(json => json.data)      // Extract the "data" property from the object
  .then(data => {                  // use the array in the json in the following operations: 
    classify(data);
    
    // =====================
    // --- X Axis
    // =====================
    const years = data.map( item => item.Year );              // 1D array with the Year of each element.
    const xDomain = [d3.min(years) - 1, d3.max(years) + 1];   // const xDomain = [Math.min(...years) - 1, Math.max(...years) + 1]; 
    const xScale = d3.scaleLinear()
      .domain(xDomain)
      .range([0, width]);   // Use scaleLinear method for X axis. 
    svgContainer
      .append('g')                                        // append general element.
        .call(d3.axisBottom(xScale).tickFormat(d3.format('d')))                      // the element is a "bottom axis" using the function xScale.
        .attr('id', 'x-axis')                             // --------    User Story #2: id="x-axis".
        .attr('transform', 'translate(' + hMargin + ', ' + height  + ')')     // move it to the correct position.
        .selectAll('text')                                // Select the text in the axis
          .attr('transform', 'translate(-15, 0)');        // Move it left to avoid cutting the rightmost value,

    // =====================
    // --- Y Axis
    // =====================
    const 
      mSeconds = data.map(item => 1000 * item.Seconds),                 // New array with time in miliseconds.
      yDomain = [d3.min(mSeconds) - 10000, d3.max(mSeconds) + 10000],   // Define domain.
      yScale = d3.scaleTime().domain(yDomain).range([0, height]),       // Scaling function.
      date = mSeconds.map(item => new Date(item));                      // New array with seconds passed to "dates".
      // arrTime = date.map(item => timeFormat(item));      
      // arrTime1 = arrTime.map(item => timeParse(item));
      
    svgContainer
      .append('g')                                            // Add general element.
        .call(d3.axisLeft(yScale).tickFormat(timeFormat))     // Element will be left axis; scaled by "yScale"; values in format mm:ss.
        .attr('id', 'y-axis')                                 // Assign id.
        .attr('transform', 'translate(' + hMargin + ', 0)')   // Move the origin.
        .selectAll('text')                                    // Select the text in the axis.
          .attr('transform', 'translate(0, 4)');              // Move it down to avoid cutting the top value

    // =====================
    // DATA: show dots and tooltip
    // =====================
    svgContainer
      .selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
        .attr('class', 'dot')                          
        .attr('r', dot_R)
        .attr('cx', (d) => hMargin + xScale(d.Year) )  
        .attr('cy',  (d) => yScale(1000 * d.Seconds) )  
        .attr('data-xvalue', (d) => d.Year)             
        .attr('data-yvalue', (d, i) => date[i])
        
        .style('fill', d => legendData[d.Type].color )
        // =============================================================
        // Define what will happen when mouse is on a circle (show tooltip)
        // =============================================================
        .on('mouseover', function (event, d) { 
          tooltip.attr('data-year', d.Year);
          tooltip
            .style('opacity', 0.8)
            .html( d.Name + ': ' + d.Nationality + '<br>' + 'Year: ' + d.Year + ', Time: ' + d.Time + (d.Doping ? '<br/>' + d.Doping : ''))
            .style('left', event.pageX + 'px')
            .style('top', event.pageY  + 'px');
          })

        // =============================================================
        // Define what will happen when mouse is off the bar (hide tooltip again)
        // =============================================================
        .on('mouseout', function () { tooltip.style('opacity', 0);  });
 })
  .catch(e => console.log(e));