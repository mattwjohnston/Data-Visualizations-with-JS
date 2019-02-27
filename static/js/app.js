function buildMetadata(sample) {
  d3.json("/metadata/" + sample ).then(function(data) {
    console.log(data);
    
    var div = d3.select('table');
    div.html("");
    Object.entries(data).forEach(d => {
      var row = div.append("tr");
      var cell = row.append("th");
      var cell2 = row.append("th");
      cell.text(d[0]);
      cell2.text(d[1]);
    });

    // Trig to calc meter point
    var level = ((data.WFREQ - 0) / (9.5 - 0))*(190-(data.WFREQ*2.5));
    var degrees = 180 - level,
        radius = .5;
    var radians = degrees * Math.PI / 180;
    var x = radius * Math.cos(radians);
    var y = radius * Math.sin(radians);

    // Path: may have to change to create a better triangle
    var mainPath = 'M -.0 -0.025 L .0 0.025 L .0 0.025 L ',
        pathX = String(x),
        space = ' ',
        pathY = String(y),
        pathEnd = ' Z';
    var path = mainPath.concat(pathX,space,pathY,pathEnd);

    var data = [{ type: 'scatter',
      x: [0], y:[0],
        marker: {size: 28, color:'850000'},
        showlegend: false,
        name: 'speed',
        text: level,
        hoverinfo: 'text+name'},
      { values: [50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50/9, 50],
      rotation: 90,
      text: ['9', '8', '7', '6', '5', '4', '3', '2', '1', ''],
      textinfo: 'text',
      textposition:'inside',
      marker: {colors:['rgba(14, 127, 0, .5)','rgba(30, 137, 10, .5)', 'rgba(110, 154, 22, .5)','rgba(110, 154, 22, .5)',
      'rgba(170, 202, 42, .5)', 'rgba(190, 209, 80, .5)','rgba(207, 209, 110, .5)',
      'rgba(210, 206, 145, .5)', 'rgba(232, 226, 202, .5)',
      'rgba(255, 255, 255, 0)']},
      labels: [9,8,7,6,5,4,3,2,1,0],
      hoverinfo: 'label',
      hole: .5,
      type: 'pie',
      showlegend: false
    }];

    var layout = {
      shapes:[{
          type: 'path',
          path: path,
          fillcolor: '000000',
          line: {
            color: '850000'
          }
        }],
      title: 'Weekly cleaning frequency',
      xaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]},
      yaxis: {zeroline:false, showticklabels:false,
                showgrid: false, range: [-1, 1]}
    };
  
    Plotly.newPlot('gauge', data, layout);
    
    });

}

function buildCharts(sample) {
  d3.json("/samples/" + sample ).then(function(data) {
    console.log(data);
   // helper method for sortingg and saving the original indeces
    function sortWithIndeces(toSort) {
      for (var i = 0; i < toSort.length; i++) {
        toSort[i] = [toSort[i], i];}
      toSort.sort(function(left, right) {
        return left[0] > right[0] ? -1 : 1; });
      toSort.sortIndices = [];
      for (var j = 0; j < toSort.length; j++) {
        toSort.sortIndices.push(toSort[j][1]);
        toSort[j] = toSort[j][0];}
      return toSort;}

    var sample_values = data.sample_values.slice();
    var otu_ids = [];
    var otu_labels = [];

    sortWithIndeces(sample_values);

    sample_values.sortIndices.forEach(i => {
      otu_ids.push(data.otu_ids[[i]]);
      otu_labels.push(data.otu_labels[[i]]);
    });

    sample_values_top10 = sample_values.slice(0,9);
    otu_ids_top10 = otu_ids.slice(0,9);
    otu_labels_top10 = otu_labels.slice(0,9);

    console.log(sample_values.sortIndices);
    console.log(sample_values_top10);
    console.log(otu_ids_top10);
    console.log(otu_labels_top10);

    var pie_data = [{
      values: sample_values_top10,
      labels: otu_ids_top10,
      hoverinfo: otu_labels_top10,
      type: 'pie'
    }];    
    Plotly.newPlot('pie', pie_data);

    var bubble_data = [{
      y: sample_values,
      x: otu_ids,
      mode: 'markers',
      marker: {
        size: sample_values,
        sizeref: 2.0 * Math.max(sample_values[0]) / (100**2),
        sizemode: 'area',
        cmin: Math.min(otu_ids),
        cmax: Math.max(otu_ids),
        color:otu_ids,
        colorscale:'Bluered'
      },
      hoverinfo: otu_labels,
      text: otu_labels
    }];    

    Plotly.newPlot('bubble', bubble_data);
});
}

function init() {
  // Grab a reference to the dropdown select element
  var selector = d3.select("#selDataset");

  // Use the list of sample names to populate the select options
  d3.json("/names").then((sampleNames) => {
    sampleNames.forEach((sample) => {
      selector
        .append("option")
        .text(sample)
        .property("value", sample);
    });

    // Use the first sample from the list to build the initial plots
    const firstSample = sampleNames[0];
    buildCharts(firstSample);
    buildMetadata(firstSample);
  });
}

function optionChanged(newSample) {
  // Fetch new data each time a new sample is selected
  buildCharts(newSample);
  buildMetadata(newSample);
}

// Initialize the dashboard
init();
