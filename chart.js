var entries = [];

function entry(artist, song, sales, rating) {
  this.artist = artist;
  this.song = song;
  this.sales = +sales;
  this.rating = [1,2,3,4,5].indexOf(rating) !== -1 ? rating : 0;
  this.chart_run = [];
  this.sales_run = [sales];
  this.el = null;
}

function refreshSales(chart_entry) {
  if (chart_entry.sales == 0) { chart_entry.sales_run.push[0]; return; }
  var weeks = chart_entry.chart_run.length;
  if (chart_entry.sales <=3000 && weeks > 10) { 
  	chart_entry.sales = Math.floor(chart_entry.sales * 100 / RA(65,150));
  	chart_entry.sales_run.push(chart_entry.sales);
  	return; 
  }
  var pos = chart_entry.chart_run[chart_entry.chart_run.length-1];
  if (pos <=10 || Math.random() > 0.2) {
  if  (weeks > 10) weeks = 10;
  var min_delta = -500*weeks, max_delta = 1000;
  if (weeks <= 5) max_delta = RA(5000, 20000);
  else max_delta = 11000 - 1000*weeks;
 
  var delta = RA(min_delta, max_delta);
  chart_entry.sales = chart_entry.sales + delta;
  
  } else chart_entry.sales = Math.floor(chart_entry.sales * 100 / RA(110,160))
  if (chart_entry.sales < 0) chart_entry.sales = RA(0,3000);
  chart_entry.sales_run.push(chart_entry.sales);
  
}

function generateNewEntry() {
  return new entry(makeWord(RA(5,15)),
                           makeWord(RA(5,20)), RA(100,
                           					   RA(1000, 
                                               RA(2000,
                           					   RA(4000,
                           					   RA(8000,	
                           					   RA(16000,
                                               RA(32000,
                                               RA(64000, 
                                               RA(128000, 256000))))))))));
  
}

function compileChart() {
  entries.forEach(function(entry) { refreshSales(entry); });
  
  var entries_count = RA(0, RA(4, RA(8, RA(12, 16))));
  for (var i=0; i<entries_count; i++) {  entries.push(generateNewEntry());
    //console.log('chart', chart[0]);
  }
  
  sortEntries(entries);
  entries.forEach(function(entry, i) { entry.chart_run.push(i+1); });	
}

function makeWord(length)
{
    var text = "";
    var possible = "ABCDEF GHIJKL MNOPQR STUVWX YZ0123 456789";

    for( var i=0; i < length; i++ )
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function RA(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function sortEntries(entries) {
  entries.sort(function(a, b) {
     return b.sales - a.sales;
  });
}

function redrawChart() {
  var ts = Date.now(), d;
  var p = 0;
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
    
    p++;
    
    if (p <= 100) {
    chart_entry.el.innerHTML = '<div class="chart-pos">'+p+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-prev-pos">'+(chart_entry.chart_run.length < 2 ? 'new' : chart_entry.chart_run[chart_entry.chart_run.length-2] )+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-artist">'+chart_entry.artist+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-song">'+chart_entry.song+'</div>';
    chart_entry.el.innerHTML += '<div class="chart-sales">('+chart_entry.sales+')</div>';
    chart_entry.el.innerHTML += '<div class="chart-run">'+chart_entry.chart_run.join("-")+'</div>';
    var top_pos = 20 + p*44;
    chart_entry.el.style.top = top_pos+'px';
    } else chart_entry.el.innerHTML = '';
    
    
  });
  d = Date.now() - ts;
  console.log('Chart redraw at '+d+' ms');
  
}

function generateChart() {
  compileChart();
  redrawChart();
}

function generateChartCustom() {
	compileChartCustom();
    redrawChart();
    resetTable();
}

function compileChartCustom() {
	entries.forEach(function(entry) { refreshSalesCustom(entry); });
	var entry_rows = document.getElementsByClassName('entry_row');
	for (var j=1; j<=entry_rows.length; j++)
	{ 
		var rating = +entry_rows[j-1].querySelectorAll('[name="rating_'+j+'"]')[0].value;
		entries.push(new entry(entry_rows[j-1].querySelectorAll('[name="artist_'+j+'"]')[0].value,
		                       entry_rows[j-1].querySelectorAll('[name="song_'+j+'"]')[0].value,
		                       RA(100, RA(1000/ (6 - rating), 10000 / (6 - rating))),
		                       rating));
	}
	
	sortEntries(entries);
    entries.forEach(function(entry, i) { entry.chart_run.push(i+1); });
}

function refreshSalesCustom(chart_entry) {
	if (chart_entry.sales == 0) { chart_entry.sales_run.push[0]; return; }
    var min = 90 + 5 * (5 - chart_entry.rating);
    var max = 150 + 50 * (5 - chart_entry.rating);
    chart_entry.sales = Math.floor(chart_entry.sales*100/RA(min,max));
    chart_entry.sales_run.push(chart_entry.sales);
}

function entryRow(i) {
	i = +i;
	var tr = document.createElement('tr');
	tr.className = 'entry_row';
	var td_artist = document.createElement('td');
	td_artist.innerHTML = 'Artist: <input type="text" name="artist_'+i+'" value=""/>';
	var td_song = document.createElement('td');
	td_song.innerHTML = 'Song: <input type="text" name="song_'+i+'" value=""/>';
	var td_rating = document.createElement('td');
	td_rating.innerHTML = 'Rating: <input type="text" name="rating_'+i+'" value=""/>';
	tr.appendChild(td_artist);
	tr.appendChild(td_song);
	tr.appendChild(td_rating);
	return tr;	
}

window.onload = function() {
	resetTable();
}

function resetTable() {
	entries_table.innerHTML = '';
	entries_table.appendChild(entryRow(1));
}

function addEntryRow() {
	entries_table.appendChild(entryRow(document.getElementsByClassName('entry_row').length + 1));
}

/*var interval;

/function runChart() {
	interval = setInterval(generateChart, 5000);
}

function pauseChart() {
	clearInterval(interval);
}*/

