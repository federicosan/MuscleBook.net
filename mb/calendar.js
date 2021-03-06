dc.calendarGraph = function(parent, chartGroup) {
    // http://bl.ocks.org/peterbsmith2/a37f2b733a75a6f348c2

    var _chart = dc.marginMixin(dc.colorMixin(dc.baseMixin({})));
	var _squareSize = undefined;
	var _gap = 2;
	var _daysBack = undefined;
    let _tipSelector = ".tip";

    // http://stackoverflow.com/questions/11382606
	Date.prototype.toJSONLocal = function() {
		function addZ(n) {
			return (n<10? '0' : '') + n;
		}
		return this.getFullYear() + '-' +
			addZ(this.getMonth() + 1) + '-' +
			addZ(this.getDate());
	}; 

	function makeUTCDate(dateString) {
		var d = new Date(dateString);
		return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(),  d.getUTCHours(), d.getUTCMinutes());
	}

	// http://stackoverflow.com/questions/563406
	function addDays(date, days) {
		var result = new Date(date);
		result.setDate(date.getDate() + days);
		return result;
	}

    function getValue(d) {
        return _chart.valueAccessor()(d);
    }

    function fill(d, i) {
        return _chart.getColor(d, i);
    }

	function entry(cal) {
		return !cal.entry
			? { key: cal.date, value: null }
			: cal.entry;
	}

    _chart.colorAccessor(function (d) {
        return getValue(entry(d));
    });
    
    _chart.tip = function(selector) {
        if (!arguments.length) {
            return _tipSelector;
        }
        _tipSelector = selector;
        return _chart;
    };

    _chart.daysBack = function(_) {
		if (!arguments.length) return _daysBack;
		_daysBack = _;
		return _chart;
	};

	_chart.gap = function(_) {
		if (!arguments.length) return _gap;
		_gap = _;
		return _chart;
	};

	_chart.squareSize = function(_) {
		if (!arguments.length) return _squareSize;
		_squareSize = _;
		return _chart;
	};

    // _chart.width = function(width) {
    //     if (!arguments.length) {
    //         return undefined;
    //     }
    //     return _chart;
    // };

    // _chart.height = function(height) {
    //     if (!arguments.length) {
    //         return undefined;
    //     }
    //     return _chart;
    // };

    _chart._doRedraw = function () {
        return _chart._doRender();
    };
    
    _chart._doRender = function () {
        // var numCols = Math.ceil(daysBack / 7);
		const today = new Date();
		const squareSize = calculateSquareSize(today);
		const daysBack = calculateDaysBack(today, squareSize);
		const calendar = [];
		var yAxis = [];
		var lastYear = addDays(today, -daysBack);
		var col = 0;
		var month = lastYear.getMonth();
		var first = true;
		var yAxisFormatter = d3.time.format("%b");

        // var width = 11 + (numCols * squareSize); // 1 square + 53 squares with 2px padding
		// var height = 11 + 6 * squareSize; //1 square + 6 squares with 2px padding
		// var legendX = 20;
		// var legendY = height + 10;
		// var viewboxWidth = width + _chart.margins().left + _chart.margins().right;
		// var viewboxHeight = height + _chart.margins().top + _chart.margins().bottom;
		// var aspect = viewboxWidth / viewboxHeight;

        _chart.resetSvg();
        
        let g = _chart.svg().append("g")
			.attr("transform", "translate(" + _chart.margins().left + "," + _chart.margins().top + ")" );

        for (i=0; i <= daysBack; i++) {
			dateString = lastYear.toJSONLocal();
			var date = makeUTCDate(dateString);
			var c = date.getDay();
			if (c === 0 && date.getMonth() === 0 && first) {
				month = -1;
				first = !first;
			}
			if (c === 0 && date.getMonth() > month){
				yAxis.push({
					col: col,
					month: yAxisFormatter(date)
				});
				month++;
			}
			calendar.push({
				date: date,
				entry: null,
				col: col,
			});
			lastYear = addDays(lastYear, 1);
			if (c === 6) { col++; }
		}

        g.append("text")
			.text("M")
			.style("fill", "#767676")
			.attr("text-anchor", "middle")
			.attr("dx", "-15")
			.attr("dy", (squareSize * 2) - _gap)
			.classed("axis", true);

		g.append("text")
			.text("W")
			.style("fill", "#767676")
			.attr("text-anchor", "middle")
			.attr("dx", "-15")
			.attr("dy", (squareSize * 4) - _gap)
			.classed("axis", true);

		g.append("text")
			.text("F")
			.attr("text-anchor", "middle")
			.style("fill", "#767676")
			.attr("dx", "-15")
			.attr("dy", (squareSize * 6) - _gap)
			.classed("axis", true);

		g.selectAll(".cal")
				.data(calendar)
				.enter()
			.append("rect")
				.attr("class", "cal")
				.attr("width", squareSize - _gap)
				.attr("height", squareSize - _gap)
				.attr("x", function(d, i) { return d.col * squareSize; })
				.attr("y", function(d, i) { return d.date.getDay() * squareSize; })
				.attr("fill", "#eeeeee");

		g.selectAll(".y")
				.data(yAxis)
				.enter()
			.append("text")
				.text(d => d.month)
				.attr("dy", -10)
				.attr("dx", d => d.col * squareSize)
				.attr("fill", "#767676")
				.classed("axis", true);
        
        // g.selectAll('.legend')
		// 		.data(_chart.colors().range())
		// 		.enter()
		// 	.append('rect')
		// 		.attr('class','legend')
		// 		.attr('width', squareSize - _gap)
		// 		.attr('height', squareSize - _gap)
		// 		.attr('x', (d, i) => legendX + i * squareSize + 5)
		// 		.attr('y', legendY)
		// 		.attr('fill', d => d);

		// g.append('text')
		// 	.attr('class','legend')
		// 	.attr('x', legendX - 35)
		// 	.attr('y', legendY + 10)
		// 	.text('Less')
		// 	.attr('fill','#767676');

		// g.append('text')
		// 	.attr('class','legend')
		// 	.attr('x', legendX + _chart.colors().range().length * squareSize + 10)
		// 	.attr('y', legendY + 10)
		// 	.text('More')
		// 	.attr('fill','#767676');

        var data = _chart.data();
		var events = {};
		var l = data.length;

		while(l--) {
			let eventDate = data[l].key;
			events[eventDate] = data[l];
		}

		for (var i = 0; i < calendar.length; i++) {
			if (events[calendar[i].date]){
				calendar[i].entry = events[calendar[i].date];
			}
		}

		g.selectAll(".cal")
			.attr("fill", fill)
            .on("mouseover", function (d) {
                d3.select(this)
                    .classed("highlight", true);
                d3.select(_tipSelector)
                    .attr("hidden", null)
                    .html(_chart.title()(entry(d)));
            })
            .on("mouseout", function (d) {
                d3.select(this)
                    .classed("highlight", false);
                d3.select(_tipSelector)
                    .attr("hidden", "true")
                    .text(null);
            });

        return _chart;
    };

	function calculateSquareSize(today) {
		if (_squareSize == undefined) {
			return Math.floor(_chart.effectiveHeight() / 7);
		}
		return _squareSize
    }

	function calculateDaysBack(today, squareSize) {
        if (_daysBack === undefined) {
			const cols = Math.floor(_chart.effectiveWidth() / (squareSize));
			return (cols * 7) - (7 - (today.getDay()));
        }
		return _daysBack;
    }

    return _chart.anchor(parent, chartGroup);
};
