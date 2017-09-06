var chart = (function() {
  
  var entries = [];
  
  var weekNumber = 0;
  
  var types = ['normal', 'fade'];
  
  var type = 'normal';
  
  var chartChance = new Chance(Math.random);
  
  var countValues = [];
  
  var countWeights = [];
  
  function init(initType) {
     if (types.indexOf(initType)!==-1) type = initType;
     generateCountWeights();	
  }
  
  function compile() {
  	 weekNumber++;
  	 var countWeightsArr = [];
  	 var entriesCount = chartChance.weighted(countValues, countWeights);
  	 for (var i=0; i< entriesCount; i++) generateNewEntry();
  	 entries.forEach(function(entry) { entry.refreshSales(weekNumber, type); });
  	 sortEntries();
  	 console.log('entries', entries);                                                                         
  }
  
  function getType() {
  	return type;
  }
  
  function getWeekNumber() {
  	return weekNumber;
  }
    
  function generateNewEntry() {
  		entries.push(new Entry({week : weekNumber}));
  }
  
  function sortEntries() {
  	   entries.sort(function(a, b) {
     		return b.salesRun[weekNumber] - a.salesRun[weekNumber];
  	   });
  	   entries.forEach(function(entry, index) {
  	   		entry.chartRun[weekNumber] = index + 1;
  	   });
  }	
  
  function getChart(week) {
  	  var ret = [], week = week || weekNumber;
  	  entries.forEach(function(entry) {
  	  	 if (entry.chartRun[week]) ret.push(entry);
  	  });
  	  ret.sort(function(a, b) {
  	  	return a.chartRun[week] - b.chartRun[week];
  	  });
  	  return ret;
  }
  
  function generateCountWeights() {
  	   var w = 0;
  	   if (type == 'fade') {
  	   		for (var i=3; i<=23; i++) countValues.push(i);
  	   		for (var j=23; j>=9; j--) {
  	   			countWeights.push(w);
  	   			w++;
  	   		}
  	   		for (var k=8; k>=3; k--) {
  	   			w--;
  	   			countWeights.push(w);
  	   		}
  	   }
  	   else {
  	   	   for (var i=0; i<=16; i++) countValues.push(i);
  	   		for (var j=16; j>=3; j--) {
  	   			countWeights.push(w);
  	   			w++;
  	   		}
  	   		for (var k=2; k>=0; k--) {
  	   			w--;
  	   			countWeights.push(w);
  	   		}
  	   }
  }
  
  return {
  	 init : init,
  	 compile : compile,
  	 getType : getType,
  	 getChart : getChart,
  	 getWeekNumber : getWeekNumber
  }
  
})();



function Entry(params) {
	this.weekEntry = params.week;
    this.chartRun = {};
    this.salesRun = {};
    this.total = 0;
    if (params.sales) {
    	this.salesRun[this.weekEntry] = +params.sales;
    }
    this.artist = params.artist || this.generateArtist();
    this.song = params.song || this.generateSong();
    
}

Entry.prototype.refreshSales = function(week, type) {
	var type = type || 'normal';
	if (!this.salesRun[week]) {
		var weeks = Object.keys(this.salesRun).length;
		if (!weeks) {
			var max_sales = this.entryChance.weighted(this.salesWeights[type].values, this.salesWeights[type].weights);
			var index = this.salesWeights[type].values.indexOf(max_sales);
			this.salesRun[week] = this.entryChance.integer({min : index ? this.salesWeights[type].values[index-1] : this.minSales[type], max : max_sales});
		}
		else {
		    var prevWeek = Math.max.apply(Math, Object.keys(this.salesRun).map(function(key) { return +key; }));
			switch(type) {
				case 'fade':
					var min = this.salesRun[prevWeek] > 100000 ? 110 : (Math.random() > 0.98 ? 40 : 95),
						max = this.entryChance.integer({min : 120, max : this.entryChance.integer({min : 150, max : 200})});
					this.salesRun[week] = Math.floor(this.salesRun[prevWeek] * 100 / this.entryChance.integer({min: min, max : max}));
				case 'normal':
					if (this.salesRun[prevWeek] <=10000 && weeks > 10) { 
  						this.salesRun[week] =  Math.floor(this.salesRun[prevWeek] * 100 / this.entryChance.integer({min : 98, 
  																		            max : this.entryChance.integer({min : 105,
  																		            max : this.entryChance.integer({min : 120, max : 150}) }) }));
  					}
  					else {
  						var pos = this.chartRun[prevWeek];
  						if (pos <=10 || Math.random() > 0.2) {
  							if  (weeks > 10) weeks = 10;
  							var min_delta = -500*weeks, max_delta = 1000;
  							if (this.salesRun[prevWeek] > 50000) {
  								min_delta = -Math.floor(this.salesRun[prevWeek]*this.salesRun[prevWeek]/500000); max_delta = 0;
  							}
  							else if (weeks <= 5) max_delta = this.entryChance.integer({ min : 5000, max :20000});
  							else max_delta = 11000 - 1000*weeks;
 
  							var delta = this.entryChance.integer({min : min_delta, max : max_delta});
 							this.salesRun[week] = -delta < this.salesRun[prevWeek] ? this.salesRun[prevWeek] + delta : 
 							                                                         this.entryChance.integer({min : 0, max : 3000});
  
  						} else this.salesRun[week] = Math.floor(this.salesRun[prevWeek] * 100 / this.entryChance.integer({min : 110, max : 160}));
  					}													            	
			}
		}
	}
	this.total+=this.salesRun[week];
}

