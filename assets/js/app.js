//When the browser loads, makeResponsive() is called.
makeResponsive();

//When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

//The code for the chart is wrapped inside a function that automatically resizes the chart
function makeResponsive() {

    var svgArea = d3.select("#scatter");

    //If the SVG area is not empty when the browser loads remove it and replace it with a resized version of the chart   
    if (!svgArea.empty()) {
        svgArea.remove();            
        d3.select("#scatterholder")  
                .append("div")
                .attr("id", "scatter");         
    }
  
    //SVG wrapper dimensions are determined by the width of <div id="scatter"> of browser window not window.innerWidth
    var svgWidth = parseInt(d3.select("#scatter").style("width")); 
    var svgHeight = svgWidth * 3/4;
    
    var marginHorizontalRatio = 0.04;
    var marginVerticalRatio = 0.05;

    var margin = {
        top: svgHeight * marginVerticalRatio,
        right: svgWidth * marginHorizontalRatio,
        bottom: svgHeight * marginVerticalRatio,
        left: svgWidth * marginHorizontalRatio
    };

    var xLabelHeight = 100;
    var yLabelWidth = 100;

    var chartWidth = svgWidth - margin.left - margin.right ;
    var chartHeight = svgHeight - margin.top - margin.bottom ;

    //Create an SVG wrapper
    var svg = d3.select("#scatter")
                    .append("svg")
                        .attr("width", svgWidth)
                        .attr("height", svgHeight)
                        .attr("class", "chart");       

     //Append an SVG group to hold chart, and shift the latter by left and top margins. 
    var chartGroup = svg.append("g")
                            .attr("transform", `translate(${margin.left}, ${margin.top})`);

   
    //Initial Params
    var chosenXAxis = "poverty";    
    var chosenYAxis = "healthcare";

   
    //Import data from the .csv file: includes state-by-state demographic data from the US Census and measurements from health risks obtained by the Behavioral Risk Factor Surveillance System.
    d3.csv("assets/data/data.csv").then(lifeData => {
        lifeData.forEach(function (data) {
                data.healthcare = +data.healthcare;
                data.poverty = +data.poverty;
                data.smokes = +data.smokes;
                data.age = +data.age;    
                data.income = +data.income;
                data.obesity = +data.obesity;  
        });


        //xLinearScale function above csv import
        var xLinearScale = xScale(lifeData, chosenXAxis);
        var yLinearScale = yScale(lifeData, chosenYAxis);   

        //Create initial axis functions
        var bottomAxis = d3.axisBottom(xLinearScale); 
        var leftAxis = d3.axisLeft(yLinearScale);

        //Append x axis
        var xAxis = chartGroup.append("g")
                                   .classed("x-axis", true)
                                   .attr("transform", `translate(0, ${chartHeight-xLabelHeight})`)
                                   .call(bottomAxis);
       //Append y axis
       var yAxis = chartGroup.append("g")
                                    .classed("y-axis", true)
                                    .attr("transform", `translate(${yLabelWidth},0)`) 
                                    .call(leftAxis);   

        //Append initial circles
        var circlesGroup = chartGroup.selectAll("circle")
                                          .data(lifeData)
                                          .enter()
                                              .append("circle")
                                                  .attr("cx", d => xLinearScale(d[chosenXAxis])) 
                                                  .attr("cy", d => yLinearScale(d[chosenYAxis]))  
                                                  .attr("r", 10)          
                                                  .attr("fill", "green")
                                                  .attr("opacity", ".5");   

        //UpdateToolTip function above csv import
        var circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);

        //Append initial texts
        // var ss;
        var textsGroup = chartGroup.selectAll("text .abbrtext")
        .data(lifeData)
        .enter()
            .append("text")
                .attr("class","abbrtext")
                .attr("x", d => xLinearScale(d[chosenXAxis]))
                .attr("y", d => yLinearScale(d[chosenYAxis]))
                .attr("text-anchor", "middle")
                .attr("font-size", "8px")
                .attr("font-weight", "bold")
                .attr("fill", "green")
                .text(d=>d.abbr);
                // .text(function(d,i){return d.abbr;});
                // .text(function(d,i){ss=ss+d.abbr+"/"+i+"/";return d.abbr;});
        // console.log("ss=",ss);
        //????ss= undefinedMI/22/MN/23/MS/24/MO/25/MT/26/NE/27/NV/28/NH/29/NJ/30/NM/31/NY/32/NC/33/ND/34/OH/35/OK/36/OR/37/PA/38/RI/39/SC/40/SD/41/TN/42/TX/43/UT/44/VT/45/VA/46/WA/47/WV/48/WI/49/WY/50/

        //Create group for 3 XAxes labels and Append XAxes
        var xlabelsGroup = chartGroup.append("g")
                                        .attr("transform", `translate(${(chartWidth-yLabelWidth)/2+yLabelWidth}, ${chartHeight-xLabelHeight})`);//${chartHeight-xLabelHeight })`);

        var povertyXAxisLabel = xlabelsGroup.append("text")
                                                .attr("x", 0)   
                                                .attr("y", 40)  
                                                .attr("font-size", "18px")
                                                .attr("value", "poverty") 
                                                .classed("active", true)
                                                .text("In Poverty(%)");

        var ageXAxisLabel = xlabelsGroup.append("text")
                                            .attr("x", 0)
                                            .attr("y", 60)
                                            .attr("font-size", "18px")
                                            .attr("value", "age") // value to grab for event listener
                                            .classed("inactive", true)
                                            .text("Age(Median)");

        var incomeXAxisLabel = xlabelsGroup.append("text")
                                                .attr("x", 0)
                                                .attr("y", 80)
                                                .attr("font-size", "18px")
                                                .attr("value", "income") // value to grab for event listener
                                                .classed("inactive", true)
                                                .text("Household Income(Median)");

        //Create group for 3 YAxes labels and Append YAxes
        var ylabelsGroup = chartGroup.append("g")
                                        .attr("transform", `translate(0, ${xLabelHeight+(chartHeight-xLabelHeight)/2})`);

        var healthcareYAxisLabel = ylabelsGroup.append("text")        
                                                    .attr("transform", "rotate(-90)")
                                                    .attr("x", 0)
                                                    .attr("y", 40)
                                                    .attr("font-size", "18px")
                                                    .attr("value", "healthcare") 
                                                    .classed("active", true)
                                                    .text("Lacks Healthcare(%)");

        var smokesYAxisLabel = ylabelsGroup.append("text")
                                                .attr("transform", "rotate(-90)")
                                                .attr("x", 0)
                                                .attr("y", 20)
                                                .attr("font-size", "18px")
                                                .attr("value", "smokes") 
                                                .classed("inactive", true)
                                                .text("Smokes(%)");

        var obesityYAxisLabel = ylabelsGroup.append("text")
                                                .attr("transform", "rotate(-90)")
                                                .attr("x", 0)
                                                .attr("y", 0)
                                                .attr("font-size", "18px")
                                                .attr("value", "obesity") 
                                                .classed("inactive", true)
                                                .text("Obesity(%)");




        //X axis labels event listener
        xlabelsGroup.selectAll("text")
                        .on("click", function() {        
                        var value = d3.select(this)
                                         .attr("value");
                        if (value !== chosenXAxis) {            
                            chosenXAxis = value;// replaces chosenXAxis with value
                            // console.log(chosenXAxis)            
                            xLinearScale = xScale(lifeData, chosenXAxis);// updates x scale for new data
                            xAxis = renderXAxes(xLinearScale, xAxis);// updates x axis with transition
                            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);// updates circles with new x values
                            textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);// updates texts with new x values
                            circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis);// updates tooltips with new info
                            if (chosenXAxis === "poverty") {// changes classes to change bold text
                                povertyXAxisLabel.classed("active", true)
                                                 .classed("inactive", false);
                                ageXAxisLabel.classed("active", false)
                                             .classed("inactive", true);
                                incomeXAxisLabel.classed("active", false)
                                                .classed("inactive", true);
                            }
                            else if (chosenXAxis === "age") {// changes classes to change bold text
                                ageXAxisLabel.classed("active", true)
                                             .classed("inactive", false);
                                povertyXAxisLabel.classed("active", false)
                                                 .classed("inactive", true);
                                incomeXAxisLabel.classed("active", false)
                                                .classed("inactive", true);
                            }
                            else {
                                incomeXAxisLabel.classed("active", true)
                                                .classed("inactive", false);
                                povertyXAxisLabel.classed("active", false)
                                                 .classed("inactive", true);
                                ageXAxisLabel.classed("active", false)
                                             .classed("inactive", true);
                            }
                        }
                    });    

        //Y axis labels event listener
        ylabelsGroup.selectAll("text")
                    .on("click", function() {         
                        var value = d3.select(this).attr("value");
                        if (value !== chosenYAxis) {            
                            chosenYAxis = value; 
                            // console.log(chosenXAxis)            
                            yLinearScale = yScale(lifeData, chosenYAxis); 
                            yAxis = renderYAxes(yLinearScale, yAxis); 
                            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis); 
                            textsGroup = renderTexts(textsGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);// updates texts with new y values
                            circlesGroup = updateToolTip(circlesGroup, chosenXAxis, chosenYAxis); 
                            if (chosenYAxis === "healthcare") {// changes classes to change bold text
                                healthcareYAxisLabel.classed("active", true)
                                                    .classed("inactive", false);
                                smokesYAxisLabel.classed("active", false)
                                                .classed("inactive", true);
                                obesityYAxisLabel.classed("active", false)
                                                 .classed("inactive", true);
                            }
                            else if (chosenYAxis === "smokes") {// changes classes to change bold text
                                smokesYAxisLabel.classed("active", true)
                                                .classed("inactive", false);
                                healthcareYAxisLabel.classed("active", false)
                                                    .classed("inactive", true);
                                obesityYAxisLabel.classed("active", false)
                                                 .classed("inactive", true);
                            }
                            else {
                                obesityYAxisLabel.classed("active", true)
                                                 .classed("inactive", false);
                                healthcareYAxisLabel.classed("active", false)
                                                    .classed("inactive", true);
                                smokesYAxisLabel.classed("active", false)
                                                .classed("inactive", true);
                         }
                        }
                    });    
        
    }).catch(function (error) {
        console.log(error);
    });


    //Function used for updating x-scale var upon click on axis label
    function xScale(data, chosenXAxis) {
        var xLinearScale = d3.scaleLinear()
                                .domain([d3.min(data, d => (d[chosenXAxis])) ,    
                                        d3.max(data, d => (d[chosenXAxis]))])  
                                .range([0, chartWidth]);
        return xLinearScale;
    }
    function yScale(data, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
                                .domain([d3.min(data, d => d[chosenYAxis]), 
                                        d3.max(data, d => d[chosenYAxis])])
                                .range([chartHeight, 0]);   
        return yLinearScale;
    }

    //Function used for updating xAxis var upon click on x axis label
    function renderXAxes(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
        xAxis.transition()
                .duration(1000)
                .call(bottomAxis);
        return xAxis;
    }

    //Function used for updating yAxis var upon click on y axis label
    function renderYAxes(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);
        yAxis.transition()
                .duration(1000)
                .call(leftAxis);
        return yAxis;
    }

    //Function used for updating circles group with a transition to new circles
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        circlesGroup.transition()
                        .duration(1000)
                        .attr("cx", d => newXScale(d[chosenXAxis]))
                        .attr("cy", d => newYScale(d[chosenYAxis]));
        return circlesGroup;
    }

    //Function used for updating texts group with a transition to new texts
    function renderTexts(textsGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {
        textsGroup.transition()
                        .duration(1000)
                        .attr("x", d => newXScale(d[chosenXAxis]))
                        .attr("y", d => newYScale(d[chosenYAxis]));
    return textsGroup;
    }


    //Function used for updating circles group with new tooltip
    function updateToolTip(circlesGroup, chosenXAxis, chosenYAxis ) {        
        if (chosenXAxis === "poverty") {var xlabel = "In Poverty(%)"; }
        else if (chosenXAxis === "age"){var xlabel = "Age(Median)"; }  
        else { var xlabel = "Household Income(Median)"; }
        if (chosenYAxis === "healthcare") {var ylabel = "Lacks Healthcare(%)"; }
        else if (chosenYAxis === "smokes"){var ylabel = "Smokes(%)"; }
        else { var ylabel = "Obesity(%)"; }
        var toolTip = d3.tip()   
                        .attr("class", "d3-tip")
                        .offset([0, 0])     
                        .html(function(d) {
                            return (`<strong>${d.state}</strong><br>${xlabel} : ${d[chosenXAxis]}<br>${ylabel} : ${d[chosenYAxis]}`);
                        });
        circlesGroup.call(toolTip);  
        circlesGroup.on("mouseover", function(data) {toolTip.show(data);})   
                    .on("mouseout", function(data, index) {toolTip.hide(data);});
        return circlesGroup;
    }

}