Entry.prototype.generateArtist = function() {
	return this.entryChance.sentence({ words : this.entryChance.integer({ min : 1, max : 4}) }).slice(0,-1).toUpperCase();
}

Entry.prototype.generateSong = function() {
	return this.entryChance.sentence({ words : this.entryChance.integer({ min : 1, max : 7}) }).slice(0,-1).toUpperCase();
}

Entry.prototype.minSales = {
	normal : 100, fade : 1000
}

Entry.prototype.salesWeights = {
	normal : {
		values : [1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000],
		weights : [256,1024,4096,1024,256,64,16,4,1]
	},
	fade : {
		values : [20000,40000,80000,160000,320000],
		weights : [8,16,8,4,1]
	}

}

Entry.prototype.entryChance = new Chance(Math.random);

Entry.prototype.weeksAtTop = function() {
	var ret = 0;
	Object.keys(this.chartRun).forEach(function(week) {
		if (this.chartRun[week] == 1) ret++;
	}.bind(this));
	return ret;
}

Entry.prototype.peak = function() {
	return Math.min.apply(Math, Object.keys(this.chartRun).map(function (key) { return this.chartRun[key]; }.bind(this)));
}

Entry.prototype.chartRunStr = function() {
	var arr = Object.keys(this.chartRun).sort(function(a,b) {return (+a) - (+b); }).map(function (key) { return this.chartRun[key]; }.bind(this));
	return arr.join('-');
}

function generateNewChart() {
	chart.compile();
	redrawChart();
}

function redrawChart() {
  var ts = Date.now(), d;
  var entries = chart.getChart();
  var week = chart.getWeekNumber();
  
  entries.forEach(function(chart_entry) {
    if (!chart_entry.el) {
    	var el = document.createElement('div');
    	el.className = 'chart-item';
    	el.style.position = 'absolute';
    	el.style.left = '10px';
    	el.style.top = '4600px';
    	el.style.transition = "linear 0.5s";
    	chart_view.appendChild(el);
    	chart_entry.el = el;
    	
    }
    

    var peak_pos = chart_entry.peak();
    if (chart_entry.chartRun[week] <= 100) {
    chart_entry.el.innerHTML = '<div class="chart-pos">'+chart_entry.chartRun[week]+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-prev-pos">'+(Object.keys(chart_entry.chartRun).length < 2 ? 'new' : chart_entry.chartRun[week-1] )+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-artist">'+chart_entry.artist+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-song">'+chart_entry.song+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-sales">('+chart_entry.salesRun[week]+')</div>';
    chart_entry.el.innerHTML += '<div class="chart-weeks">'+Object.keys(chart_entry.chartRun).length+' wks</div>';
    chart_entry.el.innerHTML += '<div class="chart-total">'+formatTotal(chart_entry.total)+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-pp">PP '+peak_pos+(peak_pos == 1 ? ' ('+chart_entry.weeksAtTop()+')':'')+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-run">'+chart_entry.chartRunStr()+'</div>';
    var top_pos = 20 + chart_entry.chartRun[week]*44;
    chart_entry.el.style.top = top_pos+'px';
    } else chart_entry.el.innerHTML = '';
    
    
  });
  d = Date.now() - ts;
  console.log('Chart redraw at '+d+' ms');
  
}

function formatTotal(total) {
	var ret;
	if (total >= 1000000) { ret = total / 1000000; ret = ret.toFixed(2); ret+="M"; }
	else if (total >= 1000) { ret = total / 1000; ret = ret.toFixed(2); ret+="K"; }
	else ret = total;
	return ret;
}

chart.init('normal');



